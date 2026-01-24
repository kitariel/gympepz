import type { LucideIcon } from "lucide-react";

export type GoalTypeValue = "strength" | "reps" | "consistency" | "bodyweight";

export type GoalTypeOption = {
  value: GoalTypeValue;
  label: string;
  icon: LucideIcon;
  description: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  requiresExercise: boolean;
};

export type GoalUnitOption = {
  value: string;
  label: string;
};

export type GoalCreateViewModel = {
  isAuthenticated: boolean;
  isCreating: boolean;
  type: GoalTypeValue;
  exerciseId: string | null;
  exerciseName: string | null;
  targetValue: string;
  unit: string;
  deadline: string;
  error: string | null;
  goalTypes: GoalTypeOption[];
  units: GoalUnitOption[];
  requiresExercise: boolean;
  paths: {
    backToGoals: string;
    cancel: string;
    login: string;
  };
  onTypeChange: (type: GoalTypeValue) => void;
  onExerciseChange: (exerciseId: string | null, exerciseName: string | null) => void;
  onTargetChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onDeadlineChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};
