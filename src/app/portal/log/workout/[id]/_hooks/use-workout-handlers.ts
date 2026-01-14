/**
 * Hook for workout action handlers
 */

import { useMemo } from "react";
import type { SetUpdateData } from "../_types";

interface UseWorkoutHandlersParams {
  logId: string;
  workout: any;
  exerciseGroups: Record<string, any>;
  updateExerciseMutation: any;
  addExerciseMutation: any;
  deleteExercise: any;
  setError: (error: string | null) => void;
  restTimer: {
    start: (seconds: number) => void;
  };
}

export function useWorkoutHandlers({
  logId,
  workout,
  exerciseGroups,
  updateExerciseMutation,
  addExerciseMutation,
  deleteExercise,
  setError,
  restTimer,
}: UseWorkoutHandlersParams) {
  const allSets = useMemo(() => {
    if (!workout) return [];

    const w = workout as any;
    if (w.sets && Array.isArray(w.sets) && w.sets.length > 0) {
      return w.sets;
    }
    // Flatten sets from exercise groups
    return Object.values(exerciseGroups ?? {}).flatMap(
      (group: any) => group?.sets || [],
    );
  }, [workout, exerciseGroups]);

  const handleUpdateSet = (setId: string, data: SetUpdateData) => {
    const set = allSets.find((s: any) => s.id === setId);
    if (!set) return;

    const exerciseLog = (workout as any)?.exercises?.find(
      (e: any) => e.exerciseId === set.exerciseId,
    );
    const isFromPlan =
      exerciseLog?.isFromPlan || exerciseLog?.id?.startsWith("plan-");

    if (set.isMock) {
      if (set.exerciseLogId && !isFromPlan) {
        // Update existing workoutLogExercise
        updateExerciseMutation.mutate({
          id: set.exerciseLogId,
          reps: data.actualReps ?? (set.actualReps ?? 0),
          weight: data.actualWeight ?? set.actualWeight ?? undefined,
          rpe: data.rpe ?? set.rpe ?? undefined,
        });
      } else if (isFromPlan || !set.exerciseLogId) {
        // Exercise is from plan - convert it to a logged exercise first
        const actualRepsValue =
          data.actualReps ?? exerciseLog?.reps ?? (set.actualReps ?? 0);
        addExerciseMutation.mutate({
          workoutLogId: logId,
          exerciseId: set.exerciseId,
          sets:
            exerciseLog?.sets ??
            (actualRepsValue > 0 ? Math.max(1, actualRepsValue) : 1),
          reps: actualRepsValue,
          weight:
            data.actualWeight ??
            exerciseLog?.weight ??
            set.actualWeight ??
            undefined,
          rpe: data.rpe ?? set.rpe ?? undefined,
        });
      }
    } else {
      setError(
        "Set-by-set editing requires database migration. Please edit at exercise level.",
      );
    }
  };

  const handleCompleteSet = (setId: string) => {
    const set = allSets.find((s: any) => s.id === setId);
    if (!set) return;

    if (set.isMock) {
      restTimer.start(180);
    } else {
      setError("Set completion requires database migration.");
    }
  };

  const handleAddSet = (exerciseId: string, exerciseLogId: string | null) => {
    if (exerciseLogId) {
      const exerciseLog = (workout as any)?.exercises?.find(
        (e: any) => e.id === exerciseLogId,
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

  const handleDeleteSet = (setId: string, exerciseLogId: string | null) => {
    const set = allSets.find((s: any) => s.id === setId);
    if (!set) return;

    if (set.isMock && exerciseLogId) {
      const exerciseLog = (workout as any)?.exercises?.find(
        (e: any) => e.id === exerciseLogId,
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

  const handleDeleteExercise = (
    exerciseId: string,
    exerciseLogId: string | null,
  ) => {
    if (exerciseLogId) {
      deleteExercise.mutate({ id: exerciseLogId });
    } else {
      setError("Deleting exercises requires database migration.");
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    addExerciseMutation.mutate({
      workoutLogId: logId,
      exerciseId,
      sets: 1,
      reps: 10,
      weight: undefined,
    });
  };

  return {
    handleUpdateSet,
    handleCompleteSet,
    handleAddSet,
    handleDeleteSet,
    handleDeleteExercise,
    handleAddExercise,
  };
}
