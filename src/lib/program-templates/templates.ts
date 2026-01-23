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
  // New templates - Batch 1: Intermediate Strength Programs
  {
    id: "intermediate-strength-gym-6d",
    name: "Intermediate Strength — Gym (6 days/week)",
    tags: ["intermediate", "strength", "full_gym"],
    daysPerWeek: 6,
    description: "High-frequency strength training with focus on compound lifts. Push/Pull/Legs split for maximum strength gains.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Push A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Overhead Press", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Lateral Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Tricep Dips", sets: 3, reps: "8-12", weight: "Bodyweight/Weighted" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Pull A",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 4, reps: "3-5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Pull-ups", sets: 3, reps: "6-10", weight: "Bodyweight/Weighted" },
            { order: 3, nameFallback: "Cable Row", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Barbell Curl", sets: 3, reps: "8-12", weight: "RPE 7" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Legs A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Push B",
          items: [
            { order: 0, nameFallback: "Overhead Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Incline Bench Press", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Cable Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Overhead Tricep Extension", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Pull B",
          items: [
            { order: 0, nameFallback: "Barbell Row", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Lat Pulldown (Wide Grip)", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Seated Cable Row", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Hammer Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 6,
          label: "Day 6 — Legs B",
          items: [
            { order: 0, nameFallback: "Front Squat", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "8-10/leg", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Stiff Leg Deadlift", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-strength-gym-5d",
    name: "Intermediate Strength — Gym (5 days/week)",
    tags: ["intermediate", "strength", "full_gym"],
    daysPerWeek: 5,
    description: "Upper/Lower split with an extra upper body day. Focus on progressive overload for strength gains.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "6-8", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "6-10", weight: "Bodyweight/Weighted" },
            { order: 4, nameFallback: "Tricep Dips", sets: 3, reps: "8-12", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Overhead Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Incline Bench Press", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "T-Bar Row", sets: 3, reps: "6-8", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 4, nameFallback: "Barbell Curl", sets: 3, reps: "8-12", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 4, reps: "3-5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "8-10/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Upper C",
          items: [
            { order: 0, nameFallback: "Close Grip Bench Press", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Cable Row", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Cable Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Hammer Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-strength-gym-4d",
    name: "Intermediate Strength — Gym (4 days/week)",
    tags: ["intermediate", "strength", "full_gym"],
    daysPerWeek: 4,
    description: "Upper/Lower split for balanced strength development. Perfect for those with limited training days.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "6-8", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "6-10", weight: "Bodyweight/Weighted" },
            { order: 4, nameFallback: "Tricep Dips", sets: 3, reps: "8-12", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Overhead Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Incline Bench Press", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "T-Bar Row", sets: 3, reps: "6-8", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 4, nameFallback: "Barbell Curl", sets: 3, reps: "8-12", weight: "RPE 7" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 4, reps: "3-5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "8-10/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  // Batch 2: Muscle Building Programs
  {
    id: "intermediate-muscle-gym-6d",
    name: "Intermediate Muscle Building — Gym (6 days/week)",
    tags: ["intermediate", "build_muscle", "full_gym"],
    daysPerWeek: 6,
    description: "High-volume bodybuilding split. Push/Pull/Legs with focus on hypertrophy and muscle growth.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Push A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Lateral Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Tricep Pushdowns", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Overhead Tricep Extension", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Pull A",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight/Weighted" },
            { order: 3, nameFallback: "Cable Row", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Barbell Curl", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 5, nameFallback: "Hammer Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Legs A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Calf Raises", sets: 4, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Push B",
          items: [
            { order: 0, nameFallback: "Overhead Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Incline Bench Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Cable Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Lateral Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 5, nameFallback: "Tricep Dips", sets: 3, reps: "10-15", weight: "Bodyweight/Weighted" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Pull B",
          items: [
            { order: 0, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Lat Pulldown (Wide Grip)", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Seated Cable Row", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Face Pulls", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 5, nameFallback: "Preacher Curl", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 6,
          label: "Day 6 — Legs B",
          items: [
            { order: 0, nameFallback: "Front Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 3, nameFallback: "Stiff Leg Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Standing Calf Raises", sets: 4, reps: "15-20", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-muscle-gym-5d",
    name: "Intermediate Muscle Building — Gym (5 days/week)",
    tags: ["intermediate", "build_muscle", "full_gym"],
    daysPerWeek: 5,
    description: "Upper/Lower/Upper/Lower/Upper split for balanced muscle development with adequate recovery.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight/Weighted" },
            { order: 4, nameFallback: "Tricep Pushdowns", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Barbell Curl", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Calf Raises", sets: 4, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "T-Bar Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Cable Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Hammer Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Standing Calf Raises", sets: 4, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Upper C",
          items: [
            { order: 0, nameFallback: "Close Grip Bench Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 1, nameFallback: "Cable Row", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 2, nameFallback: "Lateral Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 3, nameFallback: "Face Pulls", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 4, nameFallback: "Overhead Tricep Extension", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 5, nameFallback: "Preacher Curl", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-muscle-gym-4d",
    name: "Intermediate Muscle Building — Gym (4 days/week)",
    tags: ["intermediate", "build_muscle", "full_gym"],
    daysPerWeek: 4,
    description: "Upper/Lower split optimized for muscle growth. Perfect balance of volume and recovery.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight/Weighted" },
            { order: 4, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 5, nameFallback: "Cable Row", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 6, nameFallback: "Tricep Pushdowns", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 7, nameFallback: "Barbell Curl", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Calf Raises", sets: 4, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "T-Bar Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Cable Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Lateral Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 6, nameFallback: "Overhead Tricep Extension", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 7, nameFallback: "Hammer Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Standing Calf Raises", sets: 4, reps: "15-20", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  // Batch 3: Fat Loss Programs
  {
    id: "intermediate-fatloss-gym-6d",
    name: "Intermediate Fat Loss — Gym (6 days/week)",
    tags: ["intermediate", "fat_loss", "full_gym"],
    daysPerWeek: 6,
    description: "High-frequency training with metabolic focus. Combines strength training with conditioning for maximum fat loss.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper + Cardio",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 1, nameFallback: "Barbell Row", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 4, nameFallback: "HIIT Cardio", sets: 1, reps: "20 min", weight: "30s on / 30s off" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower + Cardio",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Walking Lunges", sets: 2, reps: "20/leg", weight: "Light" },
            { order: 4, nameFallback: "Steady Cardio", sets: 1, reps: "25-30 min", weight: "Moderate pace" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Full Body Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Squat to Press", sets: 3, reps: "12", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Bent Over Row", sets: 3, reps: "12", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Burpees", sets: 3, reps: "10", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: Plank", sets: 3, reps: "45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Upper + Cardio",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "HIIT Cardio", sets: 1, reps: "20 min", weight: "30s on / 30s off" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Lower + Cardio",
          items: [
            { order: 0, nameFallback: "Front Squat", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 1, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Calf Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 4, nameFallback: "Steady Cardio", sets: 1, reps: "25-30 min", weight: "Moderate pace" },
          ],
        },
        {
          day: 6,
          label: "Day 6 — Full Body Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Deadlift", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Push-ups", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 2, nameFallback: "Circuit: Jump Squats", sets: 3, reps: "12", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Plank to Row", sets: 3, reps: "10/side", weight: "Light DB" },
            { order: 4, nameFallback: "Circuit: High Knees", sets: 3, reps: "30s", weight: "Bodyweight" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-fatloss-gym-5d",
    name: "Intermediate Fat Loss — Gym (5 days/week)",
    tags: ["intermediate", "fat_loss", "full_gym"],
    daysPerWeek: 5,
    description: "Strength training combined with cardio for effective fat loss. Upper/Lower split with conditioning.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper Strength",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 4, nameFallback: "Cardio Finisher", sets: 1, reps: "15-20 min", weight: "Moderate" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower Strength",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Walking Lunges", sets: 2, reps: "20/leg", weight: "Light" },
            { order: 4, nameFallback: "Cardio Finisher", sets: 1, reps: "15-20 min", weight: "Moderate" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Cardio Focus",
          items: [
            { order: 0, nameFallback: "Warm-up", sets: 1, reps: "5 min", weight: "Easy" },
            { order: 1, nameFallback: "HIIT Intervals", sets: 1, reps: "20 min", weight: "30s on / 30s off" },
            { order: 2, nameFallback: "Cool-down", sets: 1, reps: "5 min", weight: "Easy" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Upper Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Incline Press", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Cable Row", sets: 3, reps: "12", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Push-ups", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Burpees", sets: 3, reps: "10", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: Plank", sets: 3, reps: "45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Lower Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Front Squat", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Bulgarian Split Squat", sets: 3, reps: "10/leg", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Jump Squats", sets: 3, reps: "12", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: High Knees", sets: 3, reps: "30s", weight: "Bodyweight" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-fatloss-gym-4d",
    name: "Intermediate Fat Loss — Gym (4 days/week)",
    tags: ["intermediate", "fat_loss", "full_gym"],
    daysPerWeek: 4,
    description: "Upper/Lower split with metabolic conditioning. Efficient fat loss program for busy schedules.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper + Cardio",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 4, nameFallback: "HIIT Cardio", sets: 1, reps: "20 min", weight: "30s on / 30s off" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower + Cardio",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Walking Lunges", sets: 2, reps: "20/leg", weight: "Light" },
            { order: 4, nameFallback: "Steady Cardio", sets: 1, reps: "25-30 min", weight: "Moderate" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Incline Press", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Cable Row", sets: 3, reps: "12", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Push-ups", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Burpees", sets: 3, reps: "10", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: Plank", sets: 3, reps: "45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Front Squat", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Bulgarian Split Squat", sets: 3, reps: "10/leg", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Jump Squats", sets: 3, reps: "12", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: High Knees", sets: 3, reps: "30s", weight: "Bodyweight" },
          ],
        },
      ],
    },
  },
  // Batch 4: General Fitness Programs
  {
    id: "intermediate-general-gym-6d",
    name: "Intermediate General Fitness — Gym (6 days/week)",
    tags: ["intermediate", "general_fitness", "full_gym"],
    daysPerWeek: 6,
    description: "Well-rounded program combining strength, conditioning, and mobility. Perfect for overall health and fitness.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper Strength",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 1, nameFallback: "Barbell Row", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 4, nameFallback: "Mobility Work", sets: 1, reps: "10 min", weight: "Stretching" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower Strength",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Calf Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 4, nameFallback: "Mobility Work", sets: 1, reps: "10 min", weight: "Stretching" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Cardio & Core",
          items: [
            { order: 0, nameFallback: "Steady Cardio", sets: 1, reps: "30 min", weight: "Moderate" },
            { order: 1, nameFallback: "Plank", sets: 3, reps: "45-60s", weight: "Bodyweight" },
            { order: 2, nameFallback: "Dead Bug", sets: 3, reps: "10/side", weight: "Bodyweight" },
            { order: 3, nameFallback: "Russian Twists", sets: 3, reps: "20", weight: "Bodyweight/Light" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Upper Hypertrophy",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Lateral Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Lower Hypertrophy",
          items: [
            { order: 0, nameFallback: "Front Squat", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 1, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 6,
          label: "Day 6 — Active Recovery",
          items: [
            { order: 0, nameFallback: "Light Cardio", sets: 1, reps: "20-30 min", weight: "Easy pace" },
            { order: 1, nameFallback: "Full Body Mobility", sets: 1, reps: "15-20 min", weight: "Yoga/Stretching" },
            { order: 2, nameFallback: "Foam Rolling", sets: 1, reps: "10 min", weight: "Recovery" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-general-gym-5d",
    name: "Intermediate General Fitness — Gym (5 days/week)",
    tags: ["intermediate", "general_fitness", "full_gym"],
    daysPerWeek: 5,
    description: "Balanced program for overall fitness. Strength, cardio, and mobility in one comprehensive plan.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper Strength",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 4, nameFallback: "Tricep Pushdowns", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Barbell Curl", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower Strength",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Cardio & Core",
          items: [
            { order: 0, nameFallback: "Warm-up", sets: 1, reps: "5 min", weight: "Easy" },
            { order: 1, nameFallback: "HIIT Cardio", sets: 1, reps: "20 min", weight: "30s on / 30s off" },
            { order: 2, nameFallback: "Plank", sets: 3, reps: "45-60s", weight: "Bodyweight" },
            { order: 3, nameFallback: "Dead Bug", sets: 3, reps: "10/side", weight: "Bodyweight" },
            { order: 4, nameFallback: "Russian Twists", sets: 3, reps: "20", weight: "Bodyweight/Light" },
            { order: 5, nameFallback: "Cool-down", sets: 1, reps: "5 min", weight: "Easy" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Upper Hypertrophy",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Cable Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Lateral Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Lower Hypertrophy",
          items: [
            { order: 0, nameFallback: "Front Squat", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 1, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-general-gym-4d",
    name: "Intermediate General Fitness — Gym (4 days/week)",
    tags: ["intermediate", "general_fitness", "full_gym"],
    daysPerWeek: 4,
    description: "Upper/Lower split with cardio elements. Perfect for maintaining overall fitness with limited time.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Barbell Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 4, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 5, nameFallback: "Cable Row", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 6, nameFallback: "Cardio Finisher", sets: 1, reps: "15 min", weight: "Moderate" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Calf Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 6, nameFallback: "Cardio Finisher", sets: 1, reps: "15 min", weight: "Moderate" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "T-Bar Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Cable Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Lateral Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 6, nameFallback: "Cardio Finisher", sets: 1, reps: "15 min", weight: "Moderate" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Leg Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Leg Extension", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Standing Calf Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 6, nameFallback: "Cardio Finisher", sets: 1, reps: "15 min", weight: "Moderate" },
          ],
        },
      ],
    },
  },
  // Batch 5: Dumbbell Programs
  {
    id: "intermediate-strength-db-6d",
    name: "Intermediate Strength — Dumbbells (6 days/week)",
    tags: ["intermediate", "strength", "dumbbells_only"],
    daysPerWeek: 6,
    description: "High-frequency strength training using only dumbbells. Push/Pull/Legs split for home gyms.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Push A",
          items: [
            { order: 0, nameFallback: "Dumbbell Bench Press", sets: 4, reps: "6-8", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Dumbbell Overhead Press", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Lateral Raises", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Overhead Tricep Extension", sets: 3, reps: "8-10", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Pull A",
          items: [
            { order: 0, nameFallback: "Dumbbell Romanian Deadlift", sets: 4, reps: "6-8", weight: "RPE 8-9" },
            { order: 1, nameFallback: "One-arm Dumbbell Row", sets: 4, reps: "6-8/side", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Chest-Supported DB Row", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Renegade Row", sets: 3, reps: "8-10/side", weight: "RPE 7" },
            { order: 4, nameFallback: "Hammer Curls", sets: 3, reps: "8-10", weight: "RPE 7" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Legs A",
          items: [
            { order: 0, nameFallback: "Dumbbell Goblet Squat", sets: 4, reps: "6-8", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "6-8/leg", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Dumbbell RDL", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Walking Lunges", sets: 3, reps: "10/leg", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises (DB)", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Push B",
          items: [
            { order: 0, nameFallback: "Dumbbell Overhead Press", sets: 4, reps: "6-8", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Lateral Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 4, nameFallback: "Tricep Kickbacks", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Pull B",
          items: [
            { order: 0, nameFallback: "One-arm Dumbbell Row", sets: 4, reps: "6-8/side", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Dumbbell Romanian Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Chest-Supported DB Row", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 3, nameFallback: "Renegade Row", sets: 3, reps: "8-10/side", weight: "RPE 7" },
            { order: 4, nameFallback: "Dumbbell Curls", sets: 3, reps: "8-10", weight: "RPE 7" },
          ],
        },
        {
          day: 6,
          label: "Day 6 — Legs B",
          items: [
            { order: 0, nameFallback: "Dumbbell Front Squat", sets: 4, reps: "6-8", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Reverse Lunges", sets: 3, reps: "6-8/leg", weight: "RPE 7-8" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "8-10/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Stiff Leg Deadlift (DB)", sets: 3, reps: "8-10", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises (DB)", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-muscle-db-5d",
    name: "Intermediate Muscle Building — Dumbbells (5 days/week)",
    tags: ["intermediate", "build_muscle", "dumbbells_only"],
    daysPerWeek: 5,
    description: "Hypertrophy-focused program using only dumbbells. Upper/Lower split for muscle growth at home.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Dumbbell Bench Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "One-arm Dumbbell Row", sets: 4, reps: "8-10/side", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Chest-Supported DB Row", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Lateral Raises", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 5, nameFallback: "Hammer Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Dumbbell Goblet Squat", sets: 4, reps: "10-12", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Dumbbell RDL", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Walking Lunges", sets: 3, reps: "12/leg", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises (DB)", sets: 3, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Incline Dumbbell Press", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Chest-Supported DB Row", sets: 4, reps: "8-10", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Renegade Row", sets: 3, reps: "10-12/side", weight: "RPE 7" },
            { order: 4, nameFallback: "Lateral Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 5, nameFallback: "Dumbbell Curls", sets: 3, reps: "10-12", weight: "RPE 7" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Dumbbell Front Squat", sets: 4, reps: "8-10", weight: "RPE 7-8" },
            { order: 1, nameFallback: "Dumbbell Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Reverse Lunges", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "12-15/leg", weight: "RPE 7" },
            { order: 4, nameFallback: "Calf Raises (DB)", sets: 3, reps: "15-20", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Upper C",
          items: [
            { order: 0, nameFallback: "Dumbbell Flyes", sets: 3, reps: "12-15", weight: "RPE 7" },
            { order: 1, nameFallback: "One-arm Dumbbell Row", sets: 3, reps: "12-15/side", weight: "RPE 7" },
            { order: 2, nameFallback: "Lateral Raises", sets: 3, reps: "15-20", weight: "RPE 7" },
            { order: 3, nameFallback: "Overhead Tricep Extension", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "Hammer Curls", sets: 3, reps: "12-15", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  {
    id: "returning-strength-gym-4d",
    name: "Returning Strength — Gym (4 days/week)",
    tags: ["beginner", "returning", "strength", "full_gym"],
    daysPerWeek: 4,
    description: "Ramp back into strength training safely. Upper/Lower split to rebuild strength and technique.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 3, reps: "6-8", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Barbell Row", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 3, nameFallback: "Pull-ups (Assisted ok)", sets: 3, reps: "6-10", weight: "RPE 6" },
            { order: 4, nameFallback: "Tricep Dips", sets: 2, reps: "8-12", weight: "Bodyweight" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 3, reps: "6-8", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 2, nameFallback: "Leg Press", sets: 2, reps: "10-12", weight: "RPE 6" },
            { order: 3, nameFallback: "Leg Curls", sets: 2, reps: "10-12", weight: "RPE 6" },
            { order: 4, nameFallback: "Calf Raises", sets: 2, reps: "12-15", weight: "RPE 6" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 4, nameFallback: "Barbell Curl", sets: 2, reps: "10-12", weight: "RPE 6" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Deadlift (Light)", sets: 3, reps: "3-5", weight: "RPE 6" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "6-8", weight: "RPE 6" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 2, reps: "8-10/leg", weight: "RPE 6" },
            { order: 3, nameFallback: "Leg Extension", sets: 2, reps: "10-12", weight: "RPE 6" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 2, reps: "12-15", weight: "RPE 6" },
          ],
        },
      ],
    },
  },
  {
    id: "returning-muscle-gym-5d",
    name: "Returning Muscle Building — Gym (5 days/week)",
    tags: ["beginner", "returning", "build_muscle", "full_gym"],
    daysPerWeek: 5,
    description: "Rebuild muscle mass safely. Upper/Lower split with moderate volume to regain size and strength.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Barbell Row", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 3, nameFallback: "Pull-ups (Assisted ok)", sets: 3, reps: "8-12", weight: "RPE 6" },
            { order: 4, nameFallback: "Incline Dumbbell Press", sets: 2, reps: "10-12", weight: "RPE 6" },
            { order: 5, nameFallback: "Cable Row", sets: 2, reps: "12-15", weight: "RPE 6" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 6" },
            { order: 3, nameFallback: "Leg Curls", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 4, nameFallback: "Leg Extension", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 5, nameFallback: "Calf Raises", sets: 2, reps: "15-20", weight: "RPE 6" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 4, nameFallback: "Cable Flyes", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 5, nameFallback: "Lateral Raises", sets: 2, reps: "12-15", weight: "RPE 6" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Deadlift (Light)", sets: 3, reps: "5-6", weight: "RPE 6" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 2, reps: "10-12/leg", weight: "RPE 6" },
            { order: 3, nameFallback: "Leg Curls", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 4, nameFallback: "Leg Extension", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 5, nameFallback: "Standing Calf Raises", sets: 2, reps: "15-20", weight: "RPE 6" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Upper C",
          items: [
            { order: 0, nameFallback: "Close Grip Bench Press", sets: 2, reps: "10-12", weight: "RPE 6" },
            { order: 1, nameFallback: "Cable Row", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 2, nameFallback: "Lateral Raises", sets: 2, reps: "15-20", weight: "RPE 6" },
            { order: 3, nameFallback: "Face Pulls", sets: 2, reps: "15-20", weight: "RPE 6" },
            { order: 4, nameFallback: "Tricep Pushdowns", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 5, nameFallback: "Barbell Curl", sets: 2, reps: "10-12", weight: "RPE 6" },
          ],
        },
      ],
    },
  },
  {
    id: "newbie-strength-gym-3d",
    name: "Newbie Strength — Gym (3 days/week)",
    tags: ["beginner", "newbie", "strength", "full_gym"],
    daysPerWeek: 3,
    description: "Perfect for complete beginners. Full-body workouts focusing on learning proper form and building base strength.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body A",
          items: [
            { order: 0, nameFallback: "Goblet Squat", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Bench Press (or Push-ups)", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 2, nameFallback: "Lat Pulldown (or Assisted Pull-up)", sets: 3, reps: "8-12", weight: "Light-Moderate" },
            { order: 3, nameFallback: "Romanian Deadlift (Dumbbells)", sets: 2, reps: "10", weight: "Light" },
            { order: 4, nameFallback: "Plank", sets: 3, reps: "30-45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 3,
          label: "Day 2 — Full Body B",
          items: [
            { order: 0, nameFallback: "Leg Press (or Split Squat)", sets: 3, reps: "10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Overhead Press (Dumbbells)", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 2, nameFallback: "Seated Cable Row", sets: 3, reps: "10-12", weight: "Light-Moderate" },
            { order: 3, nameFallback: "Hip Hinge (Back Extension or Light Deadlift)", sets: 2, reps: "10", weight: "Light" },
            { order: 4, nameFallback: "Dead Bug", sets: 3, reps: "8/side", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body C",
          items: [
            { order: 0, nameFallback: "Squat Pattern (Front/Goblet)", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Incline Dumbbell Press", sets: 3, reps: "8-12", weight: "Light-Moderate" },
            { order: 2, nameFallback: "One-arm Dumbbell Row", sets: 3, reps: "10/side", weight: "Light-Moderate" },
            { order: 3, nameFallback: "Walking Lunges", sets: 2, reps: "10/leg", weight: "Light" },
            { order: 4, nameFallback: "Farmer Carry", sets: 3, reps: "30-45s", weight: "Light-Moderate" },
          ],
        },
      ],
    },
  },
  // Batch 6: Bodyweight Programs
  {
    id: "intermediate-bodyweight-6d",
    name: "Intermediate Bodyweight — Home (6 days/week)",
    tags: ["intermediate", "general_fitness", "bodyweight"],
    daysPerWeek: 6,
    description: "Advanced bodyweight training. Push/Pull/Legs split using only bodyweight exercises for maximum strength.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Push A",
          items: [
            { order: 0, nameFallback: "Push-ups", sets: 4, reps: "10-15", weight: "Bodyweight" },
            { order: 1, nameFallback: "Diamond Push-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 2, nameFallback: "Pike Push-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 3, nameFallback: "Dips (if available)", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 4, nameFallback: "Handstand Push-ups (progression)", sets: 3, reps: "5-10", weight: "Bodyweight" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Pull A",
          items: [
            { order: 0, nameFallback: "Pull-ups", sets: 4, reps: "8-12", weight: "Bodyweight" },
            { order: 1, nameFallback: "Chin-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 2, nameFallback: "Inverted Rows", sets: 3, reps: "10-15", weight: "Bodyweight" },
            { order: 3, nameFallback: "Archer Pull-ups (progression)", sets: 2, reps: "5-8/side", weight: "Bodyweight" },
            { order: 4, nameFallback: "Bodyweight Rows", sets: 3, reps: "10-15", weight: "Bodyweight" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Legs A",
          items: [
            { order: 0, nameFallback: "Pistol Squats (progression)", sets: 3, reps: "5-10/leg", weight: "Bodyweight" },
            { order: 1, nameFallback: "Jump Squats", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "Bodyweight" },
            { order: 3, nameFallback: "Single-leg Glute Bridge", sets: 3, reps: "10-12/leg", weight: "Bodyweight" },
            { order: 4, nameFallback: "Calf Raises", sets: 3, reps: "15-20", weight: "Bodyweight" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Push B",
          items: [
            { order: 0, nameFallback: "Incline Push-ups", sets: 4, reps: "12-15", weight: "Bodyweight" },
            { order: 1, nameFallback: "Archer Push-ups", sets: 3, reps: "6-10/side", weight: "Bodyweight" },
            { order: 2, nameFallback: "Pike Push-ups", sets: 3, reps: "10-12", weight: "Bodyweight" },
            { order: 3, nameFallback: "Dips (if available)", sets: 3, reps: "10-15", weight: "Bodyweight" },
            { order: 4, nameFallback: "Handstand Push-ups (progression)", sets: 3, reps: "5-10", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Pull B",
          items: [
            { order: 0, nameFallback: "Wide Grip Pull-ups", sets: 4, reps: "8-12", weight: "Bodyweight" },
            { order: 1, nameFallback: "Close Grip Pull-ups", sets: 3, reps: "8-12", weight: "Bodyweight" },
            { order: 2, nameFallback: "Inverted Rows", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 3, nameFallback: "Bodyweight Rows", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 4, nameFallback: "Australian Pull-ups", sets: 3, reps: "10-15", weight: "Bodyweight" },
          ],
        },
        {
          day: 6,
          label: "Day 6 — Legs B",
          items: [
            { order: 0, nameFallback: "Jump Squats", sets: 3, reps: "15-20", weight: "Bodyweight" },
            { order: 1, nameFallback: "Reverse Lunges", sets: 3, reps: "12-15/leg", weight: "Bodyweight" },
            { order: 2, nameFallback: "Single-leg Deadlift", sets: 3, reps: "10-12/leg", weight: "Bodyweight" },
            { order: 3, nameFallback: "Glute Bridge", sets: 3, reps: "15-20", weight: "Bodyweight" },
            { order: 4, nameFallback: "Calf Raises", sets: 3, reps: "20-25", weight: "Bodyweight" },
          ],
        },
      ],
    },
  },
  {
    id: "newbie-bodyweight-4d",
    name: "Newbie Bodyweight — Home (4 days/week)",
    tags: ["beginner", "newbie", "general_fitness", "bodyweight"],
    daysPerWeek: 4,
    description: "Beginner-friendly bodyweight program. Build strength and fitness at home with no equipment needed.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body A",
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
          label: "Day 2 — Cardio",
          items: [
            { order: 0, nameFallback: "Brisk Walk", sets: 1, reps: "20-30 min", weight: "Easy" },
            { order: 1, nameFallback: "Optional: Walk Intervals", sets: 1, reps: "10 min", weight: "1 min fast / 1 min easy" },
            { order: 2, nameFallback: "Mobility (Hips/Ankles/Shoulders)", sets: 1, reps: "5-10 min", weight: "Easy" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body B",
          items: [
            { order: 0, nameFallback: "Reverse Lunge", sets: 3, reps: "8-12/leg", weight: "Controlled" },
            { order: 1, nameFallback: "Pike Push-up (or Shoulder Taps)", sets: 3, reps: "6-10", weight: "Stop 2 reps before failure" },
            { order: 2, nameFallback: "Single-leg RDL (Bodyweight)", sets: 3, reps: "8-10/leg", weight: "Balance + control" },
            { order: 3, nameFallback: "Dead Bug", sets: 3, reps: "8/side", weight: "Slow" },
            { order: 4, nameFallback: "Easy Cardio Finisher", sets: 1, reps: "8-12 min", weight: "Walk / bike / jog" },
          ],
        },
        {
          day: 7,
          label: "Day 4 — Active Recovery",
          items: [
            { order: 0, nameFallback: "Light Walk", sets: 1, reps: "20-30 min", weight: "Easy" },
            { order: 1, nameFallback: "Full Body Stretching", sets: 1, reps: "15-20 min", weight: "Yoga/Stretching" },
          ],
        },
      ],
    },
  },
  {
    id: "returning-fatloss-db-5d",
    name: "Returning Fat Loss — Dumbbells (5 days/week)",
    tags: ["beginner", "returning", "fat_loss", "dumbbells_only"],
    daysPerWeek: 5,
    description: "Ramp back into training while losing fat. Dumbbell-based program with cardio elements for home workouts.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper + Cardio",
          items: [
            { order: 0, nameFallback: "Dumbbell Bench Press", sets: 3, reps: "10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "One-arm Dumbbell Row", sets: 3, reps: "10/side", weight: "RPE 6-7" },
            { order: 2, nameFallback: "Dumbbell Overhead Press", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 3, nameFallback: "Lateral Raises", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 4, nameFallback: "HIIT Cardio", sets: 1, reps: "20 min", weight: "30s on / 30s off" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower + Cardio",
          items: [
            { order: 0, nameFallback: "Dumbbell Goblet Squat", sets: 3, reps: "12", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Dumbbell RDL", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 2, nameFallback: "Reverse Lunges", sets: 3, reps: "10/leg", weight: "RPE 6" },
            { order: 3, nameFallback: "Walking Lunges", sets: 2, reps: "12/leg", weight: "Light" },
            { order: 4, nameFallback: "Steady Cardio", sets: 1, reps: "25-30 min", weight: "Moderate" },
          ],
        },
        {
          day: 3,
          label: "Day 3 — Full Body Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: DB Squat to Press", sets: 3, reps: "12", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: DB Row", sets: 3, reps: "12", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Burpees", sets: 3, reps: "10", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: Plank", sets: 3, reps: "45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 4,
          label: "Day 4 — Upper Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Incline DB Press", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Chest-Supported DB Row", sets: 3, reps: "12", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Push-ups", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Renegade Row", sets: 3, reps: "8/side", weight: "Light DB" },
            { order: 4, nameFallback: "Circuit: Burpees", sets: 3, reps: "10", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 5 — Lower Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: DB Front Squat", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Bulgarian Split Squat", sets: 3, reps: "10/leg", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Jump Squats", sets: 3, reps: "12", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: High Knees", sets: 3, reps: "30s", weight: "Bodyweight" },
          ],
        },
      ],
    },
  },
  {
    id: "newbie-general-db-3d",
    name: "Newbie General Fitness — Dumbbells (3 days/week)",
    tags: ["beginner", "newbie", "general_fitness", "dumbbells_only"],
    daysPerWeek: 3,
    description: "Perfect starter program for complete beginners. Full-body dumbbell workouts to build strength and fitness.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body A",
          items: [
            { order: 0, nameFallback: "Dumbbell Squat", sets: 3, reps: "10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Dumbbell Bench Press", sets: 3, reps: "10", weight: "Light-Moderate" },
            { order: 2, nameFallback: "One-arm Dumbbell Row", sets: 3, reps: "10/side", weight: "Light-Moderate" },
            { order: 3, nameFallback: "Dumbbell RDL", sets: 2, reps: "10-12", weight: "Light" },
            { order: 4, nameFallback: "Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
          ],
        },
        {
          day: 3,
          label: "Day 2 — Full Body B",
          items: [
            { order: 0, nameFallback: "Reverse Lunge", sets: 3, reps: "10/leg", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Standing DB Press", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 2, nameFallback: "Dumbbell Row (Chest-Supported)", sets: 3, reps: "10-12", weight: "Light-Moderate" },
            { order: 3, nameFallback: "Glute Bridge", sets: 2, reps: "12", weight: "Bodyweight/Light DB" },
            { order: 4, nameFallback: "Plank", sets: 3, reps: "30-45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body C",
          items: [
            { order: 0, nameFallback: "Split Squat", sets: 3, reps: "8-10/leg", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Incline DB Press", sets: 3, reps: "10", weight: "Light-Moderate" },
            { order: 2, nameFallback: "Renegade Row (or DB Row)", sets: 3, reps: "8/side", weight: "Light" },
            { order: 3, nameFallback: "DB Swing / Hip Hinge", sets: 2, reps: "12", weight: "Light" },
            { order: 4, nameFallback: "Suitcase Carry", sets: 3, reps: "30-45s/side", weight: "Light-Moderate" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-strength-gym-3d",
    name: "Intermediate Strength — Gym (3 days/week)",
    tags: ["intermediate", "strength", "full_gym"],
    daysPerWeek: 3,
    description: "Minimalist strength program. Full-body workouts focusing on heavy compound lifts for maximum strength gains.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Full Body A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Bench Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 2, nameFallback: "Barbell Row", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 3, nameFallback: "Overhead Press", sets: 3, reps: "6-8", weight: "RPE 7" },
            { order: 4, nameFallback: "Pull-ups", sets: 3, reps: "6-10", weight: "Bodyweight/Weighted" },
          ],
        },
        {
          day: 3,
          label: "Day 2 — Full Body B",
          items: [
            { order: 0, nameFallback: "Deadlift", sets: 4, reps: "3-5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Overhead Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 2, nameFallback: "Front Squat", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 3, nameFallback: "Incline Bench Press", sets: 3, reps: "6-8", weight: "RPE 7" },
            { order: 4, nameFallback: "T-Bar Row", sets: 3, reps: "6-8", weight: "RPE 7" },
          ],
        },
        {
          day: 5,
          label: "Day 3 — Full Body C",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 1, nameFallback: "Bench Press", sets: 4, reps: "5", weight: "RPE 8-9" },
            { order: 2, nameFallback: "Romanian Deadlift", sets: 3, reps: "6-8", weight: "RPE 7-8" },
            { order: 3, nameFallback: "Pull-ups", sets: 3, reps: "6-10", weight: "Bodyweight/Weighted" },
            { order: 4, nameFallback: "Barbell Row", sets: 3, reps: "6-8", weight: "RPE 7" },
          ],
        },
      ],
    },
  },
  // Final 3 templates
  {
    id: "newbie-muscle-gym-4d",
    name: "Newbie Muscle Building — Gym (4 days/week)",
    tags: ["beginner", "newbie", "build_muscle", "full_gym"],
    daysPerWeek: 4,
    description: "Beginner-friendly muscle building program. Upper/Lower split to build size and strength safely.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper A",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Barbell Row", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "Light" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "Light-Moderate" },
            { order: 4, nameFallback: "Incline Dumbbell Press", sets: 2, reps: "10-12", weight: "Light" },
            { order: 5, nameFallback: "Cable Row", sets: 2, reps: "12-15", weight: "Light" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower A",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "Light" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "Light" },
            { order: 3, nameFallback: "Leg Curls", sets: 2, reps: "12-15", weight: "Light" },
            { order: 4, nameFallback: "Calf Raises", sets: 2, reps: "15-20", weight: "Light" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper B",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "Light" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "Light-Moderate" },
            { order: 4, nameFallback: "Cable Flyes", sets: 2, reps: "12-15", weight: "Light" },
            { order: 5, nameFallback: "Lateral Raises", sets: 2, reps: "12-15", weight: "Light" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower B",
          items: [
            { order: 0, nameFallback: "Front Squat", sets: 3, reps: "8-10", weight: "Light-Moderate" },
            { order: 1, nameFallback: "Bulgarian Split Squat", sets: 2, reps: "10-12/leg", weight: "Light" },
            { order: 2, nameFallback: "Leg Curls", sets: 2, reps: "12-15", weight: "Light" },
            { order: 3, nameFallback: "Leg Extension", sets: 2, reps: "12-15", weight: "Light" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 2, reps: "15-20", weight: "Light" },
          ],
        },
      ],
    },
  },
  {
    id: "returning-general-gym-4d",
    name: "Returning General Fitness — Gym (4 days/week)",
    tags: ["beginner", "returning", "general_fitness", "full_gym"],
    daysPerWeek: 4,
    description: "Ease back into fitness. Balanced Upper/Lower program combining strength, conditioning, and mobility.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper",
          items: [
            { order: 0, nameFallback: "Bench Press", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Barbell Row", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 2, nameFallback: "Overhead Press", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 3, nameFallback: "Pull-ups (Assisted ok)", sets: 3, reps: "8-12", weight: "RPE 6" },
            { order: 4, nameFallback: "Incline Dumbbell Press", sets: 2, reps: "10-12", weight: "RPE 6" },
            { order: 5, nameFallback: "Cardio Finisher", sets: 1, reps: "15 min", weight: "Moderate" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower",
          items: [
            { order: 0, nameFallback: "Back Squat", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "Romanian Deadlift", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 2, nameFallback: "Leg Press", sets: 3, reps: "12-15", weight: "RPE 6" },
            { order: 3, nameFallback: "Leg Curls", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 4, nameFallback: "Calf Raises", sets: 2, reps: "15-20", weight: "RPE 6" },
            { order: 5, nameFallback: "Cardio Finisher", sets: 1, reps: "15 min", weight: "Moderate" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper",
          items: [
            { order: 0, nameFallback: "Incline Bench Press", sets: 3, reps: "8-10", weight: "RPE 6-7" },
            { order: 1, nameFallback: "T-Bar Row", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 2, nameFallback: "Dumbbell Shoulder Press", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 3, nameFallback: "Lat Pulldown", sets: 3, reps: "10-12", weight: "RPE 6" },
            { order: 4, nameFallback: "Cable Flyes", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 5, nameFallback: "Cardio Finisher", sets: 1, reps: "15 min", weight: "Moderate" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower",
          items: [
            { order: 0, nameFallback: "Deadlift (Light)", sets: 3, reps: "5-6", weight: "RPE 6" },
            { order: 1, nameFallback: "Front Squat", sets: 3, reps: "8-10", weight: "RPE 6" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 2, reps: "10-12/leg", weight: "RPE 6" },
            { order: 3, nameFallback: "Leg Extension", sets: 2, reps: "12-15", weight: "RPE 6" },
            { order: 4, nameFallback: "Standing Calf Raises", sets: 2, reps: "15-20", weight: "RPE 6" },
            { order: 5, nameFallback: "Mobility Work", sets: 1, reps: "10 min", weight: "Stretching" },
          ],
        },
      ],
    },
  },
  {
    id: "intermediate-fatloss-db-4d",
    name: "Intermediate Fat Loss — Dumbbells (4 days/week)",
    tags: ["intermediate", "fat_loss", "dumbbells_only"],
    daysPerWeek: 4,
    description: "Effective fat loss program using only dumbbells. Upper/Lower split with metabolic conditioning.",
    plan: {
      days: [
        {
          day: 1,
          label: "Day 1 — Upper + Cardio",
          items: [
            { order: 0, nameFallback: "Dumbbell Bench Press", sets: 3, reps: "10", weight: "RPE 7" },
            { order: 1, nameFallback: "One-arm Dumbbell Row", sets: 3, reps: "10/side", weight: "RPE 7" },
            { order: 2, nameFallback: "Dumbbell Overhead Press", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 3, nameFallback: "Chest-Supported DB Row", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 4, nameFallback: "HIIT Cardio", sets: 1, reps: "20 min", weight: "30s on / 30s off" },
          ],
        },
        {
          day: 2,
          label: "Day 2 — Lower + Cardio",
          items: [
            { order: 0, nameFallback: "Dumbbell Goblet Squat", sets: 3, reps: "12", weight: "RPE 7" },
            { order: 1, nameFallback: "Dumbbell RDL", sets: 3, reps: "10-12", weight: "RPE 7" },
            { order: 2, nameFallback: "Bulgarian Split Squat", sets: 3, reps: "10-12/leg", weight: "RPE 7" },
            { order: 3, nameFallback: "Walking Lunges", sets: 2, reps: "12/leg", weight: "RPE 7" },
            { order: 4, nameFallback: "Steady Cardio", sets: 1, reps: "25-30 min", weight: "Moderate" },
          ],
        },
        {
          day: 4,
          label: "Day 3 — Upper Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: Incline DB Press", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: DB Row", sets: 3, reps: "12", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Push-ups", sets: 3, reps: "12-15", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Burpees", sets: 3, reps: "10", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: Plank", sets: 3, reps: "45s", weight: "Bodyweight" },
          ],
        },
        {
          day: 6,
          label: "Day 4 — Lower Circuit",
          items: [
            { order: 0, nameFallback: "Circuit: DB Front Squat", sets: 3, reps: "10", weight: "Moderate" },
            { order: 1, nameFallback: "Circuit: Reverse Lunges", sets: 3, reps: "10/leg", weight: "Moderate" },
            { order: 2, nameFallback: "Circuit: Jump Squats", sets: 3, reps: "12", weight: "Bodyweight" },
            { order: 3, nameFallback: "Circuit: Mountain Climbers", sets: 3, reps: "30s", weight: "Bodyweight" },
            { order: 4, nameFallback: "Circuit: High Knees", sets: 3, reps: "30s", weight: "Bodyweight" },
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

