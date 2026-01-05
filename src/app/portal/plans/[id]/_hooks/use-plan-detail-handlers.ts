/**
 * Custom hook for plan detail event handlers
 */

import { useRouter } from "next/navigation";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Plan, PlanDay } from "../_types";
import type { ReturnType } from "./use-plan-detail-data";
import type { ReturnType as MutationsReturnType } from "./use-plan-detail-mutations";

interface UsePlanDetailHandlersProps {
  planId: string;
  userId: string;
  data: ReturnType<typeof import("./use-plan-detail-data").usePlanDetailData>;
  mutations: MutationsReturnType<
    typeof import("./use-plan-detail-mutations").usePlanDetailMutations
  >;
  localDays: (PlanDay | null)[];
  setLocalDays: (days: (PlanDay | null)[]) => void;
}

export function usePlanDetailHandlers({
  planId,
  userId,
  data,
  mutations,
  localDays,
  setLocalDays,
}: UsePlanDetailHandlersProps) {
  const router = useRouter();
  const { plan, planData } = data;
  const {
    updateMeta,
    addDay,
    addExercise,
    updateItem,
    deleteItem,
    deleteDay,
    updateDay,
    updateDaysOrder,
    duplicateDay,
    copyExercises,
    toggleRestDay,
    reorderItems,
    utils,
  } = mutations;

  const invalidateTodaysWorkout = async () => {
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
  };

  const handleSaveName = async (planName: string) => {
    if (!planId || !planName) return;
    await updateMeta.mutateAsync({ id: planId, name: planName });
    await plan.refetch();
  };

  const handleAddDay = async (
    newDayTitle: string,
    targetSlot?: number,
    dayName?: string,
  ) => {
    if (!newDayTitle && !targetSlot) {
      return { shouldOpenDialog: true };
    }

    const order = targetSlot ?? planData?.days?.length ?? 0;
    const title =
      newDayTitle || (dayName ? `${dayName} Workout` : `Day ${order + 1}`);

    await addDay.mutateAsync({
      planId,
      title,
      order,
    });
    await plan.refetch();
    await invalidateTodaysWorkout();

    return { shouldOpenDialog: false };
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeDayId = active.id as string;
    let overSlotIndex = -1;

    // Check if over.id is a slot index (0-6)
    if (["0", "1", "2", "3", "4", "5", "6"].includes(over.id as string)) {
      overSlotIndex = parseInt(over.id as string);
    } else {
      // Otherwise assume it's a day ID and look it up
      overSlotIndex = localDays.findIndex((d) => d?.id === over.id);
    }

    // If dropping on a slot (slot index 0-6)
    if (overSlotIndex >= 0 && overSlotIndex < 7) {
      const newDays = [...localDays];
      const activeDay = planData?.days?.find((d) => d.id === activeDayId);

      if (!activeDay) return;

      // Find current position of dragged day
      const currentSlotIndex = newDays.findIndex(
        (day) => day?.id === activeDayId,
      );

      // Check if target slot already has a day (need to swap)
      const existingDayAtSlot = newDays[overSlotIndex];

      if (currentSlotIndex >= 0) {
        // Clear current slot
        newDays[currentSlotIndex] = null;

        // If target slot has a day, move it to the source slot (swap)
        if (existingDayAtSlot && existingDayAtSlot.id !== activeDayId) {
          newDays[currentSlotIndex] = {
            ...existingDayAtSlot,
            order: currentSlotIndex,
          };
        }
      }

      // Place active day in target slot with updated order
      newDays[overSlotIndex] = { ...activeDay, order: overSlotIndex };

      // Update local state immediately for responsive UI
      setLocalDays(newDays);

      // Build array of order updates for all days in their new positions
      const orderUpdates: Array<{ id: string; order: number }> = [];
      newDays.forEach((day, slotIndex) => {
        if (day) {
          orderUpdates.push({
            id: day.id,
            order: slotIndex,
          });
        }
      });

      // Update all days' orders atomically
      if (orderUpdates.length > 0) {
        try {
          await updateDaysOrder.mutateAsync({
            planId,
            orders: orderUpdates,
          });
          await plan.refetch();
          await invalidateTodaysWorkout();
        } catch (error) {
          console.error("Failed to update day orders:", error);
          await plan.refetch();
        }
      }
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Delete this day and all its exercises?")) return;
    await deleteDay.mutateAsync({ id: dayId });
    await plan.refetch();
    await invalidateTodaysWorkout();
  };

  const handleAddExercise = async (exerciseId: string, targetDayId: string) => {
    if (!targetDayId) return;
    await addExercise.mutateAsync({
      dayId: targetDayId,
      exerciseId,
      sets: 3,
      reps: 10,
    });
    await plan.refetch();
    await invalidateTodaysWorkout();
  };

  const handleUpdateItem = async (
    itemId: string,
    field: "sets" | "reps" | "weight",
    value: number,
  ) => {
    await updateItem.mutateAsync({ id: itemId, [field]: value });
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem.mutateAsync({ id: itemId });
    await plan.refetch();
    await invalidateTodaysWorkout();
  };

  const handleSaveDayTitle = async (dayId: string, title: string) => {
    if (!title.trim()) return;
    await updateDay.mutateAsync({ id: dayId, title });
    await plan.refetch();
    await invalidateTodaysWorkout();
  };

  const handleDuplicateDay = async (dayId: string) => {
    if (!planId) return;
    await duplicateDay.mutateAsync({ dayId, planId });
    await plan.refetch();
    await invalidateTodaysWorkout();
  };

  const handleCopyExercises = async (
    sourceDayId: string,
    targetDayId: string,
  ) => {
    if (!sourceDayId) return;
    await copyExercises.mutateAsync({
      sourceDayId,
      targetDayId,
    });
    await plan.refetch();
    await invalidateTodaysWorkout();
  };

  const handleToggleRestDay = async (dayId: string) => {
    await toggleRestDay.mutateAsync({ id: dayId });
    await plan.refetch();
    await invalidateTodaysWorkout();
  };

  const handleExerciseDragEnd = async (event: DragEndEvent, dayId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const selectedDay = planData?.days?.find((d) => d.id === dayId);
    if (!selectedDay) return;

    // Sort items by order to ensure correct indices
    const items = [...(selectedDay.items ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const { arrayMove } = await import("@dnd-kit/sortable");
      const reordered = arrayMove(items, oldIndex, newIndex);
      const orderedIds = reordered.map((item) => item.id);

      await reorderItems.mutateAsync({
        dayId,
        orderedIds,
      });
      await plan.refetch();
    }
  };

  return {
    handleSaveName,
    handleAddDay,
    handleDragEnd,
    handleDeleteDay,
    handleAddExercise,
    handleUpdateItem,
    handleDeleteItem,
    handleSaveDayTitle,
    handleDuplicateDay,
    handleCopyExercises,
    handleToggleRestDay,
    handleExerciseDragEnd,
  };
}

