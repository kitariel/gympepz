/**
 * Hook for workout action handlers
 */

import { useMemo } from "react";
import type React from "react";
import type { RouterInputs, RouterOutputs } from "@/trpc/react";
import type { ExerciseGroup, SetUpdateData, WorkoutSet } from "../_types";

type WorkoutWithHistory = RouterOutputs["workoutLog"]["getWithHistory"];

type WorkoutWithOptionalSets = WorkoutWithHistory & {
  sets?: WorkoutSet[];
};

type UpdateExerciseInput = RouterInputs["workoutLog"]["updateExercise"];
type AddExerciseInput = RouterInputs["workoutLog"]["addExercise"];
type DeleteExerciseInput = RouterInputs["workoutLog"]["deleteExercise"];

interface UseWorkoutHandlersParams {
  logId: string;
  workout: WorkoutWithOptionalSets | null | undefined;
  exerciseGroups: Record<string, ExerciseGroup>;
  updateExerciseMutation: { mutate: (input: UpdateExerciseInput) => void };
  addExerciseMutation: { mutate: (input: AddExerciseInput) => void };
  deleteExercise: { mutate: (input: DeleteExerciseInput) => void };
  setError: (error: string | null) => void;
  restTimer: {
    start: (seconds: number) => void;
  };
  completedSets: Set<string>;
  setCompletedSets: React.Dispatch<React.SetStateAction<Set<string>>>;
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
  completedSets: _completedSets,
  setCompletedSets,
}: UseWorkoutHandlersParams) {
  const allSets = useMemo<WorkoutSet[]>(() => {
    if (!workout) return [];

    if (
      workout.sets &&
      Array.isArray(workout.sets) &&
      workout.sets.length > 0
    ) {
      return workout.sets;
    }
    // Flatten sets from exercise groups
    return Object.values(exerciseGroups ?? {}).flatMap(
      (group) => group.sets || [],
    );
  }, [workout, exerciseGroups]);

  const handleUpdateSet = (setId: string, data: SetUpdateData) => {
    const set = allSets.find((s) => s.id === setId);
    if (!set) return;

    const exerciseLog = workout?.exercises?.find(
      (e) => e.exerciseId === set.exerciseId,
    );
    const isFromPlan =
      typeof exerciseLog?.id === "string" && exerciseLog.id.startsWith("plan-");

    if (set.isMock) {
      if (set.exerciseLogId && !isFromPlan) {
        // Update existing workoutLogExercise
        updateExerciseMutation.mutate({
          id: set.exerciseLogId,
          reps: data.actualReps ?? set.actualReps ?? 0,
          weight: data.actualWeight ?? set.actualWeight ?? undefined,
          rpe: data.rpe ?? set.rpe ?? undefined,
        });
      } else if (isFromPlan || !set.exerciseLogId) {
        // Exercise is from plan - convert it to a logged exercise first
        const actualRepsValue =
          data.actualReps ?? exerciseLog?.reps ?? set.actualReps ?? 0;
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
    const set = allSets.find((s) => s.id === setId);
    if (!set) return;

    if (set.isMock) {
      // Mark set as completed in local state
      setCompletedSets((prev) => {
        const next = new Set(prev);
        next.add(setId);
        return next;
      });

      // For mock sets, we need to update the exercise log with the set's data
      // The actual completion is tracked at the exercise level
      // We'll update the exercise with the current set values
      if (set.exerciseLogId) {
        updateExerciseMutation.mutate({
          id: set.exerciseLogId,
          reps: set.actualReps ?? set.targetReps ?? 0,
          weight: set.actualWeight ?? set.targetWeight ?? undefined,
          rpe: set.rpe ?? undefined,
        });
      }
      // Start rest timer after marking set as complete
      restTimer.start(180);
    } else {
      setError("Set completion requires database migration.");
    }
  };

  const handleAddSet = (_exerciseId: string, exerciseLogId: string | null) => {
    if (exerciseLogId) {
      const exerciseLog = workout?.exercises?.find(
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

  const handleDeleteSet = (setId: string, exerciseLogId: string | null) => {
    const set = allSets.find((s) => s.id === setId);
    if (!set) return;

    if (set.isMock && exerciseLogId) {
      const exerciseLog = workout?.exercises?.find(
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

  const handleDeleteExercise = (
    _exerciseId: string,
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
