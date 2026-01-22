export type GoalProgressViewModel = {
  title: string;
  subtitle: string;
  progress: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend?: "improving" | "declining" | "stable";
  history: { date: string; value: number }[];
};

export type GoalProgressProps = {
  goalId: string;
};
