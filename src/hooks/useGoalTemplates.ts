"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getCachedGoalTemplates } from "@/lib/storage/templateCache";
import type { GoalTemplate } from "@/types/goal-template.types";

export function useGoalTemplates() {
  const { isOnline } = useOnlineStatus();
  const [cachedTemplates, setCachedTemplates] = useState<GoalTemplate[]>([]);
  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = api.goalTemplate.list.useQuery(undefined, { enabled: isOnline });

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

  useEffect(() => {
    if (isOnline) return;
    let active = true;
    const load = async () => {
      try {
        const cached = await getCachedGoalTemplates();
        if (!active) return;
        setCachedTemplates(
          cached.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            category: t.category as GoalTemplate["category"],
            icon: t.iconName as GoalTemplate["icon"],
            type: t.goalType as GoalTemplate["type"],
            unit: t.unit as GoalTemplate["unit"],
            targetValue: t.defaultTargetValue ?? 0,
            suggestedDeadlineDays: t.defaultDurationWeeks
              ? t.defaultDurationWeeks * 7
              : null,
          }))
        );
      } catch (error) {
        console.error("[useGoalTemplates] Failed to load cached goal templates:", error);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isOnline]);

  return {
    templates: isOnline ? normalized : cachedTemplates,
    isLoading: isOnline ? isLoading : false,
    error,
    refetch,
  };
}
