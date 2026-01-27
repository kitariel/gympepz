import type { WorkoutHistoryItem } from "@/lib/storage/workoutRepo";
import type { PreferredDays, MissedDayState } from "@/lib/storage/schedulePrefsRepo";
import { localDateKey } from "./date";

export type MissedDayCheckResult = {
  shouldShowPrompt: boolean;
  missedDate: string | null; // YYYY-MM-DD
  reason:
    | "not_preferred_day"
    | "already_trained_today"
    | "already_trained_yesterday"
    | "already_acknowledged"
    | "no_preferred_days"
    | "is_rest_day"
    | null;
};

export type MissedDayCheckInput = {
  preferredDays: PreferredDays | null;
  history: WorkoutHistoryItem[];
  missedDayState: MissedDayState | null;
  programId: string;
  today?: Date;
};

/**
 * Get yesterday's date relative to a given date.
 */
function getYesterday(today: Date = new Date()): Date {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

/**
 * Convert JS getDay() (0=Sun) to our weekday format (1=Mon, 7=Sun).
 */
function toWeekdayNumber(date: Date): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const jsDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Convert: Mon=1, Tue=2, ..., Sat=6, Sun=7
  return (jsDay === 0 ? 7 : jsDay) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * Check if the user trained on a specific date for a specific program.
 */
function hasCompletedWorkoutOnDate(
  history: WorkoutHistoryItem[],
  programId: string,
  dateKey: string
): boolean {
  return history.some((h) => {
    if (!h.completed) return false;
    const id = h.programRef?.id ?? h.templateId;
    if (id !== programId) return false;
    const historyDateKey = h.date.slice(0, 10);
    return historyDateKey === dateKey;
  });
}

/**
 * Check if user missed a training day yesterday and should see a prompt.
 *
 * Anti-annoyance rules:
 * - Show missed-day prompt only once per missed date
 * - Don't show if user already worked out today
 * - Don't show if user already worked out yesterday (for this program)
 * - Don't show if no preferredDays set
 *
 * @returns Object indicating whether to show prompt and why/why not
 */
export function checkMissedDay(input: MissedDayCheckInput): MissedDayCheckResult {
  const today = input.today ?? new Date();
  const yesterday = getYesterday(today);
  const yesterdayKey = localDateKey(yesterday);
  const todayKey = localDateKey(today);

  // No preferred days set - don't nag
  if (!input.preferredDays || input.preferredDays.length === 0) {
    return { shouldShowPrompt: false, missedDate: null, reason: "no_preferred_days" };
  }

  // Check if yesterday was a preferred training day
  const yesterdayWeekday = toWeekdayNumber(yesterday);
  if (!input.preferredDays.includes(yesterdayWeekday)) {
    return { shouldShowPrompt: false, missedDate: null, reason: "not_preferred_day" };
  }

  // Check if user already trained today (for any program)
  const trainedToday = input.history.some((h) => {
    if (!h.completed) return false;
    const historyDateKey = h.date.slice(0, 10);
    return historyDateKey === todayKey;
  });
  if (trainedToday) {
    return { shouldShowPrompt: false, missedDate: null, reason: "already_trained_today" };
  }

  // Check if user trained yesterday for this program
  if (hasCompletedWorkoutOnDate(input.history, input.programId, yesterdayKey)) {
    return { shouldShowPrompt: false, missedDate: null, reason: "already_trained_yesterday" };
  }

  // Check if already acknowledged for this date
  if (input.missedDayState?.date === yesterdayKey && input.missedDayState.action !== null) {
    return { shouldShowPrompt: false, missedDate: null, reason: "already_acknowledged" };
  }

  // All conditions met - show the prompt
  return { shouldShowPrompt: true, missedDate: yesterdayKey, reason: null };
}

/**
 * Format a weekday number to a short day name.
 */
export function formatWeekdayShort(day: 1 | 2 | 3 | 4 | 5 | 6 | 7): string {
  const days = ["M", "T", "W", "T", "F", "S", "S"] as const;
  return days[day - 1] ?? "?";
}

/**
 * Format preferred days as a display string (e.g., "M • W • F").
 */
export function formatPreferredDays(days: PreferredDays): string {
  return days.map(formatWeekdayShort).join(" • ");
}
