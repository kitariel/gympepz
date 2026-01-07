/**
 * Custom hook for managing workout start logic
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { DAY_NAMES, type DayName } from "../_types";

export function useStartWorkout(userId: string) {
  const router = useRouter();
  const utils = api.useUtils();

  // Get local day name based on timezone
  const localDayName = useMemo(() => {
    return DAY_NAMES[new Date().getDay()]!;
  }, []);

  // Queries
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId, day: localDayName },
    {
      enabled: !!userId,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  );

  const activeWorkout = api.workoutLog.getActiveWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );

  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  // Mutations
  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const toggleRestDay = api.plan.toggleRestDay.useMutation({
    onSuccess: async () => {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
      await todaysWorkout.refetch();
    },
  });

  return {
    localDayName,
    todaysWorkout,
    activeWorkout,
    recentWorkoutCheck,
    quickStart,
    toggleRestDay,
    utils,
  };
}
