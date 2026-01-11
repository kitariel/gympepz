import type { Exercise } from "@prisma/client";
import type { SuggestInput, SuggestOutput } from "./types";

export const generatePlanManually = (
  input: SuggestInput,
  exercises: Exercise[],
): SuggestOutput => {
  const vol =
    input.experience === "Advanced"
      ? { sets: 4, reps: 10 }
      : input.experience === "Intermediate"
        ? { sets: 3, reps: 10 }
        : { sets: 3, reps: 8 };

  const pickWarmup = () => {
    const e = exercises.find((e) =>
      (e.muscleGroup ?? "").toLowerCase().includes("conditioning"),
    );
    return e
      ? [
          {
            exerciseId: e.id,
            exerciseName: e.name,
            muscleGroup: e.muscleGroup ?? "",
            sets: 1,
            reps: 15,
          },
        ]
      : [];
  };

  const pick = (group: string, n: number) => {
    const pool = exercises.filter((e) =>
      (e.muscleGroup ?? "").toLowerCase().includes(group),
    );
    return pool.slice(0, n).map((e) => ({
      exerciseId: e.id,
      exerciseName: e.name,
      muscleGroup: e.muscleGroup ?? "",
      sets: vol.sets,
      reps: vol.reps,
    }));
  };

  let dayType: "push" | "pull" | "legs" = "push";
  if (input.previousDays?.length) {
    const last =
      input.previousDays[input.previousDays.length - 1]?.toLowerCase() ?? "";
    if (last.includes("push")) dayType = "pull";
    else if (last.includes("pull")) dayType = "legs";
    else if (last.includes("legs")) dayType = "push";
  }

  const items =
    dayType === "push"
      ? [
          ...pickWarmup(),
          ...pick("chest", 2),
          ...pick("shoulders", 1),
          ...pick("triceps", 1),
        ]
      : dayType === "pull"
        ? [...pickWarmup(), ...pick("back", 3), ...pick("biceps", 1)]
        : [
            ...pickWarmup(),
            ...pick("legs", 2),
            ...pick("glutes", 1),
            ...pick("calves", 1),
          ];

  const title =
    input.dayLabel ?? dayType.charAt(0).toUpperCase() + dayType.slice(1);

  return {
    ok: true,
    name: `${input.goal} Plan`,
    days: [{ title, order: 0, items }],
    assistantText: "Here's your workout plan!",
  };
};
