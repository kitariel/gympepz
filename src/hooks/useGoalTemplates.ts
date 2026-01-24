"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { GoalTemplate } from "@/types/goal-template.types";

export function useGoalTemplates() {
  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = api.goalTemplate.list.useQuery();

  const normalized = useMemo<GoalTemplate[]>(
    () =>
      (templates ?? []).map((template) => ({
        ...template,
        category: template.category as GoalTemplate["category"],
        icon: template.icon as GoalTemplate["icon"],
        type: template.type as GoalTemplate["type"],
        unit: template.unit as GoalTemplate["unit"],
      })),
    [templates],
  );

  return {
    templates: normalized,
    isLoading,
    error,
    refetch,
  };
}
