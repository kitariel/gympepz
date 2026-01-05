/**
 * Custom hook for plan detail mutations
 */

import { api } from "@/trpc/react";

export function usePlanDetailMutations() {
  const utils = api.useUtils();

  const updateMeta = api.plan.updateMeta.useMutation();
  const addDay = api.plan.addDay.useMutation();
  const addExercise = api.plan.addExercise.useMutation();
  const updateItem = api.plan.updateItem.useMutation();
  const deleteItem = api.plan.deleteItem.useMutation();
  const deleteDay = api.plan.deleteDay.useMutation();
  const updateDay = api.plan.updateDay.useMutation();
  const updateDaysOrder = api.plan.updateDaysOrder.useMutation();
  const duplicateDay = api.plan.duplicateDay.useMutation();
  const copyExercises = api.plan.copyExercises.useMutation();
  const toggleRestDay = api.plan.toggleRestDay.useMutation();
  const reorderItems = api.plan.reorderItems.useMutation();

  return {
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
  };
}

