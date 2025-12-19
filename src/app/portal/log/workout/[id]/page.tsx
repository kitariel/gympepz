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
      console.error("Failed to complete workout:", error);
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
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">
              {workout.planDay?.title ?? "Workout"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {format(new Date(workout.date), "EEEE, MMM d")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono font-medium tabular-nums">
              {elapsedTime}
            </span>
          </div>
          <Button
            onClick={handleFinish}
            disabled={completeWorkout.isPending || !logId}
            size="sm"
            className="bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white disabled:opacity-50"
          >
            {completeWorkout.isPending ? "Finishing..." : "Finish Workout"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-24 space-y-4">
        {/* Info about current mode */}
        {Object.keys(exerciseGroups).length > 0 && (
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              Using exercise-level tracking. You can edit reps, weight, and sets per exercise. Individual set tracking will be available after database migration.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-6 text-xs"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Quick Stats */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Sets</p>
                  <p className="text-lg font-bold">
                    {completedSets}/{totalSets}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="text-lg font-bold">{Math.round(totalVolume)} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Exercises</p>
                  <p className="text-lg font-bold">
                    {Object.keys(exerciseGroups).length}
                  </p>
                </div>
              </div>
              {workout.lastWorkout && (
                <Badge variant="outline" className="text-xs">
                  Last: {format(new Date(workout.lastWorkout.date), "MMM d")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Notes */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4">
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
              className="resize-none"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
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

        {/* Add Exercise Button */}
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full py-8 border-dashed">
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
              />
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {exercises.data?.map((ex) => (
                  <Button
                    key={ex.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleAddExercise(ex.id)}
                  >
                    <div className="flex items-center gap-2 text-left">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
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
