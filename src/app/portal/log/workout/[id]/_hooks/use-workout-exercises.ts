/**
 * Hook to manage workout exercises from multiple sources
 * Combines logged exercises with plan exercises as fallback
 */

import { useMemo } from "react";
import type { ExerciseGroup } from "../_types";
import {
  groupExercisesFromSets,
  groupExercisesFromLogs,
  convertPlanItemsToExercises,
} from "../_utils/exercise-utils";

interface UseWorkoutExercisesParams {
  workout: any;
  todaysWorkout: any;
}

export function useWorkoutExercises({
  workout,
  todaysWorkout,
}: UseWorkoutExercisesParams) {
  const exerciseGroups: Record<string, ExerciseGroup> = useMemo(() => {
    if (!workout) {
      return {};
    }

    const w = workout as any;

    // Priority 1: Use sets if they exist (WorkoutSet[])
    if (w.sets && Array.isArray(w.sets) && w.sets.length > 0) {
      return groupExercisesFromSets(w.sets);
    }

    // Priority 2: Use logged exercises (WorkoutLogExercise[])
    if (w.exercises && Array.isArray(w.exercises) && w.exercises.length > 0) {
      return groupExercisesFromLogs(w.exercises);
    }

    // Priority 3: Use planDay items if available
    if (w.planDay?.items && Array.isArray(w.planDay.items) && w.planDay.items.length > 0) {
      const planExercises = convertPlanItemsToExercises(
        w.planDay.items,
        w.id,
        w.createdAt,
      );
      return groupExercisesFromLogs(planExercises);
    }

    // Priority 4: Use today's workout from active plan as last resort
    if (
      todaysWorkout?.data?.todayWorkout?.exercises &&
      Array.isArray(todaysWorkout.data.todayWorkout.exercises) &&
      todaysWorkout.data.todayWorkout.exercises.length > 0
    ) {
      // Convert today's workout exercises to the format we need
      const planExercises = todaysWorkout.data.todayWorkout.exercises.map(
        (item: any, index: number) => ({
          id: `plan-today-${item.id}`,
          workoutLogId: w.id,
          exerciseId: item.exerciseId,
          exercise: {
            id: item.exerciseId,
            name: item.exerciseName || "Unknown Exercise",
            muscleGroup: item.muscleGroup || "Unknown",
          },
          sets: item.sets || 1,
          reps: item.reps || 0,
          weight: item.weight || null,
          rpe: null,
          notes: null,
          order: index,
          createdAt: w.createdAt || new Date(),
          isFromPlan: true,
        }),
      );
      return groupExercisesFromLogs(planExercises);
    }

    return {};
  }, [workout, todaysWorkout]);

  // Get all exercises array for easy access (matching what's in exerciseGroups)
  const exercises = useMemo(() => {
    if (!workout) {
      return [];
    }
    const w = workout as any;

    // Priority 1: Use logged exercises if they exist
    if (w.exercises && Array.isArray(w.exercises) && w.exercises.length > 0) {
      return w.exercises;
    }

    // Priority 2: Use planDay items if available
    if (w.planDay?.items && Array.isArray(w.planDay.items) && w.planDay.items.length > 0) {
      return convertPlanItemsToExercises(
        w.planDay.items,
        w.id,
        w.createdAt,
      );
    }

    // Priority 3: Use today's workout from active plan as last resort
    if (
      todaysWorkout?.data?.todayWorkout?.exercises &&
      Array.isArray(todaysWorkout.data.todayWorkout.exercises) &&
      todaysWorkout.data.todayWorkout.exercises.length > 0
    ) {
      return todaysWorkout.data.todayWorkout.exercises.map(
        (item: any, index: number) => ({
          id: `plan-today-${item.id}`,
          workoutLogId: w.id,
          exerciseId: item.exerciseId,
          exercise: {
            id: item.exerciseId,
            name: item.exerciseName || "Unknown Exercise",
            muscleGroup: item.muscleGroup || "Unknown",
          },
          sets: item.sets || 1,
          reps: item.reps || 0,
          weight: item.weight || null,
          rpe: null,
          notes: null,
          order: index,
          createdAt: w.createdAt || new Date(),
          isFromPlan: true,
        }),
      );
    }

    return [];
  }, [workout, todaysWorkout]);

  return {
    exerciseGroups,
    exercises,
  };
}
