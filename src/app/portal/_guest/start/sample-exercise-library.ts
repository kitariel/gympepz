export type SampleExercise = {
  id: string;
  name: string;
  muscleGroup?: string;
};

/**
 * Minimal offline exercise library for Guest Mode.
 * - Used for search/suggestions when guest is offline.
 * - Guests can always add custom exercises by name.
 *
 * TODO: optionally hydrate from real DB when online.
 */
export const SAMPLE_EXERCISES: SampleExercise[] = [
  { id: "ex_squat", name: "Back Squat", muscleGroup: "Legs" },
  { id: "ex_front_squat", name: "Front Squat", muscleGroup: "Legs" },
  { id: "ex_deadlift", name: "Deadlift", muscleGroup: "Back/Legs" },
  { id: "ex_rdl", name: "Romanian Deadlift", muscleGroup: "Legs" },
  { id: "ex_bench", name: "Bench Press", muscleGroup: "Chest" },
  { id: "ex_incline_bench", name: "Incline Bench Press", muscleGroup: "Chest" },
  { id: "ex_ohp", name: "Overhead Press", muscleGroup: "Shoulders" },
  { id: "ex_row", name: "Dumbbell Row", muscleGroup: "Back" },
  { id: "ex_barbell_row", name: "Barbell Row", muscleGroup: "Back" },
  { id: "ex_pullup", name: "Pull-up", muscleGroup: "Back" },
  { id: "ex_lat_pulldown", name: "Lat Pulldown", muscleGroup: "Back" },
  { id: "ex_dip", name: "Dip", muscleGroup: "Chest/Triceps" },
  { id: "ex_curl", name: "Biceps Curl", muscleGroup: "Arms" },
  { id: "ex_triceps", name: "Triceps Pushdown", muscleGroup: "Arms" },
  { id: "ex_legpress", name: "Leg Press", muscleGroup: "Legs" },
  { id: "ex_legcurl", name: "Leg Curl", muscleGroup: "Legs" },
  { id: "ex_legext", name: "Leg Extension", muscleGroup: "Legs" },
  { id: "ex_calf", name: "Calf Raise", muscleGroup: "Legs" },
];

