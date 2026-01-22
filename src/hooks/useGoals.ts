"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import type { GoalType } from "@/types/goal.types";

export function useGoals() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const {
    data: goals,
    isLoading,
    error,
    refetch,
  } = api.goal.getAll.useQuery(
    { userId },
    { enabled: !!userId },
  );

  const activeGoals = useMemo(
    () => goals?.filter((g) => g.status === "active") ?? [],
    [goals],
  );

  const completedGoals = useMemo(
    () => goals?.filter((g) => g.status === "completed") ?? [],
    [goals],
  );

  type GoalItem = NonNullable<typeof goals>[number];
  const goalsByType = useMemo(
    () =>
      (goals ?? []).reduce<Partial<Record<GoalType, GoalItem[]>>>(
        (acc, goal) => {
          const t = goal.type as GoalType;
          const arr = acc[t] ??= [];
          arr.push(goal);
          return acc;
        },
        {},
      ),
    [goals],
  );

  return {
    goals: goals ?? [],
    activeGoals,
    completedGoals,
    goalsByType,
    isLoading,
    error,
    refetch,
    userId,
  };
}

export function useGoal(goalId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const {
    data: goal,
    isLoading,
    error,
    refetch,
  } = api.goal.getById.useQuery(
    { userId, id: goalId },
    { enabled: !!userId && !!goalId },
  );

  const { data: progress } = api.goal.getProgress.useQuery(
    { userId, goalId },
    { enabled: !!userId && !!goalId },
  );

  return {
    goal,
    progress,
    isLoading,
    error,
    refetch,
    userId,
  };
}

export function useGoalMutations() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const utils = api.useUtils();

  const createMutation = api.goal.create.useMutation({
    onSuccess: () => {
      void utils.goal.getAll.invalidate();
    },
  });

  const updateMutation = api.goal.update.useMutation({
    onSuccess: () => {
      void utils.goal.getAll.invalidate();
      void utils.goal.getById.invalidate();
      void utils.goal.getProgress.invalidate();
    },
  });

  const deleteMutation = api.goal.delete.useMutation({
    onSuccess: () => {
      void utils.goal.getAll.invalidate();
    },
  });

  const recordProgressMutation = api.goal.recordProgress.useMutation({
    onSuccess: () => {
      void utils.goal.getById.invalidate();
      void utils.goal.getProgress.invalidate();
      void utils.goal.getAll.invalidate();
    },
  });

  return {
    create: (
      input: Omit<
        Parameters<typeof createMutation.mutateAsync>[0],
        "userId"
      >,
    ) => createMutation.mutateAsync({ ...input, userId }),
    update: (input: Omit<Parameters<typeof updateMutation.mutateAsync>[0], "userId">) =>
      updateMutation.mutateAsync({ ...input, userId }),
    delete: (input: { id: string }) =>
      deleteMutation.mutateAsync({ ...input, userId }),
    recordProgress: (
      input: Omit<
        Parameters<typeof recordProgressMutation.mutateAsync>[0],
        "userId"
      >,
    ) => recordProgressMutation.mutateAsync({ ...input, userId }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    userId,
  };
}
