import { getJSON, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";
import type { WorkoutHistoryItem } from "./workoutRepo";

export type ActivityStatus = "pending" | "syncing" | "synced" | "failed";

export type StoredWorkout = {
  id: string; // local id
  syncedId?: string;
  workout: WorkoutHistoryItem;
  status: ActivityStatus;
  createdAt: string; // ISO
  syncedAt?: string; // ISO
  retryCount: number;
  error?: string;
};

const MAX_TOTAL = 150;
const MAX_SYNCED_CACHE = 30;

function normalize(list: unknown): StoredWorkout[] {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean) as StoredWorkout[];
}

function getPending(): StoredWorkout[] {
  return normalize(getJSON<StoredWorkout[]>(STORAGE_KEYS.pendingWorkouts));
}

function getSynced(): StoredWorkout[] {
  return normalize(getJSON<StoredWorkout[]>(STORAGE_KEYS.syncedWorkouts));
}

function writePending(list: StoredWorkout[]): void {
  setJSON(STORAGE_KEYS.pendingWorkouts, list);
}

function writeSynced(list: StoredWorkout[]): void {
  setJSON(STORAGE_KEYS.syncedWorkouts, list);
}

function trimCaches(pending: StoredWorkout[], synced: StoredWorkout[]): void {
  let nextPending = pending.slice();
  let nextSynced = synced.slice();

  if (nextSynced.length > MAX_SYNCED_CACHE) {
    nextSynced = nextSynced.slice(0, MAX_SYNCED_CACHE);
  }

  const total = nextPending.length + nextSynced.length;
  if (total > MAX_TOTAL) {
    const overflow = total - MAX_TOTAL;
    if (nextSynced.length > 0) {
      nextSynced = nextSynced.slice(0, Math.max(0, nextSynced.length - overflow));
    } else if (nextPending.length > MAX_TOTAL) {
      nextPending = nextPending.slice(0, MAX_TOTAL);
    }
  }

  writePending(nextPending);
  writeSynced(nextSynced);
}

export const activityStorage = {
  listPending(): StoredWorkout[] {
    return getPending();
  },
  listSynced(): StoredWorkout[] {
    return getSynced();
  },
  addPending(workout: WorkoutHistoryItem): void {
    const pending = getPending();
    const existingIdx = pending.findIndex((w) => w.id === workout.id);
    const entry: StoredWorkout = {
      id: workout.id,
      workout,
      status: "pending",
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };
    if (existingIdx >= 0) pending[existingIdx] = entry;
    else pending.unshift(entry);
    trimCaches(pending, getSynced());
  },
  markSyncing(ids: string[]): void {
    const pending = getPending().map((w) =>
      ids.includes(w.id) ? { ...w, status: "syncing" } : w,
    );
    writePending(pending);
  },
  markFailed(ids: string[], error: string): void {
    const pending = getPending().map((w) =>
      ids.includes(w.id)
        ? {
            ...w,
            status: "failed",
            retryCount: w.retryCount + 1,
            error,
          }
        : w,
    );
    writePending(pending);
  },
  markSynced(entries: Array<{ id: string; syncedId?: string }>): void {
    const ids = new Set(entries.map((e) => e.id));
    const pending = getPending().filter((w) => !ids.has(w.id));
    const syncedList = getSynced();

    for (const entry of entries) {
      const source = getPending().find((w) => w.id === entry.id);
      if (!source) continue;
      const syncedRecord: StoredWorkout = {
        ...source,
        status: "synced",
        syncedId: entry.syncedId ?? source.syncedId,
        syncedAt: new Date().toISOString(),
        error: undefined,
      };
      const existingIdx = syncedList.findIndex((w) => w.id === entry.id);
      if (existingIdx >= 0) syncedList[existingIdx] = syncedRecord;
      else syncedList.unshift(syncedRecord);
    }

    trimCaches(pending, syncedList);
  },
};
