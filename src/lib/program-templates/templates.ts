import type { ProgramTemplate } from "./types";

/**
 * Offline-first templates.
 * - Keep exercises as nameFallback strings for now.
 * - Later, map these to DB exercise IDs and allow user customization/sync.
 */
export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: "starter-home-bodyweight-3d",
    name: "Starter (Home) — Bodyweight + Cardio (3 days/week)",
    tags: ["beginner", "newbie", "general_fitness", "fat_loss", "bodyweight"],
    daysPerWeek: 3,
    description:
      "No gym required. Alternate simple full-body bodyweight training with beginner-friendly cardio.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body (Home)",
          items: [
            { order: 0, nameFallback: "Bodyweight Squat", sets: 3, reps: "10-15", weight: "Smooth tempo" },
            { order: 1, nameFallback: "Incline Push-ups (or Knee Push-ups)", sets: 3, reps: "8-12", weight: "Stop 2 reps before failure" },
            { order: 2, nameFallback: "Hip Hinge (Good Mornings)", sets: 3, reps: "12", weight: "Slow and controlled" },
            { order: 3, nameFallback: "Glute Bridge", sets: 3, reps: "12-15", weight: "Pause at top" },
            { order: 4, nameFallback: "Plank", sets: 3, reps: "20-45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 3,
          label: "Day 2 — Cardio (Beginner)",
          items: [
            { order: 0, nameFallback: "Brisk Walk", sets: 1, reps: "20-30 min", weight: "Easy" },
            { order: 1, nameFallback: "Optional: Walk Intervals", sets: 1, reps: "10 min", weight: "1 min fast / 1 min easy" },
            { order: 2, nameFallback: "Mobility (Hips/Ankles/Shoulders)", sets: 1, reps: "5-10 min", weight: "Easy" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body (Home)",
          items: [
            { order: 0, nameFallback: "Reverse Lunge", sets: 3, reps: "8-12/leg", weight: "Controlled" },
            { order: 1, nameFallback: "Pike Push-up (or Shoulder Taps)", sets: 3, reps: "6-10", weight: "Stop 2 reps before failure" },
            { order: 2, nameFallback: "Single-leg RDL (Bodyweight)", sets: 3, reps: "8-10/leg", weight: "Balance + control" },
            { order: 3, nameFallback: "Dead Bug", sets: 3, reps: "8/side", weight: "Slow" },
            { order: 4, nameFallback: "Easy Cardio Finisher", sets: 1, reps: "8-12 min", weight: "Walk / bike / jog" },
          ],
        },
      ],
    },
  },
  {
    id: "cardio-home-beginner-4d",
    name: "Cardio Starter (Home) — 4 days/week",
    tags: ["beginner", "general_fitness", "fat_loss", "bodyweight"],
    daysPerWeek: 4,
    description:
      "A simple home cardio routine: mostly easy sessions plus light intervals for progression.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Easy Cardio",
          items: [{ order: 0, nameFallback: "Brisk Walk / Easy Jog", sets: 1, reps: "20-35 min", weight: "Easy" }],
        },
        {
          day: 3,
          label: "Day 2 — Intervals (Light)",
          items: [
            { order: 0, nameFallback: "Warm-up Walk", sets: 1, reps: "5 min", weight: "Easy" },
            { order: 1, nameFallback: "Intervals", sets: 1, reps: "10-12 min", weight: "1 min fast / 1 min easy" },
            { order: 2, nameFallback: "Cool-down Walk", sets: 1, reps: "5 min", weight: "Easy" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Easy Cardio",
          items: [{ order: 0, nameFallback: "Brisk Walk / Easy Jog", sets: 1, reps: "20-35 min", weight: "Easy" }],
        },
        {
          day: 7,
          label: "Day 4 — Optional Cross-Training",
          items: [{ order: 0, nameFallback: "Bike / Row / Jump Rope", sets: 1, reps: "15-25 min", weight: "Easy-Moderate" }],
        },
      ],
    },
  },
  {
    id: "starter-new-3d-fullbody",
    name: "Starter (New) — 3 days/week",
    tags: ["beginner", "newbie", "general_fitness", "full_gym"],
    daysPerWeek: 3,
    description:
      "Build the habit and learn safe technique. Full-body sessions with simple progress targets.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body A",
          items: [
            { order: 0, nameFallback: "Goblet Squat", sets: 3, reps: "8-10", weight: "Moderate" },
            { order: 1, nameFallback: "Bench Press (or Push-ups)", sets: 3, reps: "8-10", weight: "Moderate" },
            { order: 2, nameFallback: "Lat Pulldown (or Assisted Pull-up)", sets: 3, reps: "8-12", weight: "Moderate" },
            { order: 3, nameFallback: "Romanian Deadlift (Dumbbells)", sets: 2, reps: "10", weight: "Light-Moderate" },
            { order: 4, nameFallback: "Plank", sets: 3, reps: "30-45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 3,
          label: "Day 2 — Full Body B",
          items: [
            { order: 0, nameFallback: "Leg Press (or Split Squat)", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Overhead Press (Dumbbells)", sets: 3, reps: "8-10", weight: "Moderate" },
            { order: 2, nameFallback: "Seated Cable Row", sets: 3, reps: "10-12", weight: "Moderate" },
            { order: 3, nameFallback: "Hip Hinge (Back Extension or Light Deadlift)", sets: 2, reps: "10", weight: "Light" },
            { order: 4, nameFallback: "Dead Bug", sets: 3, reps: "8/side", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body C",
          items: [
            { order: 0, nameFallback: "Squat Pattern (Front/Goblet)", sets: 3, reps: "8-10", weight: "Moderate" },
            { order: 1, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "8-12", weight: "Moderate" },
            { order: 2, nameFallback: "One-arm Dumbbell Row", sets: 3, reps: "10/side", weight: "Moderate" },
            { order: 3, nameFallback: "Walking Lunges", sets: 2, reps: "10/leg", weight: "Light-Moderate" },
            { order: 4, nameFallback: "Farmer Carry", sets: 3, reps: "30-45s", weight: "Moderate" },
          ],
        },
      ],
    },
  },
  {
    id: "starter-returning-3d-fullbody",
    name: "Starter (Returning) — 3 days/week",
    tags: ["beginner", "returning", "general_fitness", "full_gym"],
    daysPerWeek: 3,
    description:
      "You’ve trained before — ramp back safely with slightly more structure and a bit more volume.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body A (Ramp)",
          items: [
            { order: 0, nameFallback: "Back Squat (or Goblet Squat)", sets: 3, reps: "5-8", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Bench Press", sets: 3, reps: "6-10", weight: "RPE 6-7" },
            { order: 2, nameFallback: "Lat Pulldown", sets: 3, reps: "8-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Romanian Deadlift", sets: 2, reps: "8-10", weight: "RPE 6-7" },
            { order: 4, nameFallback: "Side Plank", sets: 3, reps: "30-45s/side", weight: "Bodyweight" },
          ],
        },
        {
          day: 3,
          label: "Day 2 — Full Body B (Ramp)",
          items: [
            { order: 0, nameFallback: "Deadlift (Light)", sets: 2, reps: "3-5", weight: "RPE 6" },
            { order: 1, nameFallback: "Overhead Press", sets: 3, reps: "6-10", weight: "RPE 6-7" },
            { order: 2, nameFallback: "Row (Cable or Chest-Supported)", sets: 3, reps: "8-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Press", sets: 2, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Hanging Knee Raise", sets: 3, reps: "8-12", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body C (Ramp)",
          items: [
            { order: 0, nameFallback: "Front Squat (or Split Squat)", sets: 3, reps: "6-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Incline Press (DB or BB)", sets: 3, reps: "8-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Pull-up (Assisted ok)", sets: 3, reps: "5-8", weight: "RPE 7" },
            { order: 3, nameFallback: "Hip Thrust", sets: 2, reps: "8-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Farmer Carry", sets: 3, reps: "45-60s", weight: "Moderate" },
          ],
        },
      ],
    },
  },
  {
    id: "fatloss-beginner-3d-db",
    name: "Fat loss (Beginner) — Dumbbells 3 days/week",
    tags: ["beginner", "fat_loss", "dumbbells_only", "general_fitness"],
    daysPerWeek: 3,
    description:
      "Full-body dumbbell training with simple supersets to keep sessions efficient and consistent.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body A (DB)",
          items: [
            { order: 0, nameFallback: "Dumbbell Squat", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Dumbbell Bench Press", sets: 3, reps: "10", weight: "Moderate" },
            { order: 2, nameFallback: "One-arm Dumbbell Row", sets: 3, reps: "10/side", weight: "Moderate" },
            { order: 3, nameFallback: "Dumbbell RDL", sets: 2, reps: "10-12", weight: "Light-Moderate" },
            { order: 4, nameFallback: "Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
          ],
        },
        {
          day: 3,
          label: "Day 2 — Full Body B (DB)",
          items: [
            { order: 0, nameFallback: "Reverse Lunge", sets: 3, reps: "10/leg", weight: "Moderate" },
            { order: 1, nameFallback: "Standing DB Press", sets: 3, reps: "8-10", weight: "Moderate" },
            { order: 2, nameFallback: "Dumbbell Row (Chest-Supported)", sets: 3, reps: "10-12", weight: "Moderate" },
            { order: 3, nameFallback: "Glute Bridge", sets: 2, reps: "12", weight: "Bodyweight/Light DB" },
            { order: 4, nameFallback: "Plank", sets: 3, reps: "30-45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body C (DB)",
          items: [
            { order: 0, nameFallback: "Split Squat", sets: 3, reps: "8-10/leg", weight: "Moderate" },
            { order: 1, nameFallback: "Incline DB Press", sets: 3, reps: "10", weight: "Moderate" },
            { order: 2, nameFallback: "Renegade Row (or DB Row)", sets: 3, reps: "8/side", weight: "Light-Moderate" },
            { order: 3, nameFallback: "DB Swing / Hip Hinge", sets: 2, reps: "12", weight: "Light" },
            { order: 4, nameFallback: "Suitcase Carry", sets: 3, reps: "30-45s/side", weight: "Moderate" },
          ],
        },
      ],
    },
  },
];

export function getTemplates(): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.slice();
}

export function getTemplateById(id: string): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES.find((t) => t.id === id);
}

