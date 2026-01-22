"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useGoal } from "@/hooks/useGoals";
import type { GoalCardProps, GoalCardViewModel } from "./GoalCard.types";
import { GoalCardView } from "./GoalCard.view";

export function GoalCardContainer({
  goal,
  onView,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const router = useRouter();
  const { progress } = useGoal(goal.id);

  const viewModel: GoalCardViewModel = useMemo(() => {
    const progressPercentage = progress?.percentage ?? 0;
    const exerciseName = goal.exercise?.name ?? "";

    let title = "";
    let subtitle = "";

    switch (goal.type) {
      case "strength":
        title = exerciseName || "Strength Goal";
        subtitle = `${goal.currentValue} ${goal.unit} / ${goal.targetValue} ${goal.unit}`;
        break;
      case "reps":
        title = exerciseName || "Reps Goal";
        subtitle = `${goal.currentValue} reps / ${goal.targetValue} reps`;
        break;
      case "consistency":
        title = "Consistency Goal";
        subtitle = `${goal.currentValue} workouts / ${goal.targetValue} workouts`;
        break;
      case "bodyweight":
        title = "Bodyweight Goal";
        subtitle = `${goal.currentValue} ${goal.unit} / ${goal.targetValue} ${goal.unit}`;
        break;
      default:
        title = "Goal";
        subtitle = `${goal.currentValue} / ${goal.targetValue} ${goal.unit}`;
    }

    return {
      id: goal.id,
      title,
      subtitle,
      goalType: goal.type,
      progress: progressPercentage,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
      unit: goal.unit,
      deadline: goal.deadline,
      status: goal.status as "active" | "completed" | "abandoned",
      trend: progress?.trend,
      onView: () => {
        onView?.(goal.id);
        router.push(`/portal/goals/${goal.id}`);
      },
      onEdit: onEdit ? () => onEdit(goal.id) : undefined,
      onDelete: onDelete ? () => onDelete(goal.id) : undefined,
    };
  }, [goal, progress, router, onView, onEdit, onDelete]);

  return <GoalCardView {...viewModel} />;
}
