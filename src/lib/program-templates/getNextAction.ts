import type { ProgramTemplateDay } from "@/lib/program-templates/types";

export type NextAction =
  | { type: "start_next"; dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 }
  | {
      type: "rest_day";
      dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      nextWorkoutDayIndex?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    }
  | { type: "done" };

function isWorkoutDay(day: ProgramTemplateDay): boolean {
  return !day.isRestDay && day.items.length > 0;
}

function wrapDay(n: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const x = ((n - 1) % 7) + 1;
  return x as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function getNextAction(input: {
  days: ProgramTemplateDay[];
  justFinishedDayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}): NextAction {
  const daysByIndex = new Map<number, ProgramTemplateDay>();
  for (const d of input.days) daysByIndex.set(d.day, d);

  const anyWorkout = input.days.some(isWorkoutDay);
  if (!anyWorkout) return { type: "done" };

  const nextIndex = wrapDay(input.justFinishedDayIndex + 1);
  const nextDay = daysByIndex.get(nextIndex);
  if (nextDay && isWorkoutDay(nextDay)) {
    return { type: "start_next", dayIndex: nextIndex };
  }

  // Rest/empty day next: recommend rest, but also compute the next available workout day.
  let scan = nextIndex;
  for (let i = 0; i < 7; i += 1) {
    const d = daysByIndex.get(scan);
    if (d && isWorkoutDay(d)) {
      return { type: "rest_day", dayIndex: nextIndex, nextWorkoutDayIndex: scan };
    }
    scan = wrapDay(scan + 1);
  }

  return { type: "rest_day", dayIndex: nextIndex };
}

