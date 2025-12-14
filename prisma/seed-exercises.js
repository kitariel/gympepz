import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const groups = {
  chest: [
    "Bench Press",
    "Incline Bench Press",
    "Decline Bench Press",
    "Chest Fly",
    "Cable Crossover",
    "Push-up",
    "Chest Press",
  ],
  back: [
    "Deadlift",
    "Bent-over Row",
    "Lat Pulldown",
    "Seated Row",
    "Pull-up",
    "T-Bar Row",
    "Single-arm Row",
  ],
  legs: [
    "Back Squat",
    "Front Squat",
    "Leg Press",
    "Lunge",
    "Romanian Deadlift",
    "Leg Extension",
    "Leg Curl",
  ],
  shoulders: [
    "Overhead Press",
    "Arnold Press",
    "Lateral Raise",
    "Front Raise",
    "Rear Delt Fly",
    "Upright Row",
  ],
  biceps: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Preacher Curl",
    "Cable Curl",
    "Hammer Curl",
  ],
  triceps: [
    "Skullcrusher",
    "Triceps Pushdown",
    "Overhead Triceps Extension",
    "Close-grip Bench Press",
    "Dips",
  ],
  core: [
    "Plank",
    "Hanging Leg Raise",
    "Cable Crunch",
    "Russian Twist",
    "Ab Wheel Rollout",
  ],
  glutes: [
    "Hip Thrust",
    "Glute Bridge",
    "Cable Kickback",
    "Sumo Deadlift",
  ],
  calves: [
    "Standing Calf Raise",
    "Seated Calf Raise",
    "Donkey Calf Raise",
  ],
};

const equipments = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];

function makeVariants(baseName, muscleGroup) {
  const variants = [];
  for (const eq of equipments) {
    const name = `${eq} ${baseName}`;
    variants.push({
      name,
      muscleGroup,
      equipment: eq,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      description: `${name} targeting ${muscleGroup}.`,
      howTo: `Perform ${name} with controlled form; focus on range of motion.`,
      imageUrl: undefined,
    });
  }
  return variants;
}

function buildData() {
  const items = [];
  for (const [group, names] of Object.entries(groups)) {
    for (const base of names) {
      const variants = makeVariants(base, group);
      items.push(...variants);
    }
  }
  // Add common cardio/conditioning entries
  const cardio = [
    { name: "Rowing Erg", muscleGroup: "conditioning", equipment: "Machine" },
    { name: "Assault Bike", muscleGroup: "conditioning", equipment: "Machine" },
    { name: "Jump Rope", muscleGroup: "conditioning", equipment: "Bodyweight" },
  ].map((c) => ({
    ...c,
    difficulty: "Intermediate",
    description: `${c.name} for conditioning.`,
    howTo: `Maintain steady pace and proper technique for ${c.name}.`,
    imageUrl: undefined,
  }));
  items.push(...cardio);
  // Limit to ~180 entries for initial seed
  return items.slice(0, 180);
}

async function main() {
  const count = await prisma.exercise.count();
  if (count > 0) {
    console.log(`[seed] Skipping: ${count} exercises already present.`);
    return;
  }
  const data = buildData();
  const res = await prisma.exercise.createMany({ data });
  console.log(`[seed] Inserted ${res.count} exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });