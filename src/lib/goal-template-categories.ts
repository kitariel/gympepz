import type {
  GoalTemplateCategory,
  GoalTemplateIcon,
} from "@/types/goal-template.types";

export const GOAL_TEMPLATE_CATEGORIES: Record<
  GoalTemplateCategory,
  { label: string; icon: GoalTemplateIcon }
> = {
  strength: { label: "Strength", icon: "dumbbell" },
  reps: { label: "Reps", icon: "flame" },
  consistency: { label: "Consistency", icon: "target" },
  bodyweight: { label: "Bodyweight", icon: "scale" },
};
