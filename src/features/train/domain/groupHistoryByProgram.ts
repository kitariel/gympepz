import type { WorkoutHistoryItem } from "@/lib/storage/workoutRepo";

export function groupHistoryByProgram(
  history: WorkoutHistoryItem[],
): Record<string, WorkoutHistoryItem[]> {
  return history.reduce<Record<string, WorkoutHistoryItem[]>>((acc, item) => {
    const key = item.programName || "Program";
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});
}
