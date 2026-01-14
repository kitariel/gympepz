/**
 * Utility functions for exercise data transformation and grouping
 */

import type { Exercise, ExerciseGroup, WorkoutSet } from "../_types";

/**
 * Creates mock sets from exercise log data
 */
export function createMockSetsFromExercise(
  exerciseLog: {
    id: string;
    exerciseId: string;
    sets: number;
    reps: number | null;
    weight: number | null;
    rpe: number | null;
    exercise: Exercise | null;
  },
): WorkoutSet[] {
  if (!exerciseLog.exercise) {
    return [];
  }

  const numSets = Math.max(1, exerciseLog.sets || 1);
  const sets: WorkoutSet[] = [];

  for (let i = 0; i < numSets; i++) {
    sets.push({
      id: `mock-${exerciseLog.id}-${i}`,
      exerciseId: exerciseLog.exerciseId,
      exerciseLogId: exerciseLog.id,
      setNumber: i + 1,
      targetReps: exerciseLog.reps ?? 0,
      targetWeight: exerciseLog.weight ?? null,
      actualReps: exerciseLog.reps ?? 0,
      actualWeight: exerciseLog.weight ?? null,
      rpe: exerciseLog.rpe ?? null,
      completed: false,
      exercise: exerciseLog.exercise,
      isMock: true,
    });
  }

  return sets;
}

/**
 * Groups exercises by exercise log ID from workout sets
 */
export function groupExercisesFromSets(
  sets: WorkoutSet[],
): Record<string, ExerciseGroup> {
  return sets.reduce(
    (acc: Record<string, ExerciseGroup>, set: WorkoutSet) => {
      const key = (set as any).exerciseLogId ?? set.exerciseId;
      acc[key] ??= {
        exercise: set.exercise,
        sets: [],
        exerciseLogId: (set as any).exerciseLogId ?? null,
      };
      acc[key]!.sets.push(set);
      return acc;
    },
    {} as Record<string, ExerciseGroup>,
  );
}

/**
 * Groups exercises from workout log exercises
 */
export function groupExercisesFromLogs(
  exercises: Array<{
    id: string;
    exerciseId: string;
    sets: number;
    reps: number | null;
    weight: number | null;
    rpe: number | null;
    exercise: Exercise | null;
  }>,
): Record<string, ExerciseGroup> {
  return exercises
    .filter((exerciseLog) => exerciseLog.exercise != null)
    .reduce(
      (acc: Record<string, ExerciseGroup>, exerciseLog) => {
        if (!exerciseLog.exercise) {
          return acc;
        }

        const key = exerciseLog.id;
        acc[key] = {
          exercise: exerciseLog.exercise,
          sets: createMockSetsFromExercise(exerciseLog),
          exerciseLogId: exerciseLog.id,
        };
        return acc;
      },
      {} as Record<string, ExerciseGroup>,
    );
}

/**
 * Converts plan day items to workout exercise format
 */
export function convertPlanItemsToExercises(
  items: Array<{
    id: string;
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number | null;
    order: number | null;
    exercise: Exercise | null;
  }>,
  workoutLogId: string,
  createdAt: Date,
): Array<{
  id: string;
  workoutLogId: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number | null;
  rpe: null;
  notes: null;
  order: number;
  createdAt: Date;
  isFromPlan: boolean;
}> {
  return items
    .filter((item) => item.exercise != null)
    .map((item, index) => ({
      id: `plan-${item.id}`,
      workoutLogId,
      exerciseId: item.exerciseId,
      exercise: item.exercise!,
      sets: item.sets,
      reps: item.reps,
      weight: item.weight,
      rpe: null,
      notes: null,
      order: item.order ?? index,
      createdAt,
      isFromPlan: true,
    }));
}
