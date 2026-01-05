/**
 * Custom hook for workout start event handlers
 */

import { useRouter } from "next/navigation";
import type { RestDayAction } from "../_types";
import type { useStartWorkout } from "./use-start-workout";

interface UseWorkoutStartHandlersProps {
  userId: string;
  hooks: ReturnType<typeof useStartWorkout>;
  setShowWarningDialog: (show: boolean) => void;
  setShowRestDayDialog: (show: boolean) => void;
}

export function useWorkoutStartHandlers({
  userId,
  hooks,
  setShowWarningDialog,
  setShowRestDayDialog,
}: UseWorkoutStartHandlersProps) {
  const router = useRouter();
  const { todaysWorkout, activeWorkout, recentWorkoutCheck, quickStart, toggleRestDay } = hooks;

  const handleStartWorkout = () => {
    if (!userId) return;

    // Check if there's already an active workout - redirect to it
    if (activeWorkout.data && !activeWorkout.data.completed) {
      router.push(`/portal/log/workout/${activeWorkout.data.id}`);
      return;
    }

    // Check if today's workout has exercises first
    const hasExercises =
      todaysWorkout.data?.todayWorkout?.exercises &&
      todaysWorkout.data.todayWorkout.exercises.length > 0;

    // If there are exercises, allow starting (exercises take priority over isRestDay flag)
    if (hasExercises) {
      // Check if there's a recent completed workout
      if (recentWorkoutCheck.data?.hasRecentWorkout) {
        setShowWarningDialog(true);
        return;
      }
      quickStart.mutate({ userId });
      return;
    }

    // No exercises - check if it's marked as rest day or show dialog
    if (todaysWorkout.data?.todayWorkout) {
      setShowRestDayDialog(true);
      return;
    }

    // No workout scheduled - proceed anyway
    quickStart.mutate({ userId });
  };

  const handleRestDayChoice = async (action: RestDayAction) => {
    setShowRestDayDialog(false);

    if (action === "skip") {
      // User confirms it's a rest day - just close the dialog
      return;
    } else if (action === "mark") {
      // User wants to mark today as rest day
      if (todaysWorkout.data?.todayWorkout?.id) {
        await toggleRestDay.mutateAsync({
          id: todaysWorkout.data.todayWorkout.id,
        });
        await todaysWorkout.refetch();
      }
      return;
    } else {
      // User wants to add exercises - redirect to plan editor
      const { plan } = todaysWorkout.data ?? {};
      if (plan) {
        router.push(`/portal/plans/${plan.id}`);
      }
    }
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    if (userId) quickStart.mutate({ userId });
  };

  return {
    handleStartWorkout,
    handleRestDayChoice,
    handleConfirmStart,
  };
}

