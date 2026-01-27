import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";

/** Preferred training days (1=Mon, 7=Sun) */
export type PreferredDays = (1 | 2 | 3 | 4 | 5 | 6 | 7)[];

/** Tracks user response to missed-day prompts */
export type MissedDayState = {
  date: string; // YYYY-MM-DD
  action: "train" | "rest" | "skip" | null;
  acknowledgedAt: string; // ISO timestamp
};

/** Internal storage format for missed day history */
type MissedDayHistory = Record<string, MissedDayState>;

export const schedulePrefsRepo = {
  getPreferredDays(): PreferredDays | null {
    return getJSON<PreferredDays>(STORAGE_KEYS.schedulePreferredDays);
  },

  setPreferredDays(days: PreferredDays): void {
    setJSON(STORAGE_KEYS.schedulePreferredDays, days);
  },

  clearPreferredDays(): void {
    remove(STORAGE_KEYS.schedulePreferredDays);
  },

  getMissedDayState(dateKey: string): MissedDayState | null {
    const history = getJSON<MissedDayHistory>(STORAGE_KEYS.scheduleMissedDayState);
    if (!history) return null;
    return history[dateKey] ?? null;
  },

  setMissedDayState(state: MissedDayState): void {
    const history = getJSON<MissedDayHistory>(STORAGE_KEYS.scheduleMissedDayState) ?? {};
    history[state.date] = state;
    // Keep only last 14 days of history to prevent unbounded growth
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const cutoffKey = cutoff.toISOString().slice(0, 10);
    const pruned: MissedDayHistory = {};
    for (const key of Object.keys(history)) {
      if (key >= cutoffKey && history[key]) {
        pruned[key] = history[key];
      }
    }
    setJSON(STORAGE_KEYS.scheduleMissedDayState, pruned);
  },

  getMissedDayHistory(): MissedDayState[] {
    const history = getJSON<MissedDayHistory>(STORAGE_KEYS.scheduleMissedDayState);
    if (!history) return [];
    return Object.values(history).sort((a, b) => b.date.localeCompare(a.date));
  },

  clearMissedDayState(dateKey: string): void {
    const history = getJSON<MissedDayHistory>(STORAGE_KEYS.scheduleMissedDayState);
    if (!history) return;
    delete history[dateKey];
    setJSON(STORAGE_KEYS.scheduleMissedDayState, history);
  },

  clearAllMissedDayHistory(): void {
    remove(STORAGE_KEYS.scheduleMissedDayState);
  },
};
