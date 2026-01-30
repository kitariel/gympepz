"use client";

import { useEffect, useRef } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useTemplateCache } from "@/hooks/useTemplateCache";

/**
 * Silently caches templates and exercises for offline use.
 * Runs on first visit when online, and refreshes if cache is stale.
 */
let templateCacheSyncInFlight: Promise<void> | null = null;
let templateCacheSyncDone = false;

export function TemplateCacheProvider() {
  const { isOnline } = useOnlineStatus();
  const {
    hasTemplatesCache,
    hasExercisesCache,
    hasGoalTemplatesCache,
    syncTemplates,
    refreshIfStale,
  } = useTemplateCache();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session
    if (hasSynced.current || templateCacheSyncDone) return;

    // Need to be online
    if (!isOnline) return;

    const doSync = async () => {
      // If no cache exists, do initial sync
      if (!hasTemplatesCache || !hasExercisesCache || !hasGoalTemplatesCache) {
        console.log("[TemplateCacheProvider] No cache found, syncing templates...");
        await syncTemplates();
      } else {
        // Otherwise, check if cache is stale
        await refreshIfStale();
      }
    };

    if (!templateCacheSyncInFlight) {
      templateCacheSyncInFlight = doSync()
        .then(() => {
          templateCacheSyncDone = true;
          hasSynced.current = true;
        })
        .catch((error) => {
          console.error("[TemplateCacheProvider] Sync failed:", error);
        })
        .finally(() => {
          templateCacheSyncInFlight = null;
        });
    }
  }, [
    isOnline,
    hasTemplatesCache,
    hasExercisesCache,
    hasGoalTemplatesCache,
    syncTemplates,
    refreshIfStale,
  ]);

  return null;
}
