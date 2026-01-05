/**
 * Custom hook for managing plans data fetching
 */

import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { PlanStats } from "../_types";

export function usePlansData(userId: string) {
  const list = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );

  const plans = list.data ?? [];
  const activePlan = plans.find((p) => p.isActive);

  const stats = useMemo<PlanStats>(() => {
    return {
      total: plans.length,
      active: plans.filter((p) => p.isActive).length,
      totalDays: plans.reduce((sum, p) => sum + (p.daysCount || 0), 0),
    };
  }, [plans]);

  return {
    plans,
    activePlan,
    stats,
    list,
    todaysWorkout,
  };
}

