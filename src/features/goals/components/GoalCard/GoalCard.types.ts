import type { Goal, GoalType } from "@/types/goal.types";

export type GoalCardViewModel = {
  id: string;
  title: string;
  subtitle: string;
  goalType: GoalType;
  progress: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline?: Date | null;
  status: "active" | "completed" | "abandoned";
  trend?: "improving" | "declining" | "stable";
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export type GoalCardProps = {
  goal: Goal;
  onView?: (goalId: string) => void;
  onEdit?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
};
