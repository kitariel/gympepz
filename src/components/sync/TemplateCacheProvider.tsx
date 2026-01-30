"use client";

import { useEffect, useRef } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useTemplateCache } from "@/hooks/useTemplateCache";

/**
 * Silently caches templates and exercises for offline use.
 * Runs on first visit when online, and refreshes if cache is stale.
 */
export function TemplateCacheProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useOnlineStatus();
  const { hasTemplatesCache, hasExercisesCache, syncTemplates, refreshIfStale } = useTemplateCache();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session
    if (hasSynced.current) return;

    // Need to be online
    if (!isOnline) return;

    const doSync = async () => {
      // If no cache exists, do initial sync
      if (!hasTemplatesCache || !hasExercisesCache) {
        console.log("[TemplateCacheProvider] No cache found, syncing templates...");
        await syncTemplates();
        hasSynced.current = true;
        return;
      }

      // Otherwise, check if cache is stale
      await refreshIfStale();
      hasSynced.current = true;
    };

    void doSync();
  }, [isOnline, hasTemplatesCache, hasExercisesCache, syncTemplates, refreshIfStale]);

  return <>{children}</>;
}
