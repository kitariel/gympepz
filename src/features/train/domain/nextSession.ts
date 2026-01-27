import type { ProgramTemplateDay, TemplateDayNumber } from "@/lib/program-templates/types";
import type { WorkoutHistoryItem } from "@/lib/storage/workoutRepo";

/**
 * Represents a training session in the ordered sequence.
 * Sessions are ordered by their position in the program, not by weekday.
 */
export type SessionOrder = {
  dayIndex: TemplateDayNumber;
  label: string;
  order: number; // 1-based position in sequence (e.g., 1st, 2nd, 3rd workout)
};

export type NextSessionResult = {
  nextSession: SessionOrder | null;
  lastCompletedSession: SessionOrder | null;
  sessionOrder: SessionOrder[];
};

/**
 * Build session order from program days, excluding rest days.
 * Sessions are ordered by their day number (1-7), which represents
 * the sequence in the program, not the actual weekday.
 */
export function buildSessionOrder(days: ProgramTemplateDay[]): SessionOrder[] {
  return days
    .filter((d) => !d.isRestDay && d.items.length > 0)
    .sort((a, b) => a.day - b.day)
    .map((d, index) => ({
      dayIndex: d.day,
      label: d.label,
      order: index + 1,
    }));
}

/**
 * Find the last completed session from workout history for a specific program.
 * Returns the most recent completed workout's session info.
 */
export function getLastCompletedSession(
  history: WorkoutHistoryItem[],
  programId: string,
  sessionOrder: SessionOrder[]
): SessionOrder | null {
  // Find most recent completed workout for this program
  const lastCompleted = history.find((h) => {
    if (!h.completed) return false;
    const id = h.programRef?.id ?? h.templateId;
    return id === programId;
  });

  if (!lastCompleted || !lastCompleted.programDayIndex) return null;

  return sessionOrder.find((s) => s.dayIndex === lastCompleted.programDayIndex) ?? null;
}

/**
 * Compute the next session in sequence.
 * Core rule: Next workout = next in order after last completed (wraps around).
 *
 * @param lastCompleted - The last completed session, or null if none
 * @param sessionOrder - Array of all training sessions in order
 * @returns The next session to do, or null if no sessions exist
 */
export function computeNextSession(
  lastCompleted: SessionOrder | null,
  sessionOrder: SessionOrder[]
): SessionOrder | null {
  if (sessionOrder.length === 0) return null;
  if (!lastCompleted) return sessionOrder[0] ?? null;

  const lastIndex = sessionOrder.findIndex((s) => s.dayIndex === lastCompleted.dayIndex);
  if (lastIndex === -1) return sessionOrder[0] ?? null;

  // Next in sequence (wrap around)
  const nextIndex = (lastIndex + 1) % sessionOrder.length;
  return sessionOrder[nextIndex] ?? null;
}

/**
 * Get complete next session info for a program.
 * Combines session order building with last completed and next session calculation.
 */
export function getNextSessionInfo(
  days: ProgramTemplateDay[],
  history: WorkoutHistoryItem[],
  programId: string
): NextSessionResult {
  const sessionOrder = buildSessionOrder(days);
  const lastCompletedSession = getLastCompletedSession(history, programId, sessionOrder);
  const nextSession = computeNextSession(lastCompletedSession, sessionOrder);

  return {
    nextSession,
    lastCompletedSession,
    sessionOrder,
  };
}

/**
 * Check if a specific session was completed today.
 */
export function isSessionCompletedToday(
  history: WorkoutHistoryItem[],
  programId: string,
  dayIndex: TemplateDayNumber,
  todayDateKey: string
): boolean {
  return history.some((h) => {
    if (!h.completed) return false;
    const id = h.programRef?.id ?? h.templateId;
    if (id !== programId) return false;
    if (h.programDayIndex !== dayIndex) return false;
    // Compare date keys (YYYY-MM-DD)
    const historyDateKey = h.date.slice(0, 10);
    return historyDateKey === todayDateKey;
  });
}

/**
 * Get program day data for a specific session.
 */
export function getProgramDayForSession(
  days: ProgramTemplateDay[],
  session: SessionOrder
): ProgramTemplateDay | null {
  return days.find((d) => d.day === session.dayIndex) ?? null;
}
