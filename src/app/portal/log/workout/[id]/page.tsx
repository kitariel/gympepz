"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, ArrowLeft, Clock, Dumbbell } from "lucide-react";
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
import { ExerciseCard } from "./_components/exercise-card";
import { RestTimer } from "./_components/rest-timer";
import { useWorkoutTimer, useRestTimer } from "@/hooks/useWorkoutTimer";

export default function ActiveWorkoutPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const logId = params.id;
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);

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

  // Workout Set mutations
  const updateSet = api.workoutSet.update.useMutation({
    onSuccess: () => utils.workoutLog.getWithHistory.invalidate({ id: logId }),
  });

  const completeSet = api.workoutSet.complete.useMutation({
    onSuccess: () => {
      utils.workoutLog.getWithHistory.invalidate({ id: logId });
      // Start rest timer (3 minutes default)
      restTimer.start(180);
    },
  });

  const addSet = api.workoutSet.duplicate.useMutation({
    onSuccess: () => utils.workoutLog.getWithHistory.invalidate({ id: logId }),
  });

  const deleteSet = api.workoutSet.delete.useMutation({
    onSuccess: () => utils.workoutLog.getWithHistory.invalidate({ id: logId }),
  });

  const deleteExercise = api.workoutLog.deleteExercise.useMutation({
    onSuccess: () => utils.workoutLog.getWithHistory.invalidate({ id: logId }),
  });

  const addExerciseToWorkout = api.workoutSet.create.useMutation({
    onSuccess: () => {
      utils.workoutLog.getWithHistory.invalidate({ id: logId });
      setIsAddingExercise(false);
      setExerciseSearch("");
    },
  });

  const completeWorkout = api.workoutLog.complete.useMutation({
    onSuccess: () => router.push("/portal/log"),
  });

  // Auto-save duration every minute
  const updateDuration = api.workoutLog.updateDuration.useMutation();

  useEffect(() => {
    const interval = setInterval(() => {
      if (elapsedSeconds > 0 && elapsedSeconds % 60 === 0) {
        updateDuration.mutate({
          id: logId,
          duration: Math.floor(elapsedSeconds / 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [elapsedSeconds, logId, updateDuration]);

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

  // Group sets by exercise
  const exerciseGroups = workout.sets.reduce(
    (acc, set) => {
      const exerciseId = set.exerciseId;
      if (!acc[exerciseId]) {
        acc[exerciseId] = {
          exercise: set.exercise,
          sets: [],
        };
      }
      acc[exerciseId].sets.push(set);
      return acc;
    },
    {} as Record<string, { exercise: any; sets: any[] }>
  );

  // Calculate stats
  const totalVolume = workout.sets.reduce((sum, set) => {
    return sum + (set.actualWeight ?? 0) * set.actualReps;
  }, 0);

  const completedSets = workout.sets.filter((s) => s.completed).length;
  const totalSets = workout.sets.length;

  const handleFinish = () => {
    completeWorkout.mutate({
      id: logId,
      completed: true,
      duration: Math.floor(elapsedSeconds / 60),
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
            disabled={completeWorkout.isPending}
            size="sm"
          >
            {completeWorkout.isPending ? "Finishing..." : "Finish Workout"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 pb-24 space-y-4">
        {/* Quick Stats */}
        <Card>
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
                <Badge variant="outline">
                  Last: {format(new Date(workout.lastWorkout.date), "MMM d")}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Notes */}
        <Card>
          <CardContent className="pt-4">
            <Textarea
              placeholder="Add workout notes..."
              defaultValue={workout.notes ?? ""}
              onBlur={(e) =>
                completeWorkout.mutate({ id: logId, notes: e.target.value })
              }
              className="resize-none"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          {Object.entries(exerciseGroups).map(([exerciseId, { exercise, sets }]) => {
            // Find last workout data for this exercise
            const lastWorkoutSet = workout.lastWorkout?.sets?.find(
              (s) => s.exerciseId === exerciseId && s.completed
            );

            return (
              <ExerciseCard
                key={exerciseId}
                exerciseName={exercise.name}
                muscleGroup={exercise.muscleGroup}
                sets={sets.map((s: any) => ({
                  id: s.id,
                  setNumber: s.setNumber,
                  targetReps: s.targetReps,
                  targetWeight: s.targetWeight,
                  actualReps: s.actualReps,
                  actualWeight: s.actualWeight,
                  rpe: s.rpe,
                  completed: s.completed,
                }))}
                lastWorkoutData={
                  lastWorkoutSet
                    ? {
                        weight: lastWorkoutSet.actualWeight ?? 0,
                        reps: lastWorkoutSet.actualReps,
                        date: workout.lastWorkout!.date,
                      }
                    : undefined
                }
                onUpdateSet={(setId, data) =>
                  updateSet.mutate({ id: setId, ...data })
                }
                onCompleteSet={(setId) => {
                  const set = sets.find((s) => s.id === setId);
                  if (set) {
                    completeSet.mutate({
                      id: setId,
                      actualReps: set.actualReps,
                      actualWeight: set.actualWeight,
                      rpe: set.rpe,
                    });
                  }
                }}
                onAddSet={() => {
                  const lastSet = sets[sets.length - 1];
                  if (lastSet) {
                    addSet.mutate({ id: lastSet.id });
                  }
                }}
                onDeleteSet={(setId) => deleteSet.mutate({ id: setId })}
                onDeleteExercise={() => {
                  // Delete all sets for this exercise
                  sets.forEach((set: any) => {
                    deleteSet.mutate({ id: set.id });
                  });
                }}
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
                    onClick={() => {
                      // Add first set for this exercise
                      addExerciseToWorkout.mutate({
                        workoutLogId: logId,
                        exerciseId: ex.id,
                        setNumber: 1,
                        targetReps: 10,
                        actualReps: 0,
                        restSeconds: 180,
                      });
                    }}
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
