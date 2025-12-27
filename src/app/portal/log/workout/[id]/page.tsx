"use client";

import { useState, useEffect, use, useRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft, Clock, Dumbbell, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExerciseCard } from "./_components/exercise-card";
import { RestTimer } from "./_components/rest-timer";
import { useWorkoutTimer, useRestTimer } from "@/hooks/useWorkoutTimer";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseLogId: string | null;
  setNumber: number;
  targetReps: number;
  targetWeight: number | null;
  actualReps: number | null;
  actualWeight: number | null;
  rpe: number | null;
  completed: boolean;
  exercise: Exercise;
  isMock?: boolean;
}

interface ExerciseGroup {
  exercise: Exercise;
  sets: WorkoutSet[];
  exerciseLogId: string | null;
}

interface SetUpdateData {
  actualReps?: number;
  actualWeight?: number;
  rpe?: number;
}

export default function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: logId } = use(params);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const lastSavedMinute = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set(),
  );

  // Timers
  const { elapsedTime, elapsedSeconds } = useWorkoutTimer(true);
  const restTimer = useRestTimer();

  const utils = api.useUtils();
  const log = api.workoutLog.getWithHistory.useQuery({
    id: logId,
    includeLastWorkout: true,
  });

  const exercises = api.exercise.list.useQuery(
    { q: exerciseSearch, take: 10 },
    { enabled: isAddingExercise && exerciseSearch.length > 0 },
  );

  // Note: workoutSet router is currently disabled, so we use workoutLogExercise mutations
  // These mutations work with the current database schema
  const deleteExercise = api.workoutLog.deleteExercise.useMutation({
    onSuccess: async () => {
      await utils.workoutLog.getWithHistory.invalidate({ id: logId });
    },
  });

  const addExerciseMutation = api.workoutLog.addExercise.useMutation({
    onSuccess: async () => {
      await utils.workoutLog.getWithHistory.invalidate({ id: logId });
      setIsAddingExercise(false);
      setExerciseSearch("");
    },
  });

  const updateExerciseMutation = api.workoutLog.updateExercise.useMutation({
    onSuccess: async () => {
      await utils.workoutLog.getWithHistory.invalidate({ id: logId });
    },
  });

  const completeWorkout = api.workoutLog.complete.useMutation({
    onSuccess: async () => {
      // Invalidate queries before redirecting
      await utils.workoutLog.list.invalidate();
      await utils.workoutLog.getWithHistory.invalidate({ id: logId });
      router.push("/portal/log");
    },
    onError: (error) => {
      // Error is handled by the Alert component showing error state
      setError(
        error.message || "Failed to complete workout. Please try again.",
      );
    },
  });

  // Auto-save duration every minute (improved logic)
  const updateDuration = api.workoutLog.updateDuration.useMutation();

  useEffect(() => {
    const currentMinute = Math.floor(elapsedSeconds / 60);
    if (currentMinute > lastSavedMinute.current && elapsedSeconds > 0) {
      lastSavedMinute.current = currentMinute;
      updateDuration.mutate({
        id: logId,
        duration: currentMinute,
      });
    }
  }, [elapsedSeconds, logId, updateDuration]);

  // Initialize notes from workout data when workout loads
  useEffect(() => {
    if (log.data?.notes && !notes) {
      setNotes(log.data.notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log.data?.notes]);

  if (log.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!log.data) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Workout not found</p>
        <Button onClick={() => router.push("/portal/log")} className="mt-4">
          Back to Logs
        </Button>
      </div>
    );
  }

  const workout = log.data;

  // Group sets by exercise - handle both sets and exercises
  const exerciseGroups: Record<string, ExerciseGroup> = (() => {
    const w = workout as unknown;
    // If sets exist (WorkoutSet[]), use them
    if (w.sets && Array.isArray(w.sets) && w.sets.length > 0) {
      return w.sets.reduce(
        (acc: Record<string, ExerciseGroup>, set: WorkoutSet) => {
          const exerciseId = set.exerciseId;
          if (!acc[exerciseId]) {
            acc[exerciseId] = {
              exercise: set.exercise,
              sets: [],
              exerciseLogId: null,
            };
          }
          acc[exerciseId].sets.push(set);
          return acc;
        },
        {} as Record<string, ExerciseGroup>,
      );
    }

    // Otherwise, use exercises (WorkoutLogExercise[]) and create mock sets
    if (w.exercises && Array.isArray(w.exercises)) {
      return w.exercises.reduce(
        (acc: Record<string, ExerciseGroup>, exerciseLog: unknown) => {
          const exerciseId = exerciseLog.exerciseId;
          if (!acc[exerciseId]) {
            acc[exerciseId] = {
              exercise: exerciseLog.exercise,
              sets: [],
              exerciseLogId: exerciseLog.id,
            };
            // Create mock sets from exercise data
            for (let i = 0; i < exerciseLog.sets; i++) {
              acc[exerciseId].sets.push({
                id: `mock-${exerciseLog.id}-${i}`,
                exerciseId,
                exerciseLogId: exerciseLog.id,
                setNumber: i + 1,
                targetReps: exerciseLog.reps,
                targetWeight: exerciseLog.weight,
                actualReps: exerciseLog.reps ?? 0,
                actualWeight: exerciseLog.weight,
                rpe: exerciseLog.rpe,
                completed: false,
                exercise: exerciseLog.exercise,
                isMock: true,
              });
            }
          }
          return acc;
        },
        {} as Record<string, ExerciseGroup>,
      );
    }

    return {} as Record<string, ExerciseGroup>;
  })();

  // Calculate stats
  const allSets = Object.values(exerciseGroups).flatMap(
    (group: ExerciseGroup) => group.sets,
  );
  const totalVolume = allSets.reduce((sum, set) => {
    return (
      sum +
      (set.actualWeight ?? set.targetWeight ?? 0) *
        (set.actualReps ?? set.targetReps ?? 0)
    );
  }, 0);

  const completedSets = allSets.filter((s) => s.completed).length;
  const totalSets = allSets.length;

  const handleFinish = () => {
    // Ensure duration is at least 1 minute if workout was started
    const duration = Math.max(1, Math.floor(elapsedSeconds / 60));

    completeWorkout.mutate({
      id: logId,
      completed: true,
      duration: duration,
      notes: (notes || workout.notes) ?? undefined,
    });
  };

  // Handle set updates (for mock sets, update via workoutLogExercise)
  const handleUpdateSet = (setId: string, data: SetUpdateData) => {
    const set = allSets.find((s) => s.id === setId);
    if (!set) return;

    if (set.isMock && set.exerciseLogId) {
      // Update via workoutLogExercise
      updateExerciseMutation.mutate({
        id: set.exerciseLogId,
        reps: data.actualReps ?? set.actualReps ?? 0,
        weight: data.actualWeight ?? set.actualWeight ?? undefined,
        rpe: data.rpe ?? set.rpe ?? undefined,
      });
    } else {
      // Real sets - workoutSet router is disabled, so show message
      setError(
        "Set-by-set editing requires database migration. Please edit at exercise level.",
      );
    }
  };

  // Handle set completion (for mock sets, just start rest timer)
  const handleCompleteSet = (setId: string) => {
    const set = allSets.find((s) => s.id === setId);
    if (!set) return;

    if (set.isMock) {
      // For mock sets, just start rest timer
      // The actual completion is tracked at exercise level
      restTimer.start(180);
    } else {
      // Real sets - workoutSet router is disabled
      setError("Set completion requires database migration.");
    }
  };

  // Handle add set (increment sets count for exercise)
  const handleAddSet = (exerciseId: string, exerciseLogId: string | null) => {
    if (exerciseLogId) {
      // Increment sets count
      const exerciseLog = workout.exercises?.find(
        (e) => e.id === exerciseLogId,
      );
      if (exerciseLog) {
        updateExerciseMutation.mutate({
          id: exerciseLogId,
          sets: exerciseLog.sets + 1,
        });
      }
    } else {
      setError("Adding sets requires database migration.");
    }
  };

  // Handle delete set (decrement sets count for exercise)
  const handleDeleteSet = (setId: string, exerciseLogId: string | null) => {
    const set = allSets.find((s) => s.id === setId);
    if (!set) return;

    if (set.isMock && exerciseLogId) {
      // Decrement sets count
      const exerciseLog = workout.exercises?.find(
        (e) => e.id === exerciseLogId,
      );
      if (exerciseLog && exerciseLog.sets > 1) {
        updateExerciseMutation.mutate({
          id: exerciseLogId,
          sets: exerciseLog.sets - 1,
        });
      }
    } else {
      setError("Deleting sets requires database migration.");
    }
  };

  // Handle delete exercise
  const handleDeleteExercise = (
    exerciseId: string,
    exerciseLogId: string | null,
  ) => {
    if (exerciseLogId) {
      // Delete via workoutLogExercise
      deleteExercise.mutate({ id: exerciseLogId });
    } else {
      setError("Deleting exercises requires database migration.");
    }
  };

  // Handle add exercise
  const handleAddExercise = (exerciseId: string) => {
    // Use workoutLogExercise (always available)
    addExerciseMutation.mutate({
      workoutLogId: logId,
      exerciseId,
      sets: 1,
      reps: 10,
      weight: undefined,
    });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header - Mobile, Tablet & Desktop Optimized */}
      <div className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 md:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 shrink-0 sm:h-8 sm:w-8 md:h-9 md:w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold tracking-tight sm:text-lg md:text-xl">
                {workout.planDay?.title ?? "Workout"}
              </h1>
              <p className="text-muted-foreground/70 truncate text-xs font-medium tracking-wider uppercase sm:text-sm md:text-base">
                {format(new Date(workout.date), "EEEE, MMM d")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3 md:gap-4">
            <div className="bg-muted/50 ring-border/50 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ring-1 sm:gap-2 sm:px-3 sm:py-1.5 md:gap-2.5 md:rounded-lg md:px-3 md:py-2">
              <Clock className="text-muted-foreground h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 md:h-4 md:w-4" />
              <span className="font-mono text-xs font-medium tabular-nums sm:text-sm md:text-base">
                {elapsedTime}
              </span>
            </div>
            <Button
              onClick={handleFinish}
              disabled={completeWorkout.isPending || !logId}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 shrink-0 px-3 text-xs font-semibold disabled:opacity-50 sm:h-8 sm:px-4 sm:text-sm md:h-9 md:px-5 md:text-base"
            >
              {completeWorkout.isPending ? "Finishing..." : "Finish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Mobile, Tablet & Desktop Optimized */}
      <div className="flex-1 space-y-3 overflow-auto p-3 pb-20 sm:space-y-4 sm:p-4 sm:pb-24 md:space-y-5 md:p-6 md:pb-24">
        {/* Info about current mode */}
        {Object.keys(exerciseGroups).length > 0 && (
          <Alert className="border-primary/20 bg-primary/5 text-primary">
            <AlertCircle className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
            <AlertDescription className="text-xs md:text-sm">
              Using exercise-level tracking. You can edit reps, weight, and sets
              per exercise. Individual set tracking will be available after
              database migration.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 dark:bg-red-950/20"
          >
            <AlertCircle className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
            <AlertDescription className="text-xs md:text-sm">
              {error}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs md:h-8 md:text-sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Quick Stats - Mobile, Tablet & Desktop Optimized */}
        <Card className="ring-border bg-card border-0 shadow-sm ring-1">
          <CardContent className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 md:px-5 md:pt-5">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:flex lg:items-center lg:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm">
                  Sets
                </p>
                <p className="text-base font-bold sm:text-lg md:text-xl">
                  {completedSets}/{totalSets}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm">
                  Volume
                </p>
                <p className="text-base font-bold sm:text-lg md:text-xl">
                  {Math.round(totalVolume)}{" "}
                  <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                    kg
                  </span>
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm">
                  Exercises
                </p>
                <p className="text-base font-bold sm:text-lg md:text-xl">
                  {Object.keys(exerciseGroups).length}
                </p>
              </div>
              {workout.lastWorkout && (
                <div className="col-span-3 mt-2 flex justify-center sm:col-span-1 sm:mt-0 sm:justify-end lg:mt-0 lg:flex lg:justify-end">
                  <Badge
                    variant="outline"
                    className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs md:text-sm"
                  >
                    Last: {format(new Date(workout.lastWorkout.date), "MMM d")}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Notes - Mobile, Tablet & Desktop Optimized */}
        <Card className="ring-border bg-card border-0 shadow-sm ring-1">
          <CardContent className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 md:px-5 md:pt-5 md:pb-5">
            <Textarea
              placeholder="Add workout notes..."
              value={(notes || workout.notes) ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={(e) => {
                setNotes(e.target.value);
                // Optionally save notes immediately on blur
                if (e.target.value !== workout.notes) {
                  completeWorkout.mutate({
                    id: logId,
                    notes: e.target.value,
                    completed: workout.completed,
                  });
                }
              }}
              className="border-border/50 focus:border-primary/50 bg-muted/20 resize-none text-sm md:text-base"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Exercises - Mobile, Tablet & Desktop Optimized */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          {Object.entries(exerciseGroups).map(([exerciseId, group]) => {
            const { exercise, sets, exerciseLogId } = group;
            // Find last workout data for this exercise
            const w = workout as unknown as {
              lastWorkout?: {
                sets?: {
                  exerciseId: string;
                  actualWeight?: number | null;
                  actualReps?: number | null;
                  completed?: boolean | null;
                }[];
                exercises?: {
                  exerciseId: string;
                  weight?: number | null;
                  reps?: number | null;
                }[];
              };
            };
            const lastWorkoutSet =
              w.lastWorkout?.sets?.find(
                (s) => s.exerciseId === exerciseId && s.completed,
              ) ??
              w.lastWorkout?.exercises?.find(
                (e) => e.exerciseId === exerciseId,
              );

            const isMarkedDone = completedExercises.has(exerciseId);

            return (
              <ExerciseCard
                key={exerciseId}
                exerciseName={exercise.name}
                muscleGroup={exercise.muscleGroup}
                exerciseId={exerciseId}
                sets={sets.map((s) => ({
                  id: s.id,
                  setNumber: s.setNumber,
                  targetReps: s.targetReps,
                  targetWeight: s.targetWeight,
                  actualReps: s.actualReps ?? 0,
                  actualWeight: s.actualWeight,
                  rpe: s.rpe,
                  completed: s.completed ?? false,
                }))}
                lastWorkoutData={
                  lastWorkoutSet
                    ? {
                        weight:
                          lastWorkoutSet.actualWeight ??
                          lastWorkoutSet.weight ??
                          0,
                        reps:
                          lastWorkoutSet.actualReps ?? lastWorkoutSet.reps ?? 0,
                        date: w.lastWorkout!.date,
                      }
                    : undefined
                }
                isMarkedDone={isMarkedDone}
                onToggleDone={() => {
                  const newCompleted = new Set(completedExercises);
                  if (isMarkedDone) {
                    newCompleted.delete(exerciseId);
                  } else {
                    newCompleted.add(exerciseId);
                  }
                  setCompletedExercises(newCompleted);
                }}
                onUpdateSet={(setId, data) => handleUpdateSet(setId, data)}
                onCompleteSet={(setId) => {
                  handleCompleteSet(setId);
                  restTimer.start(180);
                }}
                onAddSet={() => handleAddSet(exerciseId, exerciseLogId)}
                onDeleteSet={(setId) => handleDeleteSet(setId, exerciseLogId)}
                onDeleteExercise={() =>
                  handleDeleteExercise(exerciseId, exerciseLogId)
                }
                onStartRestTimer={() => restTimer.start(180)}
              />
            );
          })}
        </div>

        {/* Add Exercise Button - Mobile, Tablet & Desktop Optimized */}
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="hover:border-primary/50 hover:bg-primary/5 group w-full touch-manipulation border-2 border-dashed py-6 text-sm transition-all sm:py-7 sm:text-base md:py-8 md:text-lg"
            >
              <Plus className="text-muted-foreground group-hover:text-primary mr-2 h-4 w-4 transition-colors md:h-5 md:w-5" />
              <span className="text-muted-foreground group-hover:text-primary transition-colors">
                Add Exercise
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl sm:max-h-[80vh] sm:w-[calc(100vw-3rem)] md:max-h-[75vh] md:w-full">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">
                Add Exercise
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 md:space-y-5 md:pt-5">
              <Input
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="h-10 text-sm sm:h-9 sm:text-base md:h-10 md:text-base"
              />
              <div className="-mx-1 max-h-[300px] space-y-1.5 overflow-y-auto px-1 sm:max-h-[400px] sm:space-y-2 md:max-h-[500px] md:space-y-2.5">
                {exercises.data?.map((ex) => (
                  <Button
                    key={ex.id}
                    variant="ghost"
                    className="h-auto w-full touch-manipulation justify-start py-2.5 text-left sm:py-2.5 md:py-3"
                    onClick={() => handleAddExercise(ex.id)}
                  >
                    <div className="flex w-full items-center gap-2.5 text-left sm:gap-3 md:gap-3.5">
                      <Dumbbell className="text-muted-foreground h-4 w-4 shrink-0 md:h-5 md:w-5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium sm:text-base md:text-lg">
                          {ex.name}
                        </p>
                        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                          {ex.muscleGroup}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
                {exerciseSearch && exercises.data?.length === 0 && (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No exercises found.
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rest Timer Overlay */}
      {restTimer.isActive && (
        <RestTimer
          remainingSeconds={restTimer.remainingSeconds}
          isActive={restTimer.isActive}
          onPause={restTimer.pause}
          onResume={restTimer.resume}
          onCancel={restTimer.cancel}
          onAddTime={restTimer.addTime}
        />
      )}
    </div>
  );
}
