/**
 * Type definitions for workout log page
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface WorkoutSet {
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

export interface ExerciseGroup {
  exercise: Exercise;
  sets: WorkoutSet[];
  exerciseLogId: string | null;
}

export interface SetUpdateData {
  actualReps?: number;
  actualWeight?: number;
  rpe?: number;
}

export interface LastWorkoutData {
  weight: number;
  reps: number;
  date: Date;
}
