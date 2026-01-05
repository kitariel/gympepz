/**
 * Custom hook for managing plan mutations
 */

import { api } from "@/trpc/react";

export function usePlansMutations() {
  const utils = api.useUtils();

  const create = api.plan.create.useMutation();
  const duplicate = api.plan.duplicate.useMutation();
  const deletePlan = api.plan.delete.useMutation();
  const setActive = api.plan.setActive.useMutation();
  const toggleRestDay = api.plan.toggleRestDay.useMutation();

  return {
    create,
    duplicate,
    deletePlan,
    setActive,
    toggleRestDay,
    utils,
  };
}

