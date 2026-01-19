import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";

export type WorkoutSetEntry = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetReps: string | null;
  actualReps: string;
  targetWeight: string | null;
  actualWeight: string | null;
  completed: boolean;
  createdAt: string; // ISO
};

export type ActiveWorkoutDraft = {
  id: string;
  /**
   * Which template this workout was generated from.
   * Used to avoid showing stale drafts after switching templates.
   */
  templateId?: string;
  programName: string;
  date: string; // ISO (workout day)
  startedAt: string; // ISO
  completed: boolean;
  exercises: Array<{
    id: string;
    name: string;
    order: number;
    targetSets: number | null;
    targetReps: string | null;
    targetWeight: string | null;
  }>;
  sets: WorkoutSetEntry[];
  notes: string | null;
  updatedAt: string; // ISO
};

export type WorkoutHistoryItem = ActiveWorkoutDraft & {
  endedAt: string; // ISO
};

export const workoutRepo = {
  getActiveWorkoutDraft(): ActiveWorkoutDraft | null {
    return getJSON<ActiveWorkoutDraft>(STORAGE_KEYS.activeWorkoutDraft);
  },
  saveActiveWorkoutDraft(draft: ActiveWorkoutDraft): void {
    setJSON(STORAGE_KEYS.activeWorkoutDraft, draft);
  },
  clearActiveWorkoutDraft(): void {
    remove(STORAGE_KEYS.activeWorkoutDraft);
  },
  getHistory(): WorkoutHistoryItem[] {
    const history = getJSON<WorkoutHistoryItem[]>(STORAGE_KEYS.history);
    return Array.isArray(history) ? history : [];
  },
  addToHistory(item: WorkoutHistoryItem): void {
    const current = workoutRepo.getHistory();
    current.unshift(item);
    setJSON(STORAGE_KEYS.history, current);
  },
  clearHistory(): void {
    remove(STORAGE_KEYS.history);
  },
};

