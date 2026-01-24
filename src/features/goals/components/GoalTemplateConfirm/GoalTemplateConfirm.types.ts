import type { GoalTemplate } from "@/types/goal-template.types";

export type GoalTemplateConfirmProps = {
  template: GoalTemplate;
  onBack: () => void;
  onSuccess: (goalId: string) => void;
};

export type GoalTemplateConfirmViewModel = {
  templateName: string;
  targetValue: number;
  unit: string;
  suggestedDeadlineDays?: number;
  exerciseName?: string;
  type: GoalTemplate["type"];
  targetInput: string;
  currentInput: string;
  deadlineInput: string;
  error: string | null;
  isSubmitting: boolean;
  customGoalHref?: string;
  onTargetChange: (v: string) => void;
  onCurrentChange: (v: string) => void;
  onDeadlineChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};
