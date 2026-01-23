"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { workoutRepo, type WorkoutHistoryItem } from "@/lib/storage/workoutRepo";
import { activityStorage, type StoredWorkout } from "@/lib/storage/activityStorage";
import {
  readOfflineWorkoutLogQueue,
  markOfflineWorkoutLogSynced,
} from "@/lib/guest/storage";
import type { OfflineWorkoutLog, OfflineWorkoutSet } from "@/lib/guest/types";

/**
 * Transform workoutRepo format (WorkoutHistoryItem) to sync format
 */
function transformWorkoutRepoToSync(
  workout: WorkoutHistoryItem,
): {
  date: string;
  startTime: string;
  endTime: string | null;
  completed: boolean;
  notes: string | null;
  sets: Array<{
    exerciseId: string;
    exerciseName?: string;
    setNumber: number;
    targetReps: string | number | null;
    actualReps: string | number;
    targetWeight: string | number | null;
    actualWeight: string | number | null;
    rpe: number | null;
    completed: boolean;
  }>;
} {
  return {
    date: workout.date,
    startTime: workout.startedAt,
    endTime: workout.endedAt ?? null,
    completed: workout.completed,
    notes: workout.notes,
    sets: workout.sets.map((set) => ({
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      setNumber: set.setNumber,
      // workoutRepo uses strings - keep as-is, endpoint will convert
      targetReps: set.targetReps,
      actualReps: set.actualReps,
      targetWeight: set.targetWeight,
      actualWeight: set.actualWeight,
      rpe: null, // workoutRepo doesn't track RPE
      completed: set.completed,
    })),
  };
}

/**
 * Transform OfflineWorkoutLog format (guest mode) to sync format
 */
function transformOfflineLogToSync(
  workout: OfflineWorkoutLog,
): {
  date: string;
  startTime: string;
  endTime: string | null;
  completed: boolean;
  notes: string | null;
  sets: Array<{
    exerciseId: string;
    exerciseName?: string;
    setNumber: number;
    targetReps: number | null;
    actualReps: number;
    targetWeight: number | null;
    actualWeight: number | null;
    rpe: number | null;
    completed: boolean;
  }>;
} {
  return {
    date: workout.date,
    startTime: workout.startTime,
    endTime: workout.endTime ?? null,
    completed: workout.completed,
    notes: workout.notes,
    sets: workout.sets.map((set: OfflineWorkoutSet) => ({
      exerciseId: set.exerciseId,
      exerciseName: undefined,
      setNumber: set.setNumber,
      targetReps: set.targetReps,
      actualReps: set.actualReps,
      targetWeight: set.targetWeight,
      actualWeight: set.actualWeight,
      rpe: set.rpe,
      completed: set.completed,
    })),
  };
}

