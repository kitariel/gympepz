"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { api } from "@/trpc/react";
import { getDeviceId } from "@/lib/device-id";
import {
  getPendingEvents,
  getFailedEvents,
  markProcessing,
  markAcknowledged,
  markFailed,
  retryFailedEvents,
  getOutboxCounts,
  cleanupAcknowledgedEvents,
  type OutboxEvent,
  type WorkoutEventPayload,
} from "@/lib/storage/outboxDb";

// Sync configuration
const SYNC_INTERVAL_MS = 30 * 1000; // Check every 30 seconds
const BATCH_SIZE = 10; // Max events per sync batch
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Cleanup every hour

export interface OutboxSyncState {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  processingCount: number;
  lastSyncAt: number | null;
  lastError: string | null;
}

export function useOutboxSync() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();

  const [state, setState] = useState<OutboxSyncState>({
    isSyncing: false,
    pendingCount: 0,
    failedCount: 0,
    processingCount: 0,
    lastSyncAt: null,
    lastError: null,
  });

  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSyncingRef = useRef(false);

  const deviceId = typeof window !== "undefined" ? getDeviceId() : "server";

  const syncMutation = api.workoutLog.syncFromOffline.useMutation();
  const utils = api.useUtils();

  // Refresh counts from IndexedDB
  const refreshCounts = useCallback(async () => {
    if (!userId) return;

    try {
      const counts = await getOutboxCounts(userId);
      setState((prev) => ({
        ...prev,
        pendingCount: counts.pending,
        failedCount: counts.failed,
        processingCount: counts.processing,
      }));
    } catch (error) {
      console.error("[useOutboxSync] Failed to refresh counts:", error);
    }
  }, [userId]);

  // Process pending events
  const processPendingEvents = useCallback(async () => {
    if (!userId || !isOnline || isSyncingRef.current) {
      return { synced: 0, failed: 0 };
    }

    isSyncingRef.current = true;
    setState((prev) => ({ ...prev, isSyncing: true, lastError: null }));

    // Track event IDs before API call so we can mark them failed if needed
    let processingEventIds: string[] = [];

    try {
      // Get pending events ready to sync
      const pending = await getPendingEvents(userId, {
        readyOnly: true,
        limit: BATCH_SIZE,
      });

      if (pending.length === 0) {
        return { synced: 0, failed: 0 };
      }

      processingEventIds = pending.map((e) => e.id);

      // Mark as processing
      await markProcessing(processingEventIds);

      // Transform events to sync payload
      const workouts = pending
        .filter((e): e is OutboxEvent<WorkoutEventPayload> => e.eventType === "workout_logged")
        .map((e) => ({
          date: e.payload.date,
          startTime: e.payload.startTime,
          endTime: e.payload.endTime,
          completed: e.payload.completed,
          notes: e.payload.notes,
          sets: e.payload.sets,
        }));

      if (workouts.length === 0) {
        // No workout events to sync, mark all as acknowledged
        await markAcknowledged(processingEventIds, userId);
        return { synced: processingEventIds.length, failed: 0 };
      }

      // Call sync API
      const result = await syncMutation.mutateAsync({
        userId,
        workouts,
      });

      // Process results
      const syncedEventIds: string[] = [];
      const failedEventIds: string[] = [];
      const failureReasons: Record<string, string> = {};

      // Map workout indices back to events
      const workoutEvents = pending.filter((e) => e.eventType === "workout_logged");

      for (let i = 0; i < workoutEvents.length; i++) {
        const event = workoutEvents[i];
        if (!event) continue;

        // Check if this workout failed
        const error = result.errors?.find((err) => err.workoutIndex === i);

        if (error) {
          failedEventIds.push(event.id);
          failureReasons[event.id] = error.error;
        } else {
          syncedEventIds.push(event.id);
        }
      }

      // Mark acknowledged events
      if (syncedEventIds.length > 0) {
        await markAcknowledged(syncedEventIds, userId);
      }

      // Mark failed events with reasons
      for (const eventId of failedEventIds) {
        await markFailed([eventId], userId, failureReasons[eventId] ?? "Unknown error");
      }

      // Invalidate workout log cache
      await utils.workoutLog.invalidate();

      setState((prev) => ({
        ...prev,
        lastSyncAt: Date.now(),
      }));

      return { synced: syncedEventIds.length, failed: failedEventIds.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      console.error("[useOutboxSync] Sync error:", error);

      // Use the tracked event IDs instead of re-fetching
      if (processingEventIds.length > 0) {
        await markFailed(processingEventIds, userId, message);
      }

      setState((prev) => ({
        ...prev,
        lastError: message,
      }));

      return { synced: 0, failed: processingEventIds.length };
    } finally {
      isSyncingRef.current = false;
      setState((prev) => ({ ...prev, isSyncing: false }));
      await refreshCounts();
    }
  }, [userId, isOnline, syncMutation, utils.workoutLog, refreshCounts]);

  // Retry all failed events
  const retryFailed = useCallback(async () => {
    if (!userId) return;

    try {
      const failed = await getFailedEvents(userId);
      if (failed.length === 0) return;

      await retryFailedEvents(
        failed.map((e) => e.id),
        userId
      );

      await refreshCounts();

      // Trigger a sync attempt
      if (isOnline) {
        await processPendingEvents();
      }
    } catch (error) {
      console.error("[useOutboxSync] Failed to retry events:", error);
    }
  }, [userId, isOnline, refreshCounts, processPendingEvents]);

  // Force sync now
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      setState((prev) => ({ ...prev, lastError: "Offline" }));
      return { synced: 0, failed: 0 };
    }

    return processPendingEvents();
  }, [isOnline, processPendingEvents]);

  // Cleanup old acknowledged events
  const cleanup = useCallback(async () => {
    try {
      const deleted = await cleanupAcknowledgedEvents();
      if (deleted > 0) {
        console.log(`[useOutboxSync] Cleaned up ${deleted} old events`);
      }
    } catch (error) {
      console.error("[useOutboxSync] Cleanup failed:", error);
    }
  }, []);

  // Set up sync interval
  useEffect(() => {
    if (!userId) return;

    // Initial refresh
    void refreshCounts();

    // Start sync interval
    syncIntervalRef.current = setInterval(() => {
      if (isOnline) {
        void processPendingEvents();
      }
    }, SYNC_INTERVAL_MS);

    // Start cleanup interval
    cleanupIntervalRef.current = setInterval(() => {
      void cleanup();
    }, CLEANUP_INTERVAL_MS);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [userId, isOnline, refreshCounts, processPendingEvents, cleanup]);

  // Listen for online status changes
  useEffect(() => {
    if (isOnline && userId) {
      // When coming back online, try to sync
      void processPendingEvents();
    }
  }, [isOnline, userId, processPendingEvents]);

  // Listen for new outbox events
  useEffect(() => {
    const handleEventAdded = () => {
      void refreshCounts();
      // Optionally trigger immediate sync
      if (isOnline) {
        void processPendingEvents();
      }
    };

    const handleEventsAcknowledged = () => {
      void refreshCounts();
    };

    window.addEventListener("outbox-event-added", handleEventAdded);
    window.addEventListener("outbox-events-acknowledged", handleEventsAcknowledged);

    return () => {
      window.removeEventListener("outbox-event-added", handleEventAdded);
      window.removeEventListener("outbox-events-acknowledged", handleEventsAcknowledged);
    };
  }, [isOnline, refreshCounts, processPendingEvents]);

  return {
    ...state,
    syncNow,
    retryFailed,
    refreshCounts,
    hasUnsyncedEvents: state.pendingCount > 0 || state.failedCount > 0 || state.processingCount > 0,
    unsyncedCount: state.pendingCount + state.failedCount + state.processingCount,
  };
}
