import { GOAL_TEMPLATE_CATEGORIES } from "@/lib/goal-template-categories";
import type {
  GoalTemplate,
  GoalTemplateCategory,
} from "@/types/goal-template.types";

export const GOAL_TEMPLATE_CATEGORY_ORDER: GoalTemplateCategory[] = [
  "strength",
  "reps",
  "consistency",
  "bodyweight",
];

export function groupGoalTemplatesByCategory(
  templates: GoalTemplate[],
): Array<{
  id: GoalTemplateCategory;
  label: string;
  icon: GoalTemplate["icon"];
  templates: GoalTemplate[];
}> {
  const map: Record<GoalTemplateCategory, GoalTemplate[]> = {
    strength: [],
    reps: [],
    consistency: [],
    bodyweight: [],
  };

  for (const template of templates) {
    map[template.category].push(template);
  }

  return GOAL_TEMPLATE_CATEGORY_ORDER.map((id) => ({
    id,
    label: GOAL_TEMPLATE_CATEGORIES[id].label,
    icon: GOAL_TEMPLATE_CATEGORIES[id].icon,
    templates: map[id],
  })).filter((group) => group.templates.length > 0);
}
