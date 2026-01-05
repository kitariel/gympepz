/**
 * Types and interfaces for the Start Workout page
 */

export type BodyPart = "Push" | "Pull" | "Legs";

export interface ExerciseConfig {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface DayPlan {
  title: string;
  bodyPart: BodyPart;
  exercises: ExerciseConfig[];
}

export type RestDayAction = "skip" | "add" | "mark";

export const BODY_PARTS: BodyPart[] = ["Push", "Pull", "Legs"];

export const BODY_PART_DESCRIPTIONS: Record<BodyPart, string> = {
  Push: "Chest, Shoulders, Triceps",
  Pull: "Back, Biceps, Rear Delts",
  Legs: "Quads, Hamstrings, Glutes, Calves",
};

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayName = (typeof DAY_NAMES)[number];

