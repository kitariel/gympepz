"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { api } from "@/trpc/react";
import { getDeviceId } from "@/lib/device-id";

// Heartbeat interval: 25 seconds
const HEARTBEAT_INTERVAL_MS = 25 * 1000;

/**
 * Keep server-side workout lock in sync with this device's local draft.
 * This component:
 * 1. Acquires a lock when a workout starts
 * 2. Sends heartbeats every 25s to keep the lock alive
 * 3. Releases the lock when the workout ends
 * 4. Enables cross-device "workout in progress" awareness
 */
export function ActiveWorkoutStatusSync() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();
  const { draft, hydrated } = useWorkoutDraft();

  const acquireMutation = api.workoutLock.acquire.useMutation();
  const releaseMutation = api.workoutLock.release.useMutation();
  const heartbeatMutation = api.workoutLock.heartbeat.useMutation();

  const lastDraftIdRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const deviceId = typeof window !== "undefined" ? getDeviceId() : "server";

  // Start heartbeat interval
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (!isOnline) return;

      heartbeatMutation.mutate(
        { deviceId, sessionId: sessionIdRef.current },
        {
          onError: (error) => {
            console.error("[ActiveWorkoutStatusSync] Heartbeat failed:", error);
          },
        }
      );
    }, HEARTBEAT_INTERVAL_MS);
  }, [deviceId, isOnline, heartbeatMutation]);

  // Stop heartbeat interval
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

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

        // Acquire lock
        acquireMutation.mutate(
          {
            deviceId,
            sessionId: sessionIdRef.current,
            workoutId: draft.id,
            programName: draft.programName ?? undefined,
            dayLabel: draft.programDayLabel ?? undefined,
          },
          {
            onSuccess: (result) => {
              if (result.status === "acquired" || result.status === "already_owned" || result.status === "acquired_stale") {
                startHeartbeat();
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
      stopHeartbeat();

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
    startHeartbeat,
    stopHeartbeat,
  ]);

  return null;
}
