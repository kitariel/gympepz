import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";

export type ProgramDayMode = "auto" | "manual";
export type ProgramDayManualIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const trainPrefsRepo = {
  getTrackGoalsDuringWorkout(): boolean {
    const stored = getJSON<boolean>(STORAGE_KEYS.trainTrackGoalsDuringWorkout);
    return stored ?? true;
  },
  setTrackGoalsDuringWorkout(enabled: boolean): void {
    setJSON(STORAGE_KEYS.trainTrackGoalsDuringWorkout, enabled);
  },
  // Back-compat: read old combined key if new keys are missing.
  getProgramDayMode(): ProgramDayMode {
    const mode = getJSON<ProgramDayMode>(STORAGE_KEYS.programDayMode);
    if (mode) return mode;
    const legacy = getJSON<"auto" | number>(STORAGE_KEYS.trainSelectedWorkoutDay);
    return legacy === "auto" || legacy == null ? "auto" : "manual";
  },
  getProgramDayManualIndex(): ProgramDayManualIndex {
    const idx = getJSON<ProgramDayManualIndex>(STORAGE_KEYS.programDayManualIndex);
    if (idx) return idx;
    const legacy = getJSON<"auto" | number>(STORAGE_KEYS.trainSelectedWorkoutDay);
    if (legacy && legacy !== "auto") {
      const n = Number(legacy);
      if (n >= 1 && n <= 7) return n as ProgramDayManualIndex;
    }
    return 1;
  },
  setProgramDayMode(mode: ProgramDayMode): void {
    setJSON(STORAGE_KEYS.programDayMode, mode);
    // Keep legacy combined key in sync
    if (mode === "auto") setJSON(STORAGE_KEYS.trainSelectedWorkoutDay, "auto");
  },
  setProgramDayManualIndex(idx: ProgramDayManualIndex): void {
    setJSON(STORAGE_KEYS.programDayManualIndex, idx);
    setJSON(STORAGE_KEYS.programDayMode, "manual");
    // Keep legacy combined key in sync
    setJSON(STORAGE_KEYS.trainSelectedWorkoutDay, idx);
  },
  clearProgramDaySelection(): void {
    remove(STORAGE_KEYS.programDayMode);
    remove(STORAGE_KEYS.programDayManualIndex);
    remove(STORAGE_KEYS.trainSelectedWorkoutDay);
  },
};
