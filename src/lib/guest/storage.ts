import type {
  OfflineWorkoutLog,
  OfflineWorkoutLogQueue,
  WeeklyPlanSnapshot,
} from "@/lib/guest/types";

const KEYS = {
  weeklyPlanSnapshot: "gympepz.weeklyPlanSnapshot",
  offlineWorkoutLogQueue: "gympepz.offlineWorkoutLogQueue",
} as const;

function isBrowser() {
  return typeof window !== "undefined";
}

function getStore(): Storage | null {
  if (!isBrowser()) return null;
  // Guest Mode demo is session-only: data should not persist after the session ends.
  return window.sessionStorage;
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function uuid(): string {
  if (isBrowser() && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (not cryptographically strong, but ok for MVP client IDs)
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getWeekId(date = new Date()): string {
  // ISO week without adding dependencies; week starts Monday.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();
  const ww = String(weekNo).padStart(2, "0");
  return `${year}-${ww}`;
}

export function readWeeklyPlanSnapshot(): WeeklyPlanSnapshot | null {
  const store = getStore();
  if (!store) return null;
  return safeJsonParse<WeeklyPlanSnapshot>(
    store.getItem(KEYS.weeklyPlanSnapshot),
  );
}

export function writeWeeklyPlanSnapshot(snapshot: WeeklyPlanSnapshot) {
  const store = getStore();
  if (!store) return;
  store.setItem(KEYS.weeklyPlanSnapshot, JSON.stringify(snapshot));
}

export function clearWeeklyPlanSnapshot() {
  const store = getStore();
  if (!store) return;
  store.removeItem(KEYS.weeklyPlanSnapshot);
}

export function createSampleWeeklyPlanSnapshot(
  weekId = getWeekId(),
): WeeklyPlanSnapshot {
  const now = Date.now();
  return {
    weekId,
    generatedAt: now,
    days: [
      {
        planDayId: null,
        title: "Full Body A",
        dayLabel: "Monday",
        isRestDay: false,
        items: [
          {
            exerciseId: "guest_squat",
            name: "Back Squat",
            sets: 3,
            reps: 5,
            weight: null,
            order: 0,
          },
          {
            exerciseId: "guest_bench",
            name: "Bench Press",
            sets: 3,
            reps: 5,
            weight: null,
            order: 1,
          },
          {
            exerciseId: "guest_row",
            name: "Dumbbell Row",
            sets: 3,
            reps: 10,
            weight: null,
            order: 2,
          },
        ],
      },
      {
        planDayId: null,
        title: "Rest Day",
        dayLabel: "Wednesday",
        isRestDay: true,
        items: [],
      },
      {
        planDayId: null,
        title: "Full Body B",
        dayLabel: "Friday",
        isRestDay: false,
        items: [
          {
            exerciseId: "guest_deadlift",
            name: "Deadlift",
            sets: 2,
            reps: 5,
            weight: null,
            order: 0,
          },
          {
            exerciseId: "guest_press",
            name: "Overhead Press",
            sets: 3,
            reps: 8,
            weight: null,
            order: 1,
          },
          {
            exerciseId: "guest_pullup",
            name: "Pull-up",
            sets: 3,
            reps: 6,
            weight: null,
            order: 2,
          },
        ],
      },
    ],
  };
}

export function ensureWeeklyPlanSnapshot(): WeeklyPlanSnapshot {
  const existing = readWeeklyPlanSnapshot();
  if (existing) return existing;
  const sample = createSampleWeeklyPlanSnapshot();
  writeWeeklyPlanSnapshot(sample);
  return sample;
}

export function readOfflineWorkoutLogQueue(): OfflineWorkoutLogQueue {
  const store = getStore();
  if (!store) return { logs: [] };
  const parsed = safeJsonParse<OfflineWorkoutLogQueue>(
    store.getItem(KEYS.offlineWorkoutLogQueue),
  );
  if (!parsed?.logs || !Array.isArray(parsed.logs)) return { logs: [] };
  return parsed;
}

export function writeOfflineWorkoutLogQueue(queue: OfflineWorkoutLogQueue) {
  const store = getStore();
  if (!store) return;
  store.setItem(KEYS.offlineWorkoutLogQueue, JSON.stringify(queue));
}

export function appendOfflineWorkoutLog(log: OfflineWorkoutLog) {
  const queue = readOfflineWorkoutLogQueue();
  queue.logs.unshift(log);
  writeOfflineWorkoutLogQueue(queue);
}

export function updateOfflineWorkoutLog(
  clientLogId: string,
  updater: (current: OfflineWorkoutLog) => OfflineWorkoutLog,
) {
  const queue = readOfflineWorkoutLogQueue();
  const idx = queue.logs.findIndex((l) => l.clientLogId === clientLogId);
  if (idx === -1) return;
  queue.logs[idx] = updater(queue.logs[idx]!);
  writeOfflineWorkoutLogQueue(queue);
}

export function markOfflineWorkoutLogSynced(clientLogId: string) {
  updateOfflineWorkoutLog(clientLogId, (l) => ({ ...l, synced: true }));
}

export function clearOfflineWorkoutLogQueue() {
  const store = getStore();
  if (!store) return;
  store.removeItem(KEYS.offlineWorkoutLogQueue);
}

