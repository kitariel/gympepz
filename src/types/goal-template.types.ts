import type { GoalType, GoalUnit } from "@/types/goal.types";

export type GoalTemplateCategory =
  | "strength"
  | "reps"
  | "consistency"
  | "bodyweight";

export type GoalTemplateIcon = "dumbbell" | "flame" | "target" | "scale";

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: GoalTemplateCategory;
  icon: GoalTemplateIcon;
  type: GoalType;
  exerciseId?: string | null;
  /** Exercise name for lookup (e.g. "Bench Press"). Used to resolve exerciseId. */
  exerciseName?: string | null;
  targetValue: number;
  unit: GoalUnit;
  /** Suggested deadline in days from now (e.g. 90 = 3 months). */
  suggestedDeadlineDays?: number | null;
}
