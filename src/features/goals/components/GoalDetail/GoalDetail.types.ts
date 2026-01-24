import type { LucideIcon } from "lucide-react";
import type { Goal } from "@/types/goal.types";
import type { GoalProgressData } from "@/features/goals/components/GoalProgress/GoalProgress.types";

export type GoalDetailViewProps =
  | { state: "loading" }
  | {
      state: "error";
      message: string;
      backHref: string;
      onRetry: () => void;
    }
  | {
      state: "missing";
      backHref: string;
    }
  | {
      state: "ready";
      goal: Goal;
      progress?: GoalProgressData | null;
      goalTitle: string;
      goalTypeLabel: string;
      goalTypeColorClass: string;
      GoalTypeIcon: LucideIcon;
      isCompleted: boolean;
      goalType: Goal["type"];
      backHref: string;
      workoutHref: string;
      progressDialogOpen: boolean;
      onProgressDialogChange: (open: boolean) => void;
      progressValue: string;
      progressNotes: string;
      isRecording: boolean;
      onProgressValueChange: (value: string) => void;
      onProgressNotesChange: (value: string) => void;
      onRecordProgress: () => void;
      editDialogOpen: boolean;
      onEditDialogChange: (open: boolean) => void;
      editTargetValue: string;
      editDeadline: string;
      isUpdating: boolean;
      onEditTargetValueChange: (value: string) => void;
      onEditDeadlineChange: (value: string) => void;
      onEditGoal: () => void;
      onAbandonGoal: () => void;
      isDeleting: boolean;
      onDeleteGoal: () => void;
    };
