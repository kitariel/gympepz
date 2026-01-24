import type { Goal } from "@/types/goal.types";

export type GoalProgressData = {
  percentage: number;
  trend?: "improving" | "declining" | "stable";
  history: { date: Date | string; value: number }[];
};

export type GoalProgressViewModel = {
  title: string;
  subtitle: string;
  progress: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend?: "improving" | "declining" | "stable";
  history: { date: string; value: number }[];
  isLoading?: boolean;
};

export type GoalProgressProps = {
  goalId: string;
  goal?: Goal | null;
  progress?: GoalProgressData | null;
  progressLoading?: boolean;
};
