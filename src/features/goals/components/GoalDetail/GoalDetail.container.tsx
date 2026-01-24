"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dumbbell, Repeat, Calendar, Scale } from "lucide-react";

import { useGoal, useGoalMutations } from "@/hooks/useGoals";
import type { GoalDetailViewProps } from "./GoalDetail.types";
import { GoalDetailView } from "./GoalDetail.view";

const GOAL_TYPE_CONFIG = {
  strength: { icon: Dumbbell, label: "Strength", color: "bg-blue-500" },
  reps: { icon: Repeat, label: "Reps", color: "bg-green-500" },
  consistency: { icon: Calendar, label: "Consistency", color: "bg-purple-500" },
  bodyweight: { icon: Scale, label: "Bodyweight", color: "bg-orange-500" },
} as const;

// Container: manages goal data fetching and action handlers.
export function GoalDetailContainer({ goalId }: { goalId: string }) {
  const router = useRouter();
  const { goal, progress, isLoading, error, refetch } = useGoal(goalId);
  const {
    recordProgress,
    update,
    delete: deleteGoal,
    isUpdating,
    isDeleting,
  } = useGoalMutations();

  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTargetValue, setEditTargetValue] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const handleRecordProgress = useCallback(async () => {
    const value = Number.parseFloat(progressValue);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Please enter a valid value");
      return;
    }

    setIsRecording(true);
    try {
      await recordProgress({
        goalId,
        value,
        notes: progressNotes || undefined,
      });
      toast.success("Progress recorded!");
      setProgressDialogOpen(false);
      setProgressValue("");
      setProgressNotes("");
      refetch();
    } catch (err) {
      toast.error("Failed to record progress");
      console.error(err);
    } finally {
      setIsRecording(false);
    }
  }, [goalId, progressValue, progressNotes, recordProgress, refetch]);

  const handleEditDialogChange = useCallback(
    (open: boolean) => {
      if (open && goal) {
        setEditTargetValue(String(goal.targetValue));
        setEditDeadline(
          goal.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : "",
        );
      }
      setEditDialogOpen(open);
    },
    [goal],
  );

  const handleEditGoal = useCallback(async () => {
    const value = Number.parseFloat(editTargetValue);
    if (Number.isNaN(value) || value <= 0) {
      toast.error("Please enter a valid target value");
      return;
    }

    try {
      await update({
        id: goalId,
        targetValue: value,
        deadline: editDeadline ? new Date(editDeadline) : null,
      });
      toast.success("Goal updated!");
      setEditDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error("Failed to update goal");
      console.error(err);
    }
  }, [editTargetValue, editDeadline, update, goalId, refetch]);

  const handleAbandonGoal = useCallback(async () => {
    try {
      await update({
        id: goalId,
        status: "abandoned",
      });
      toast.success("Goal marked as abandoned");
      router.push("/portal/goals");
    } catch (err) {
      toast.error("Failed to abandon goal");
      console.error(err);
    }
  }, [update, goalId, router]);

  const handleDeleteGoal = useCallback(async () => {
    try {
      await deleteGoal({ id: goalId });
      toast.success("Goal deleted");
      router.push("/portal/goals");
    } catch (err) {
      toast.error("Failed to delete goal");
      console.error(err);
    }
  }, [deleteGoal, goalId, router]);

  const viewProps: GoalDetailViewProps = (() => {
    if (isLoading) return { state: "loading" };
    if (error) {
      return {
        state: "error",
        message: error.message || "Something went wrong. Please try again.",
        backHref: "/portal/goals",
        onRetry: () => void refetch(),
      };
    }
    if (!goal) {
      return { state: "missing", backHref: "/portal/goals" };
    }

    const goalType = goal.type as keyof typeof GOAL_TYPE_CONFIG;
    const config = GOAL_TYPE_CONFIG[goalType] ?? GOAL_TYPE_CONFIG.strength;
    const goalTitle = goal.exercise?.name ?? config.label;
    const isCompleted = goal.status === "completed";

    return {
      state: "ready",
      goal,
      progress,
      goalTitle,
      goalTypeLabel: config.label,
      goalTypeColorClass: config.color,
      GoalTypeIcon: config.icon,
      isCompleted,
      goalType,
      backHref: "/portal/goals",
      workoutHref: "/portal/train/log",
      progressDialogOpen,
      onProgressDialogChange: setProgressDialogOpen,
      progressValue,
      progressNotes,
      isRecording,
      onProgressValueChange: setProgressValue,
      onProgressNotesChange: setProgressNotes,
      onRecordProgress: handleRecordProgress,
      editDialogOpen,
      onEditDialogChange: handleEditDialogChange,
      editTargetValue,
      editDeadline,
      isUpdating,
      onEditTargetValueChange: setEditTargetValue,
      onEditDeadlineChange: setEditDeadline,
      onEditGoal: handleEditGoal,
      onAbandonGoal: handleAbandonGoal,
      isDeleting,
      onDeleteGoal: handleDeleteGoal,
    };
  })();

  return <GoalDetailView {...viewProps} />;
}
