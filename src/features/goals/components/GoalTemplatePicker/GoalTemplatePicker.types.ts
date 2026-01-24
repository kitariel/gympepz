import type {
  GoalTemplate,
  GoalTemplateCategory,
} from "@/types/goal-template.types";

export type GoalTemplatePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomGoal: () => void;
  onGoalCreated?: (goalId: string) => void;
};

export type GoalTemplatePickerViewModel = {
  step: "grid" | "confirm";
  selectedTemplate: GoalTemplate | null;
  categories: Array<{
    id: GoalTemplateCategory;
    label: string;
    templates: GoalTemplate[];
  }>;
  onSelectTemplate: (template: GoalTemplate) => void;
  onCustomGoal: () => void;
  onConfirmBack: () => void;
  onConfirmSuccess: (goalId: string) => void;
};
