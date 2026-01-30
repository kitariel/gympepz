"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useOutboxSync } from "@/hooks/useOutboxSync";
import { queueWorkoutForSync } from "@/lib/storage/outboxHelpers";
import { activityStorage } from "@/lib/storage/activityStorage";

/**
 * Provider component that:
 * 1. Listens for new pending workouts in activityStorage
 * 2. Queues them to the IndexedDB outbox
 * 3. Runs the outbox sync processor
 *
 * This acts as a bridge between the existing localStorage-based
 * workflow and the new IndexedDB outbox pattern.
 */
export function OutboxSyncProvider() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();

  // Initialize the outbox sync processor
  const outboxSync = useOutboxSync();

  // Track which workouts we've already queued to avoid duplicates
  const queuedIdsRef = useRef<Set<string>>(new Set());

  // Listen for new workouts added to activityStorage
  useEffect(() => {
    if (!userId) return;

    const handleStorageChange = async (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>;

      // Only process pending workout changes
      if (customEvent.detail?.key !== "gympepz.pendingWorkouts") {
        return;
      }

      try {
        // Get pending workouts from activityStorage
        const pending = activityStorage.listPending();

        for (const item of pending) {
          // Skip if already queued
          if (queuedIdsRef.current.has(item.id)) {
            continue;
          }

          // Skip if already synced or syncing
          if (item.status === "synced" || item.status === "syncing") {
            continue;
          }

          // Queue to outbox
          await queueWorkoutForSync(item.workout, userId);
          queuedIdsRef.current.add(item.id);

          console.log(`[OutboxSyncProvider] Queued workout ${item.id} to outbox`);
        }
      } catch (error) {
        console.error("[OutboxSyncProvider] Failed to queue workouts:", error);
      }
    };

    // Listen for storage changes
    window.addEventListener("workout-storage-changed", handleStorageChange);

    // Initial check for any pending workouts
    void handleStorageChange(new CustomEvent("workout-storage-changed", {
      detail: { key: "gympepz.pendingWorkouts" },
    }));

    return () => {
      window.removeEventListener("workout-storage-changed", handleStorageChange);
    };
  }, [userId]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && userId) {
      void outboxSync.syncNow();
    }
  }, [isOnline, userId, outboxSync.syncNow]);

  return null;
}

/**
 * Hook to access outbox sync state from any component
 */
export { useOutboxSync };
