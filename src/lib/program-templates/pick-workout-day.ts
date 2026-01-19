import type { ProgramTemplateDay } from "@/lib/program-templates/types";

export type PickedWorkoutDay = {
  day: ProgramTemplateDay;
  isExactMatch: boolean;
};

/**
 * Templates use day numbers as "scheduled weekdays" (Mon=1..Sun=7).
 * If there's no exact match for today, pick the next scheduled day; otherwise wrap to the first.
 */
export function pickWorkoutDayForWeekday(
  days: ProgramTemplateDay[],
  today: number,
): PickedWorkoutDay | null {
  if (!days.length) return null;

  const sorted = days.slice().sort((a, b) => a.day - b.day);

  const exact = sorted.find((d) => d.day === today);
  if (exact) return { day: exact, isExactMatch: true };

  const next = sorted.find((d) => d.day > today);
  return { day: next ?? sorted[0]!, isExactMatch: false };
}

