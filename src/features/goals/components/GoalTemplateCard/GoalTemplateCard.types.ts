import type { GoalTemplate } from "@/types/goal-template.types";

export type GoalTemplateCardProps = {
  template: GoalTemplate;
  onSelect: (template: GoalTemplate) => void;
};

export type GoalTemplateCardViewModel = {
  name: string;
  description: string;
  targetLabel: string;
  icon: "dumbbell" | "flame" | "target" | "scale";
  categoryLabel: string;
  onSelect: () => void;
};
