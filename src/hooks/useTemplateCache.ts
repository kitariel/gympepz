"use client";

import { useCallback, useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { api } from "@/trpc/react";
import {
  cacheTemplates,
  cacheExercises,
  getCachedTemplates,
  getCachedExercises,
  getCacheStatus,
  isCacheStale,
  hasCache,
  type CachedTemplate,
  type CachedExercise,
} from "@/lib/storage/templateCache";

// Cache refresh interval: 24 hours
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface TemplateCacheState {
  isLoading: boolean;
  isOnline: boolean;
  hasTemplatesCache: boolean;
  hasExercisesCache: boolean;
  templatesCount: number;
  exercisesCount: number;
  lastUpdated: number | null;
  error: string | null;
}

export function useTemplateCache() {
  const { isOnline } = useOnlineStatus();
  const [state, setState] = useState<TemplateCacheState>({
    isLoading: true,
    isOnline: true,
    hasTemplatesCache: false,
    hasExercisesCache: false,
    templatesCount: 0,
    exercisesCount: 0,
    lastUpdated: null,
    error: null,
  });

  // API queries for fetching data
  // Note: template.list only returns summaries, we use it to get IDs then fetch full details
  const templatesListQuery = api.template.list.useQuery(undefined, {
    enabled: false, // Manual fetch only
  });

  const exercisesQuery = api.exercise.list.useQuery(undefined, {
    enabled: false, // Manual fetch only
  });

  const utils = api.useUtils();

  // Load cache status on mount
  useEffect(() => {
    const loadCacheStatus = async () => {
      try {
        const status = await getCacheStatus();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isOnline,
          hasTemplatesCache: status.templates.count > 0,
          hasExercisesCache: status.exercises.count > 0,
          templatesCount: status.templates.count,
          exercisesCount: status.exercises.count,
          lastUpdated: status.templates.lastUpdated ?? status.exercises.lastUpdated,
        }));
      } catch (error) {
        console.error("[useTemplateCache] Failed to load cache status:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load cache status",
        }));
      }
    };

    void loadCacheStatus();
  }, [isOnline]);

  // Sync templates from server to cache
  const syncTemplates = useCallback(async () => {
    if (!isOnline) {
      setState((prev) => ({ ...prev, error: "Offline - cannot sync" }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // First get list of template IDs
      const templatesListResult = await templatesListQuery.refetch();
      if (templatesListResult.data) {
        // Fetch full details for each template
        const fullTemplates = await Promise.all(
          templatesListResult.data.map(async (summary) => {
            const full = await utils.template.getById.fetch({ id: summary.id });
            return full;
          })
        );

        // Filter out nulls and transform to cached format
        const cachedTemplates: CachedTemplate[] = fullTemplates
          .filter((t): t is NonNullable<typeof t> => t !== null)
          .map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            tags: t.tags,
            daysPerWeek: t.daysPerWeek,
            weeks: t.weeks,
            days: t.days.map((d) => ({
              id: d.id,
              label: d.label,
              day: d.day,
              order: d.order,
              isRestDay: d.isRestDay,
              items: d.items.map((item) => ({
                id: item.id,
                exerciseId: item.exerciseId,
                exerciseName: item.exercise?.name ?? item.nameFallback,
                nameFallback: item.nameFallback,
                sets: item.sets,
                reps: item.reps,
                weight: item.weight,
                order: item.order,
              })),
            })),
            cachedAt: Date.now(),
          }));

        await cacheTemplates(cachedTemplates);
      }

      // Fetch exercises from server
      const exercisesResult = await exercisesQuery.refetch();
      if (exercisesResult.data) {
        const cachedExercises: CachedExercise[] = exercisesResult.data.map((e) => ({
          id: e.id,
          name: e.name,
          muscleGroup: e.muscleGroup,
          equipment: e.equipment,
          category: e.category,
          imageUrl: e.imageUrl,
          cachedAt: Date.now(),
        }));

        await cacheExercises(cachedExercises);
      }

      // Update state
      const status = await getCacheStatus();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        hasTemplatesCache: status.templates.count > 0,
        hasExercisesCache: status.exercises.count > 0,
        templatesCount: status.templates.count,
        exercisesCount: status.exercises.count,
        lastUpdated: Date.now(),
        error: null,
      }));

      console.log("[useTemplateCache] Templates and exercises cached successfully");
      return true;
    } catch (error) {
      console.error("[useTemplateCache] Sync failed:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to sync templates",
      }));
      return false;
    }
  }, [isOnline, templatesListQuery, exercisesQuery, utils.template.getById]);

  // Check and refresh cache if stale
  const refreshIfStale = useCallback(async () => {
    try {
      const [templatesStale, exercisesStale] = await Promise.all([
        isCacheStale("templates", CACHE_MAX_AGE_MS),
        isCacheStale("exercises", CACHE_MAX_AGE_MS),
      ]);

      if ((templatesStale || exercisesStale) && isOnline) {
        console.log("[useTemplateCache] Cache is stale, refreshing...");
        await syncTemplates();
      }
    } catch (error) {
      console.error("[useTemplateCache] Failed to check cache staleness:", error);
    }
  }, [isOnline, syncTemplates]);

  // Get templates (from cache or empty if offline)
  const getTemplates = useCallback(async (): Promise<CachedTemplate[]> => {
    try {
      return await getCachedTemplates();
    } catch (error) {
      console.error("[useTemplateCache] Failed to get cached templates:", error);
      return [];
    }
  }, []);

  // Get exercises (from cache or empty if offline)
  const getExercises = useCallback(async (): Promise<CachedExercise[]> => {
    try {
      return await getCachedExercises();
    } catch (error) {
      console.error("[useTemplateCache] Failed to get cached exercises:", error);
      return [];
    }
  }, []);

  return {
    ...state,
    syncTemplates,
    refreshIfStale,
    getTemplates,
    getExercises,
  };
}
