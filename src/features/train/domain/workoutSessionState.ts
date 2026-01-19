import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";
import type { ProgramTemplateDay } from "@/lib/program-templates/types";
import type { WorkoutHistoryItem } from "@/lib/storage/workoutRepo";
import { localDateKey } from "./date";

export type WorkoutSessionState = "idle" | "active" | "completed" | "rest";

export function getDayNumberForToday(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d as 1 | 2 | 3 | 4 | 5 | 6;
}

export function getEffectivePlanDay(input: {
  days: ProgramTemplateDay[];
  selectedWorkoutDay: "auto" | (1 | 2 | 3 | 4 | 5 | 6 | 7);
  today: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}): ProgramTemplateDay | null {
  if (input.selectedWorkoutDay === "auto") {
    return pickWorkoutDayForWeekday(input.days, input.today)?.day ?? null;
  }

  return (
    input.days.find((d) => d.day === input.selectedWorkoutDay) ??
    pickWorkoutDayForWeekday(input.days, input.today)?.day ??
    null
  );
}

export function isWorkoutCompletedTodayForDay(input: {
  history: WorkoutHistoryItem[];
  programId: string;
  dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  const todayKey = localDateKey(now);
  return input.history.some((h) => {
    if (!h.completed) return false;
    if (localDateKey(new Date(h.date)) !== todayKey) return false;
    const id = h.programRef?.id ?? h.templateId;
    if (id !== input.programId) return false;
    return h.programDayIndex === input.dayIndex;
  });
}

export function getWorkoutSessionState(input: {
  hasDraft: boolean;
  isRestDay: boolean;
  isCompletedToday: boolean;
}): WorkoutSessionState {
  if (input.hasDraft) return "active";
  if (input.isRestDay) return "rest";
  if (input.isCompletedToday) return "completed";
  return "idle";
}

