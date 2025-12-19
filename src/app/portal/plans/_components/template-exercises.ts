// Template exercise definitions for auto-populate

export const TEMPLATE_DEFINITIONS: Record<
  string,
  {
    name: string;
    days: Array<{
      title: string;
      exerciseNames: Array<{ name: string; sets: number; reps: number; weight?: number }>;
    }>;
  }
> = {
  ppl: {
    name: "Push/Pull/Legs",
    days: [
      {
        title: "Push Day 1",
        exerciseNames: [
          { name: "Bench Press", sets: 4, reps: 8, weight: undefined },
          { name: "Overhead Press", sets: 3, reps: 10, weight: undefined },
          { name: "Incline Bench Press", sets: 3, reps: 10, weight: undefined },
          { name: "Lateral Raise", sets: 3, reps: 12, weight: undefined },
          { name: "Triceps Pushdown", sets: 3, reps: 12, weight: undefined },
        ],
      },
      {
        title: "Pull Day 1",
        exerciseNames: [
          { name: "Deadlift", sets: 4, reps: 5, weight: undefined },
          { name: "Bent-over Row", sets: 4, reps: 8, weight: undefined },
          { name: "Pull-up", sets: 3, reps: 10, weight: undefined },
          { name: "Barbell Curl", sets: 3, reps: 10, weight: undefined },
          { name: "Face Pull", sets: 3, reps: 15, weight: undefined },
        ],
      },
      {
        title: "Legs Day 1",
        exerciseNames: [
          { name: "Squat", sets: 4, reps: 8, weight: undefined },
          { name: "Romanian Deadlift", sets: 3, reps: 10, weight: undefined },
          { name: "Leg Press", sets: 3, reps: 12, weight: undefined },
          { name: "Leg Extension", sets: 3, reps: 12, weight: undefined },
          { name: "Leg Curl", sets: 3, reps: 12, weight: undefined },
        ],
      },
      {
        title: "Push Day 2",
        exerciseNames: [
          { name: "Incline Bench Press", sets: 4, reps: 8, weight: undefined },
          { name: "Overhead Press", sets: 4, reps: 8, weight: undefined },
          { name: "Chest Fly", sets: 3, reps: 12, weight: undefined },
          { name: "Lateral Raise", sets: 3, reps: 12, weight: undefined },
          { name: "Overhead Triceps Extension", sets: 3, reps: 12, weight: undefined },
        ],
      },
      {
        title: "Pull Day 2",
        exerciseNames: [
          { name: "Bent-over Row", sets: 4, reps: 8, weight: undefined },
          { name: "Lat Pulldown", sets: 3, reps: 10, weight: undefined },
          { name: "Seated Row", sets: 3, reps: 10, weight: undefined },
          { name: "Hammer Curl", sets: 3, reps: 10, weight: undefined },
          { name: "Rear Delt Fly", sets: 3, reps: 15, weight: undefined },
        ],
      },
      {
        title: "Legs Day 2",
        exerciseNames: [
          { name: "Squat", sets: 4, reps: 8, weight: undefined },
          { name: "Bulgarian Split Squat", sets: 3, reps: 10, weight: undefined },
          { name: "Leg Press", sets: 4, reps: 10, weight: undefined },
          { name: "Lunge", sets: 3, reps: 12, weight: undefined },
          { name: "Leg Curl", sets: 3, reps: 12, weight: undefined },
        ],
      },
    ],
  },
  "upper-lower": {
    name: "Upper/Lower Split",
    days: [
      {
        title: "Upper Body Day 1",
        exerciseNames: [
          { name: "Bench Press", sets: 4, reps: 6, weight: undefined },
          { name: "Bent-over Row", sets: 4, reps: 6, weight: undefined },
          { name: "Overhead Press", sets: 3, reps: 8, weight: undefined },
          { name: "Pull-up", sets: 3, reps: 10, weight: undefined },
          { name: "Barbell Curl", sets: 3, reps: 10, weight: undefined },
          { name: "Triceps Pushdown", sets: 3, reps: 10, weight: undefined },
        ],
      },
      {
        title: "Lower Body Day 1",
        exerciseNames: [
          { name: "Squat", sets: 4, reps: 6, weight: undefined },
          { name: "Deadlift", sets: 4, reps: 5, weight: undefined },
          { name: "Leg Press", sets: 3, reps: 10, weight: undefined },
          { name: "Leg Curl", sets: 3, reps: 10, weight: undefined },
          { name: "Standing Calf Raise", sets: 3, reps: 15, weight: undefined },
        ],
      },
      {
        title: "Upper Body Day 2",
        exerciseNames: [
          { name: "Incline Bench Press", sets: 4, reps: 8, weight: undefined },
          { name: "Seated Row", sets: 4, reps: 8, weight: undefined },
          { name: "Lateral Raise", sets: 3, reps: 12, weight: undefined },
          { name: "Lat Pulldown", sets: 3, reps: 10, weight: undefined },
          { name: "Barbell Curl", sets: 3, reps: 10, weight: undefined },
          { name: "Overhead Triceps Extension", sets: 3, reps: 10, weight: undefined },
        ],
      },
      {
        title: "Lower Body Day 2",
        exerciseNames: [
          { name: "Squat", sets: 4, reps: 8, weight: undefined },
          { name: "Romanian Deadlift", sets: 3, reps: 10, weight: undefined },
          { name: "Lunge", sets: 3, reps: 12, weight: undefined },
          { name: "Leg Extension", sets: 3, reps: 12, weight: undefined },
          { name: "Standing Calf Raise", sets: 3, reps: 15, weight: undefined },
        ],
      },
    ],
  },
  "full-body": {
    name: "Full Body 3x",
    days: [
      {
        title: "Full Body Day 1",
        exerciseNames: [
          { name: "Squat", sets: 3, reps: 8, weight: undefined },
          { name: "Bench Press", sets: 3, reps: 8, weight: undefined },
          { name: "Bent-over Row", sets: 3, reps: 8, weight: undefined },
          { name: "Overhead Press", sets: 3, reps: 10, weight: undefined },
          { name: "Barbell Curl", sets: 2, reps: 12, weight: undefined },
        ],
      },
      {
        title: "Full Body Day 2",
        exerciseNames: [
          { name: "Deadlift", sets: 3, reps: 5, weight: undefined },
          { name: "Incline Bench Press", sets: 3, reps: 10, weight: undefined },
          { name: "Pull-up", sets: 3, reps: 10, weight: undefined },
          { name: "Lateral Raise", sets: 3, reps: 12, weight: undefined },
          { name: "Triceps Pushdown", sets: 2, reps: 12, weight: undefined },
        ],
      },
      {
        title: "Full Body Day 3",
        exerciseNames: [
          { name: "Squat", sets: 3, reps: 8, weight: undefined },
          { name: "Chest Press", sets: 3, reps: 10, weight: undefined },
          { name: "Seated Row", sets: 3, reps: 10, weight: undefined },
          { name: "Overhead Press", sets: 3, reps: 10, weight: undefined },
          { name: "Barbell Curl", sets: 2, reps: 12, weight: undefined },
        ],
      },
    ],
  },
  "bro-split": {
    name: "Bro Split",
    days: [
      {
        title: "Chest Day",
        exerciseNames: [
          { name: "Bench Press", sets: 4, reps: 8, weight: undefined },
          { name: "Incline Bench Press", sets: 3, reps: 10, weight: undefined },
          { name: "Chest Fly", sets: 3, reps: 12, weight: undefined },
          { name: "Cable Crossover", sets: 3, reps: 12, weight: undefined },
        ],
      },
      {
        title: "Back Day",
        exerciseNames: [
          { name: "Deadlift", sets: 4, reps: 6, weight: undefined },
          { name: "Bent-over Row", sets: 4, reps: 8, weight: undefined },
          { name: "Pull-up", sets: 3, reps: 10, weight: undefined },
          { name: "Lat Pulldown", sets: 3, reps: 10, weight: undefined },
          { name: "Seated Row", sets: 3, reps: 10, weight: undefined },
        ],
      },
      {
        title: "Shoulders Day",
        exerciseNames: [
          { name: "Overhead Press", sets: 4, reps: 8, weight: undefined },
          { name: "Lateral Raise", sets: 4, reps: 12, weight: undefined },
          { name: "Front Raise", sets: 3, reps: 12, weight: undefined },
          { name: "Rear Delt Fly", sets: 3, reps: 15, weight: undefined },
        ],
      },
      {
        title: "Arms Day",
        exerciseNames: [
          { name: "Barbell Curl", sets: 4, reps: 10, weight: undefined },
          { name: "Hammer Curl", sets: 3, reps: 10, weight: undefined },
          { name: "Triceps Pushdown", sets: 4, reps: 10, weight: undefined },
          { name: "Overhead Triceps Extension", sets: 3, reps: 12, weight: undefined },
        ],
      },
      {
        title: "Legs Day",
        exerciseNames: [
          { name: "Squat", sets: 4, reps: 8, weight: undefined },
          { name: "Leg Press", sets: 4, reps: 10, weight: undefined },
          { name: "Leg Extension", sets: 3, reps: 12, weight: undefined },
          { name: "Leg Curl", sets: 3, reps: 12, weight: undefined },
          { name: "Standing Calf Raise", sets: 4, reps: 15, weight: undefined },
        ],
      },
    ],
  },
};
