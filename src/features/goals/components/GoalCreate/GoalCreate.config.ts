import {
  Calendar,
  Dumbbell,
  Repeat,
  Scale,
} from "lucide-react";

import type { GoalTypeOption, GoalTypeValue, GoalUnitOption } from "./GoalCreate.types";

export const GOAL_TYPES: GoalTypeOption[] = [
  {
    value: "strength",
    label: "Strength",
    icon: Dumbbell,
    description: "Lift a target weight",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500",
    requiresExercise: true,
  },
  {
    value: "reps",
    label: "Reps",
    icon: Repeat,
    description: "Hit a rep count",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500",
    requiresExercise: true,
  },
  {
    value: "consistency",
    label: "Consistency",
    icon: Calendar,
    description: "Complete workouts",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500",
    requiresExercise: false,
  },
  {
    value: "bodyweight",
    label: "Bodyweight",
    icon: Scale,
    description: "Reach a target weight",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500",
    requiresExercise: false,
  },
];

export const UNITS: Record<GoalTypeValue, GoalUnitOption[]> = {
  strength: [
    { value: "kg", label: "kg" },
    { value: "lbs", label: "lbs" },
  ],
  reps: [{ value: "reps", label: "reps" }],
  consistency: [{ value: "workouts", label: "workouts" }],
  bodyweight: [
    { value: "kg", label: "kg" },
    { value: "lbs", label: "lbs" },
  ],
};

export function getGoalTypeConfig(value: GoalTypeValue): GoalTypeOption | undefined {
  return GOAL_TYPES.find((t) => t.value === value);
}
