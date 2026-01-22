"use client";

import {
  GOAL_TEMPLATE_CATEGORIES,
  type GoalTemplate,
} from "@/lib/goal-templates";
import type { GoalTemplateCardProps, GoalTemplateCardViewModel } from "./GoalTemplateCard.types";
import { GoalTemplateCardView } from "./GoalTemplateCard.view";

function formatTargetLabel(t: GoalTemplate): string {
  if (t.unit === "workouts") {
    return `${t.targetValue} workouts`;
  }
  if (t.unit === "reps") {
    return `${t.targetValue} reps`;
  }
  if (t.targetValue < 0) {
    return `${Math.abs(t.targetValue)} ${t.unit} (lose)`;
  }
  return `${t.targetValue} ${t.unit}`;
}

export function GoalTemplateCardContainer({
  template,
  onSelect,
}: GoalTemplateCardProps) {
  const categoryConfig = GOAL_TEMPLATE_CATEGORIES[template.category];
  const viewModel: GoalTemplateCardViewModel = {
    name: template.name,
    description: template.description,
    targetLabel: formatTargetLabel(template),
    icon: template.icon,
    categoryLabel: categoryConfig.label,
    onSelect: () => onSelect(template),
  };
  return <GoalTemplateCardView {...viewModel} />;
}
