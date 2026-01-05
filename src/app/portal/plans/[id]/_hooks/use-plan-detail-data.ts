/**
 * Custom hook for plan detail data fetching
 */

import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { Plan } from "../_types";

export function usePlanDetailData(
  planId: string,
  isExerciseDialogOpen?: boolean,
  searchQuery?: string,
) {
  const plan = api.plan.get.useQuery({ id: planId }, { enabled: !!planId });
  const exercises = api.exercise.list.useQuery(
    { q: searchQuery || undefined, take: 20 },
    { enabled: isExerciseDialogOpen ?? false }, // Only fetch when dialog is open
  );

  const planData = plan.data as Plan | null | undefined;

  const totalExercises = useMemo(() => {
    return (
      planData?.days?.reduce((sum, d) => sum + (d.items?.length ?? 0), 0) ?? 0
    );
  }, [planData?.days]);

  return {
    plan,
    planData,
    exercises,
    totalExercises,
  };
}

