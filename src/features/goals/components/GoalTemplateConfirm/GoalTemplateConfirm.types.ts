import type { GoalTemplate } from "@/lib/goal-templates";

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
  onTargetChange: (v: string) => void;
  onCurrentChange: (v: string) => void;
  onDeadlineChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};
