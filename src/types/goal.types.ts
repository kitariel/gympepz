export type GoalType =
  | "strength"
  | "reps"
  | "consistency"
  | "bodyweight";

export type GoalStatus = "active" | "completed" | "abandoned";

export type GoalUnit = "lbs" | "kg" | "reps" | "workouts";

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  exerciseId?: string | null;
  targetValue: number;
  currentValue: number;
  unit: GoalUnit;
  deadline?: Date | null;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  exercise?: {
    id: string;
    name: string;
  } | null;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  value: number;
  date: Date;
  notes?: string | null;
  createdAt: Date;
}

export interface GoalProgressData {
  goalId: string;
  percentage: number;
  remaining: number;
  trend: "improving" | "declining" | "stable";
  projectedCompletion?: Date;
  history: GoalProgress[];
}
