import type { WorkoutHistoryItem } from "@/lib/storage/workoutRepo";
import { localDateKey } from "./date";

export function isDoneToday(input: {
  history: WorkoutHistoryItem[];
  programId: string;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  const todayKey = localDateKey(now);
  return input.history.some((h) => {
    if (!h.completed) return false;
    if (localDateKey(new Date(h.date)) !== todayKey) return false;
    const id = h.programRef?.id ?? h.templateId;
    return id === input.programId;
  });
}

