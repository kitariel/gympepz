"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { api } from "@/trpc/react";
import { getDeviceId } from "@/lib/device-id";
import { clearWorkoutSessionId, setWorkoutSessionId } from "@/lib/workout-session";

/**
 * Keep server-side workout lock in sync with this device's local draft.
 * This component:
 * 1. Acquires a lock when a workout starts
 * 2. Releases the lock when the workout ends
 * 3. Enables cross-device "workout in progress" awareness
 */
export function ActiveWorkoutStatusSync() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();
  const { draft, hydrated } = useWorkoutDraft();

  const acquireMutation = api.workoutLock.acquire.useMutation();
  const releaseMutation = api.workoutLock.release.useMutation();

  const lastDraftIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const deviceId = typeof window !== "undefined" ? getDeviceId() : "server";

  // Main sync effect
  useEffect(() => {
    if (!hydrated || !userId || !isOnline) return;

    // Active workout exists and not completed
    if (draft && !draft.completed) {
      // New draft started
      if (lastDraftIdRef.current !== draft.id) {
        lastDraftIdRef.current = draft.id;

        // Generate new session ID for this workout
        sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setWorkoutSessionId(sessionIdRef.current);

        // Acquire lock
        acquireMutation.mutate(
          {
            deviceId,
            sessionId: sessionIdRef.current,
            workoutLogId: draft.id,
            programName: draft.programName ?? undefined,
            dayLabel: draft.programDayLabel ?? undefined,
          },
          {
            onSuccess: (result) => {
              if (result.status === "blocked") {
                clearWorkoutSessionId();
              }
              // If blocked, the ConflictPrompt component will handle showing the modal
            },
            onError: (error) => {
              console.error("[ActiveWorkoutStatusSync] Acquire failed:", error);
            },
          }
        );
      }
      return;
    }

    // No active draft or draft completed - release lock
    if (lastDraftIdRef.current) {
      lastDraftIdRef.current = null;
      clearWorkoutSessionId();

      releaseMutation.mutate(
        { deviceId, sessionId: sessionIdRef.current },
        {
          onError: (error) => {
            console.error("[ActiveWorkoutStatusSync] Release failed:", error);
          },
        }
      );
    }
  }, [
    hydrated,
    userId,
    isOnline,
    draft?.id,
    draft?.completed,
    draft?.programName,
    draft?.programDayLabel,
    deviceId,
    acquireMutation,
    releaseMutation,
  ]);

  return null;
}
