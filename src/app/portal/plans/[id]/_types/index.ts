/**
 * Types and interfaces for the Plan Detail page
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

export interface PlanExercise {
  id: string;
  sets: number;
  reps: number;
  weight: number | null;
  exerciseId: string;
  order?: number; // Order within the plan day
  exercise: Exercise | null;
}

export interface PlanDay {
  id: string;
  title: string;
  order: number;
  items: PlanExercise[];
  isRestDay?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  days: PlanDay[];
}

