/**
 * Custom hook for plan event handlers
 */

import { useRouter } from "next/navigation";
import type { RestDayAction } from "../_types";

interface UsePlanHandlersProps {
  userId: string;
  data: ReturnType<typeof import("./use-plans-data").usePlansData>;
  mutations: ReturnType<typeof import("./use-plans-mutations").usePlansMutations>;
  activePlan: { id: string } | undefined;
  setShowRestDayDialog: (show: boolean) => void;
  setSelectedPlanForStart: (planId: string | null) => void;
}

export function usePlanHandlers({
  userId,
  data,
  mutations,
  activePlan,
  setShowRestDayDialog,
  setSelectedPlanForStart,
}: UsePlanHandlersProps) {
  const router = useRouter();
  const { list, todaysWorkout } = data;
  const { duplicate, deletePlan, setActive, toggleRestDay } = mutations;

  const handleDuplicate = async (planId: string) => {
    await duplicate.mutateAsync({ id: planId });
    await list.refetch();
  };

  const handleDelete = async (planId: string) => {
    await deletePlan.mutateAsync({ id: planId });
    await list.refetch();
  };

  const handleSetActive = async (planId: string) => {
    if (!userId) return;
    await setActive.mutateAsync({ userId, planId });
    await list.refetch();
  };

  const handleStartWorkout = async (planId: string) => {
    // Check if this plan is the active plan
    const isActivePlan = activePlan?.id === planId;

    if (isActivePlan) {
      // Check if today's workout has exercises first
      const hasExercises =
        todaysWorkout.data?.todayWorkout?.exercises &&
        todaysWorkout.data.todayWorkout.exercises.length > 0;

      // If there are exercises, allow starting (exercises take priority over isRestDay flag)
      if (!hasExercises && todaysWorkout.data?.todayWorkout) {
        // No exercises - show rest day dialog
        setSelectedPlanForStart(planId);
        setShowRestDayDialog(true);
        return;
      }
    }

    // Navigate to quick start workout
    router.push(`/portal/log?quickStart=${planId}`);
  };

  const handleRestDayChoice = async (
    action: RestDayAction,
    selectedPlanForStart: string | null,
  ) => {
    setShowRestDayDialog(false);

    if (action === "skip") {
      // User confirms it's a rest day
      setSelectedPlanForStart(null);
      return;
    } else if (action === "mark") {
      // User wants to mark today as rest day
      if (todaysWorkout.data?.todayWorkout?.id) {
        await toggleRestDay.mutateAsync({
          id: todaysWorkout.data.todayWorkout.id,
        });
        await todaysWorkout.refetch();
      }
      setSelectedPlanForStart(null);
      return;
    } else {
      // User wants to add exercises - redirect to plan editor
      if (selectedPlanForStart) {
        router.push(`/portal/plans/${selectedPlanForStart}`);
        setSelectedPlanForStart(null);
      }
    }
  };

  return {
    handleDuplicate,
    handleDelete,
    handleSetActive,
    handleStartWorkout,
    handleRestDayChoice,
  };
}

