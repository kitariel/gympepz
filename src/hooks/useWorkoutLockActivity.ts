"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { getDeviceId } from "@/lib/device-id";
import { getWorkoutSessionId } from "@/lib/workout-session";

export function useWorkoutLockActivity() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const touchMutation = api.workoutLock.touch.useMutation();

  const touch = useCallback(async () => {
    if (!userId) return;
    const deviceId = getDeviceId();
    const sessionId = getWorkoutSessionId() ?? undefined;

    try {
      await touchMutation.mutateAsync({ deviceId, sessionId });
    } catch (error) {
      console.error("[useWorkoutLockActivity] Failed to update activity:", error);
    }
  }, [userId, touchMutation]);

  return { touchActivity: touch };
}