export function useSyncWorkouts() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const utils = api.useUtils();
  const syncMutation = api.workoutLog.syncFromOffline.useMutation({
    onSuccess: () => {
      // Invalidate workout queries to refresh UI
      void utils.workoutLog.list.invalidate();
      void utils.workoutLog.calendar.invalidate();
      void utils.workoutLog.getAnalytics.invalidate();
    },
  });

  const [pendingState, setPendingState] = useState<StoredWorkout[]>(() =>
    activityStorage.listPending(),
  );

  useEffect(() => {
    const refresh = () => setPendingState(activityStorage.listPending());
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (!detail?.key) return;
      if (detail.key === "gympepz.pending_workouts") {
        refresh();
      }
    };
    window.addEventListener("workout-storage-changed", handler);
    return () => window.removeEventListener("workout-storage-changed", handler);
  }, []);

  // Get unsynced workouts from both sources
  const unsyncedWorkouts = useMemo(() => {
    if (!userId) return { pending: [], offlineLogs: [] };

    const pending = pendingState.filter(
      (w) => w.status === "pending" || w.status === "failed",
    );

    // From offlineWorkoutLogQueue (guest mode)
    const queue = readOfflineWorkoutLogQueue();
    const offlineLogs = queue.logs.filter((log) => !log.synced && log.completed);

    return {
      pending,
      offlineLogs,
    };
  }, [userId, pendingState]);

  const hasUnsyncedWorkouts = useMemo(
    () =>
      unsyncedWorkouts.pending.length > 0 ||
      unsyncedWorkouts.offlineLogs.length > 0,
    [unsyncedWorkouts],
  );

  const syncOfflineWorkouts = useCallback(async () => {
    if (!userId) {
      throw new Error("User must be logged in to sync workouts");
    }

    if (unsyncedWorkouts.pending.length === 0) {
      const history = workoutRepo.getHistory();
      const completed = history.filter((w) => w.completed);
      for (const workout of completed) {
        activityStorage.addPending(workout);
      }
    }

    const pendingToSync = activityStorage
      .listPending()
      .filter((w) => w.status === "pending" || w.status === "failed");

    const workoutsToSync: Array<
      ReturnType<typeof transformWorkoutRepoToSync> | ReturnType<typeof transformOfflineLogToSync>
    > = [];

    // Transform local pending workouts
    const pendingIds: string[] = [];
    const pendingIndexMap = new Map<number, string>();
    for (const entry of pendingToSync) {
      pendingIds.push(entry.id);
      pendingIndexMap.set(workoutsToSync.length, entry.id);
      workoutsToSync.push(transformWorkoutRepoToSync(entry.workout));
    }

    // Transform offline log workouts
    for (const workout of unsyncedWorkouts.offlineLogs) {
      workoutsToSync.push(transformOfflineLogToSync(workout));
    }

    if (workoutsToSync.length === 0) {
      return { synced: 0, failed: 0, syncedIds: [], errors: [] };
    }

    if (pendingIds.length > 0) {
      activityStorage.markSyncing(pendingIds);
    }

    // Call sync endpoint
    const result = await syncMutation.mutateAsync({
      userId,
      workouts: workoutsToSync,
    });

    const duplicateIndices = new Set(
      result.errors
        .filter((e) =>
          e.error.toLowerCase().includes("already exists for this date"),
        )
        .map((e) => e.workoutIndex),
    );
    const errorIndices = new Set(
      result.errors
        .filter((e) => !duplicateIndices.has(e.workoutIndex))
        .map((e) => e.workoutIndex),
    );
    const syncedEntries: Array<{ id: string; syncedId?: string }> = [];
    let syncedCursor = 0;

    for (let i = 0; i < workoutsToSync.length; i += 1) {
      if (errorIndices.has(i)) continue;
      const syncedId = result.syncedIds[syncedCursor];
      syncedCursor += 1;
      const pendingId = pendingIndexMap.get(i);
      if (pendingId) syncedEntries.push({ id: pendingId, syncedId });
    }

    if (syncedEntries.length > 0) {
      activityStorage.markSynced(syncedEntries);
    }
    if (duplicateIndices.size > 0) {
      const duplicateIds = Array.from(pendingIndexMap.entries())
        .filter(([index]) => duplicateIndices.has(index))
        .map(([, id]) => ({ id }));
      activityStorage.markSynced(duplicateIds);
    }
    if (errorIndices.size > 0) {
      const failedIds = Array.from(pendingIndexMap.entries())
        .filter(([index]) => errorIndices.has(index))
        .map(([, id]) => id);
      activityStorage.markFailed(failedIds, "Sync failed");
    }

    // Mark offline logs as synced
    for (const log of unsyncedWorkouts.offlineLogs) {
      markOfflineWorkoutLogSynced(log.clientLogId);
    }

    // For workoutRepo, we could optionally clear history after sync
    // or add a synced flag. For now, we'll leave them (user might want to keep local copy)

    return result;
  }, [userId, unsyncedWorkouts, syncMutation]);

  return {
    syncOfflineWorkouts,
    isSyncing: syncMutation.isPending,
    hasUnsyncedWorkouts,
    unsyncedCount:
      unsyncedWorkouts.pending.length + unsyncedWorkouts.offlineLogs.length,
    error: syncMutation.error,
  };
}
