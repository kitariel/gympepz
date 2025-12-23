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
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

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
    { enabled: isAddingExercise && exerciseSearch.length > 0 }
  );

  // Note: workoutSet router is currently disabled, so we use workoutLogExercise mutations
  // These mutations work with the current database schema
  const deleteExercise = api.workoutLog.deleteExercise.useMutation({
    onSuccess: () => utils.workoutLog.getWithHistory.invalidate({ id: logId }),
  });

  const addExerciseMutation = api.workoutLog.addExercise.useMutation({
    onSuccess: () => {
      utils.workoutLog.getWithHistory.invalidate({ id: logId });
      setIsAddingExercise(false);
      setExerciseSearch("");
    },
  });

  const updateExerciseMutation = api.workoutLog.updateExercise.useMutation({
    onSuccess: () => utils.workoutLog.getWithHistory.invalidate({ id: logId }),
  });

  const completeWorkout = api.workoutLog.complete.useMutation({
    onSuccess: () => {
      // Invalidate queries before redirecting
      utils.workoutLog.list.invalidate();
      utils.workoutLog.getWithHistory.invalidate({ id: logId });
      router.push("/portal/log");
    },
    onError: (error) => {
      // Error is handled by the Alert component showing error state
      setError(
        error.message || "Failed to complete workout. Please try again."
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
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
  const exerciseGroups = (() => {
    // If sets exist (WorkoutSet[]), use them
    if (workout.sets && Array.isArray(workout.sets) && workout.sets.length > 0) {
      return workout.sets.reduce(
        (acc, set) => {
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
        {} as Record<string, { exercise: any; sets: any[]; exerciseLogId: string | null }>
      );
    }
    
    // Otherwise, use exercises (WorkoutLogExercise[]) and create mock sets
    if (workout.exercises && Array.isArray(workout.exercises)) {
      return workout.exercises.reduce(
        (acc, exerciseLog) => {
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
                actualReps: exerciseLog.reps ?? 0,
                targetWeight: exerciseLog.weight,
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
        {} as Record<string, { exercise: any; sets: any[]; exerciseLogId: string | null }>
      );
    }
    
    return {};
  })();

  // Calculate stats
  const allSets = Object.values(exerciseGroups).flatMap((group) => group.sets);
  const totalVolume = allSets.reduce((sum, set) => {
    return sum + ((set.actualWeight ?? set.targetWeight ?? 0) * (set.actualReps ?? set.targetReps ?? 0));
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
      notes: notes || workout.notes || undefined,
    });
  };

  // Handle set updates (for mock sets, update via workoutLogExercise)
  const handleUpdateSet = (setId: string, data: any) => {
    const set = allSets.find((s) => s.id === setId);
    if (!set) return;

    if (set.isMock && set.exerciseLogId) {
      // Update via workoutLogExercise
      updateExerciseMutation.mutate({
        id: set.exerciseLogId,
        reps: data.actualReps ?? set.actualReps,
        weight: data.actualWeight ?? set.actualWeight,
        rpe: data.rpe ?? set.rpe,
      });
    } else {
      // Real sets - workoutSet router is disabled, so show message
      setError("Set-by-set editing requires database migration. Please edit at exercise level.");
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
      const exerciseLog = workout.exercises?.find((e) => e.id === exerciseLogId);
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
      const exerciseLog = workout.exercises?.find((e) => e.id === exerciseLogId);
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
  const handleDeleteExercise = (exerciseId: string, exerciseLogId: string | null) => {
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
    <div className="flex flex-col h-screen">
      {/* Header - Mobile, Tablet & Desktop Optimized */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 md:p-5">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="h-9 w-9 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-base sm:text-lg md:text-xl truncate">
                {workout.planDay?.title ?? "Workout"}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground truncate">
                {format(new Date(workout.date), "EEEE, MMM d")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 px-2.5 sm:px-3 md:px-3 py-1.5 sm:py-1.5 md:py-2 bg-muted/50 rounded-md md:rounded-lg">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 text-muted-foreground shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-mono font-medium tabular-nums">
                {elapsedTime}
              </span>
            </div>
            <Button
              onClick={handleFinish}
              disabled={completeWorkout.isPending || !logId}
              size="sm"
              className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white disabled:opacity-50 h-9 sm:h-8 md:h-9 text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 shrink-0"
            >
              {completeWorkout.isPending ? "Finishing..." : "Finish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Mobile, Tablet & Desktop Optimized */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 pb-20 sm:pb-24 md:pb-24 space-y-3 sm:space-y-4 md:space-y-5">
        {/* Info about current mode */}
        {Object.keys(exerciseGroups).length > 0 && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 shrink-0" />
            <AlertDescription className="text-xs md:text-sm">
              Using exercise-level tracking. You can edit reps, weight, and sets per exercise. Individual set tracking will be available after database migration.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
            <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 md:h-8 text-xs md:text-sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Quick Stats - Mobile, Tablet & Desktop Optimized */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-3 sm:pt-4 md:pt-5 pb-3 sm:pb-4 px-3 sm:px-4 md:px-5">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:flex lg:items-center lg:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Sets</p>
                <p className="text-base sm:text-lg md:text-xl font-bold">
                  {completedSets}/{totalSets}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Volume</p>
                <p className="text-base sm:text-lg md:text-xl font-bold">{Math.round(totalVolume)} kg</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Exercises</p>
                <p className="text-base sm:text-lg md:text-xl font-bold">
                  {Object.keys(exerciseGroups).length}
                </p>
              </div>
              {workout.lastWorkout && (
                <div className="col-span-3 sm:col-span-1 lg:flex lg:justify-end flex justify-center sm:justify-end mt-2 sm:mt-0 lg:mt-0">
                  <Badge variant="outline" className="text-[10px] sm:text-xs md:text-sm">
                    Last: {format(new Date(workout.lastWorkout.date), "MMM d")}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Notes - Mobile, Tablet & Desktop Optimized */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
            <Textarea
              placeholder="Add workout notes..."
              value={notes || workout.notes ?? ""}
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
              className="resize-none text-sm md:text-base"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Exercises - Mobile, Tablet & Desktop Optimized */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          {Object.entries(exerciseGroups).map(([exerciseId, { exercise, sets, exerciseLogId }]) => {
            // Find last workout data for this exercise
            const lastWorkoutSet = workout.lastWorkout?.sets?.find(
              (s) => s.exerciseId === exerciseId && s.completed
            ) || workout.lastWorkout?.exercises?.find(
              (e) => e.exerciseId === exerciseId
            );

            const isMarkedDone = completedExercises.has(exerciseId);

            return (
              <ExerciseCard
                key={exerciseId}
                exerciseName={exercise.name}
                muscleGroup={exercise.muscleGroup}
                exerciseId={exerciseId}
                sets={sets.map((s: any) => ({
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
                        weight: (lastWorkoutSet as any).actualWeight ?? (lastWorkoutSet as any).weight ?? 0,
                        reps: (lastWorkoutSet as any).actualReps ?? (lastWorkoutSet as any).reps ?? 0,
                        date: workout.lastWorkout!.date,
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
                onDeleteExercise={() => handleDeleteExercise(exerciseId, exerciseLogId)}
                onStartRestTimer={() => restTimer.start(180)}
              />
            );
          })}
        </div>

        {/* Add Exercise Button - Mobile, Tablet & Desktop Optimized */}
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full py-6 sm:py-7 md:py-8 border-dashed text-sm sm:text-base md:text-lg touch-manipulation">
              <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] md:w-full max-h-[85vh] sm:max-h-[80vh] md:max-h-[75vh]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 md:space-y-5 pt-4 md:pt-5">
              <Input
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="text-sm sm:text-base md:text-base h-10 sm:h-9 md:h-10"
              />
              <div className="max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto space-y-1.5 sm:space-y-2 md:space-y-2.5 -mx-1 px-1">
                {exercises.data?.map((ex) => (
                  <Button
                    key={ex.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2.5 sm:py-2.5 md:py-3 text-left touch-manipulation"
                    onClick={() => handleAddExercise(ex.id)}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 md:gap-3.5 text-left w-full">
                      <Dumbbell className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base md:text-lg truncate">{ex.name}</p>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                          {ex.muscleGroup}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
                {exerciseSearch && exercises.data?.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
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
