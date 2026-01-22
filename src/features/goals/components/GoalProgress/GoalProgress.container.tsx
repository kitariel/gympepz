"use client";

import { useMemo } from "react";
import { format } from "date-fns";

import { useGoal } from "@/hooks/useGoals";
import type { GoalProgressProps, GoalProgressViewModel } from "./GoalProgress.types";
import { GoalProgressView } from "./GoalProgress.view";

export function GoalProgressContainer({ goalId }: GoalProgressProps) {
  const { goal, progress } = useGoal(goalId);

  const viewModel: GoalProgressViewModel | null = useMemo(() => {
    if (!goal) return null;

    const progressPercentage = progress?.percentage ?? 0;
    const exerciseName = goal.exercise?.name ?? "";
    let title = "";
    let subtitle = "";

    switch (goal.type) {
      case "strength":
        title = exerciseName || "Strength Goal";
        subtitle = `Target: ${goal.targetValue} ${goal.unit}`;
        break;
      case "reps":
        title = exerciseName || "Reps Goal";
        subtitle = `Target: ${goal.targetValue} reps`;
        break;
      case "consistency":
        title = "Consistency Goal";
        subtitle = `Target: ${goal.targetValue} workouts`;
        break;
      case "bodyweight":
        title = "Bodyweight Goal";
        subtitle = `Target: ${goal.targetValue} ${goal.unit}`;
        break;
      default:
        title = "Goal";
        subtitle = `Target: ${goal.targetValue} ${goal.unit}`;
    }

    const history = (progress?.history ?? []).map((p) => ({
      date: format(new Date(p.date), "MMM d, yyyy"),
      value: p.value,
    }));

    return {
      title,
      subtitle,
      progress: progressPercentage,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
      unit: goal.unit,
      trend: progress?.trend,
      history,
    };
  }, [goal, progress]);

  if (!viewModel) return null;

  return <GoalProgressView {...viewModel} />;
}
