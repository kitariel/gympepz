"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { workoutRepo, type WorkoutHistoryItem } from "@/lib/storage/workoutRepo";
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

  // Get unsynced workouts from both sources
  const unsyncedWorkouts = useMemo(() => {
    if (!userId) return { workoutRepo: [], offlineLogs: [] };

    // From workoutRepo (train mode - offline)
    const history = workoutRepo.getHistory();
    // Note: workoutRepo doesn't have a synced flag, so we sync all completed workouts.
    // The backend handles conflicts by checking for existing workouts on the same date,
    // so duplicate syncs won't create duplicate records.
    const workoutRepoItems = history.filter((w) => w.completed);

    // From offlineWorkoutLogQueue (guest mode)
    const queue = readOfflineWorkoutLogQueue();
    const offlineLogs = queue.logs.filter((log) => !log.synced && log.completed);

    return {
      workoutRepo: workoutRepoItems,
      offlineLogs,
    };
  }, [userId]);

  const hasUnsyncedWorkouts = useMemo(
    () =>
      unsyncedWorkouts.workoutRepo.length > 0 ||
      unsyncedWorkouts.offlineLogs.length > 0,
    [unsyncedWorkouts],
  );

  const syncOfflineWorkouts = useCallback(async () => {
    if (!userId) {
      throw new Error("User must be logged in to sync workouts");
    }

    const workoutsToSync: Array<
      ReturnType<typeof transformWorkoutRepoToSync> | ReturnType<typeof transformOfflineLogToSync>
    > = [];

    // Transform workoutRepo workouts
    for (const workout of unsyncedWorkouts.workoutRepo) {
      workoutsToSync.push(transformWorkoutRepoToSync(workout));
    }

    // Transform offline log workouts
    for (const workout of unsyncedWorkouts.offlineLogs) {
      workoutsToSync.push(transformOfflineLogToSync(workout));
    }

    if (workoutsToSync.length === 0) {
      return { synced: 0, failed: 0, syncedIds: [], errors: [] };
    }

    // Call sync endpoint
    const result = await syncMutation.mutateAsync({
      userId,
      workouts: workoutsToSync,
    });

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
      unsyncedWorkouts.workoutRepo.length + unsyncedWorkouts.offlineLogs.length,
    error: syncMutation.error,
  };
}
