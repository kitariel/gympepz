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
    "Dumbbell Pullover",
    "Pec Deck",
    "Diamond Push-up",
    "Wide Push-up",
    "Decline Push-up",
    "Resistance Band Chest Press",
    "Svend Press",
    "Floor Press",
  ],
  back: [
    "Deadlift",
    "Bent-over Row",
    "Lat Pulldown",
    "Seated Row",
    "Pull-up",
    "T-Bar Row",
    "Single-arm Row",
    "Chin-up",
    "Face Pull",
    "Inverted Row",
    "Pendlay Row",
    "Meadows Row",
    "Chest Supported Row",
    "Yates Row",
    "Wide Grip Pull-up",
    "Neutral Grip Pull-up",
    "Rack Pull",
    "Shrug",
    "Seal Row",
  ],
  legs: [
    "Back Squat",
    "Front Squat",
    "Leg Press",
    "Lunge",
    "Romanian Deadlift",
    "Leg Extension",
    "Leg Curl",
    "Bulgarian Split Squat",
    "Hack Squat",
    "Goblet Squat",
    "Sumo Squat",
    "Walking Lunge",
    "Reverse Lunge",
    "Step-up",
    "Box Jump",
    "Pistol Squat",
    "Sissy Squat",
    "Nordic Curl",
    "Good Morning",
    "Zercher Squat",
  ],
  shoulders: [
    "Overhead Press",
    "Arnold Press",
    "Lateral Raise",
    "Front Raise",
    "Rear Delt Fly",
    "Upright Row",
    "Military Press",
    "Push Press",
    "Bradford Press",
    "Landmine Press",
    "Cuban Press",
    "Bus Driver",
    "Y-Raise",
    "W-Raise",
    "Scaption",
    "Pike Push-up",
    "Handstand Push-up",
  ],
  biceps: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Preacher Curl",
    "Cable Curl",
    "Hammer Curl",
    "Concentration Curl",
    "Spider Curl",
    "Incline Curl",
    "Zottman Curl",
    "Drag Curl",
    "21s",
    "Reverse Curl",
    "Cross Body Hammer Curl",
  ],
  triceps: [
    "Skullcrusher",
    "Triceps Pushdown",
    "Overhead Triceps Extension",
    "Close-grip Bench Press",
    "Dips",
    "Diamond Push-up",
    "Kickback",
    "JM Press",
    "Tate Press",
    "Rolling Triceps Extension",
    "Bench Dip",
    "Rope Pushdown",
  ],
  core: [
    "Plank",
    "Hanging Leg Raise",
    "Cable Crunch",
    "Russian Twist",
    "Ab Wheel Rollout",
    "Mountain Climber",
    "Bird Dog",
    "Dead Bug",
    "Pallof Press",
    "Hollow Hold",
    "V-up",
    "Bicycle Crunch",
    "Side Plank",
    "Dragon Flag",
    "L-sit",
    "Turkish Get-up",
    "Landmine Rotation",
    "Wood Chop",
  ],
  glutes: [
    "Hip Thrust",
    "Glute Bridge",
    "Cable Kickback",
    "Sumo Deadlift",
    "Single-leg Hip Thrust",
    "Frog Pump",
    "Glute Ham Raise",
    "Fire Hydrant",
    "Donkey Kick",
    "Curtsy Lunge",
    "Clamshell",
  ],
  calves: [
    "Standing Calf Raise",
    "Seated Calf Raise",
    "Donkey Calf Raise",
    "Single-leg Calf Raise",
    "Calf Press on Leg Press",
    "Jump Rope",
  ],
  forearms: [
    "Wrist Curl",
    "Reverse Wrist Curl",
    "Farmer's Walk",
    "Dead Hang",
    "Plate Pinch",
    "Wrist Roller",
    "Reverse Curl",
  ],
  traps: [
    "Barbell Shrug",
    "Dumbbell Shrug",
    "Face Pull",
    "Farmer's Walk",
    "Rack Pull",
    "Upright Row",
  ],
};

const equipments = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];

/**
 * @param {string} baseName
 * @param {string} muscleGroup
 */
function makeVariants(baseName, muscleGroup) {
  const variants = [];

  // Some exercises naturally belong to specific equipment
  const bodyweightOnly = [
    "Push-up",
    "Diamond Push-up",
    "Wide Push-up",
    "Decline Push-up",
    "Pull-up",
    "Chin-up",
    "Inverted Row",
    "Wide Grip Pull-up",
    "Neutral Grip Pull-up",
    "Pistol Squat",
    "Box Jump",
    "Pike Push-up",
    "Handstand Push-up",
    "Mountain Climber",
    "Bird Dog",
    "Dead Bug",
    "Hollow Hold",
    "V-up",
    "Bicycle Crunch",
    "Side Plank",
    "Dragon Flag",
    "L-sit",
    "Fire Hydrant",
    "Donkey Kick",
    "Clamshell",
    "Dead Hang",
  ];

  const machineOnly = [
    "Leg Press",
    "Leg Extension",
    "Leg Curl",
    "Pec Deck",
    "Hack Squat",
    "Sissy Squat",
    "Calf Press on Leg Press",
  ];

  const cableOnly = [
    "Cable Crossover",
    "Cable Crunch",
    "Cable Kickback",
    "Cable Curl",
    "Triceps Pushdown",
    "Rope Pushdown",
    "Pallof Press",
    "Landmine Rotation",
    "Wood Chop",
  ];

  const barbellOnly = [
    "Deadlift",
    "Rack Pull",
    "Pendlay Row",
    "Yates Row",
    "Good Morning",
    "Zercher Squat",
    "Bradford Press",
    "Military Press",
    "21s",
  ];

  if (bodyweightOnly.includes(baseName)) {
    variants.push({
      name: baseName,
      muscleGroup,
      equipment: "Bodyweight",
      category: "Bodyweight",
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      description: `${baseName} targeting ${muscleGroup}.`,
      howTo: `Perform ${baseName} with controlled form; focus on range of motion.`,
      imageUrl: undefined,
    });
  } else if (machineOnly.includes(baseName)) {
    variants.push({
      name: baseName,
      muscleGroup,
      equipment: "Machine",
      category: "Full Gym",
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      description: `${baseName} targeting ${muscleGroup}.`,
      howTo: `Perform ${baseName} with controlled form; focus on range of motion.`,
      imageUrl: undefined,
    });
  } else if (cableOnly.includes(baseName)) {
    variants.push({
      name: baseName,
      muscleGroup,
      equipment: "Cable",
      category: "Full Gym",
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      description: `${baseName} targeting ${muscleGroup}.`,
      howTo: `Perform ${baseName} with controlled form; focus on range of motion.`,
      imageUrl: undefined,
    });
  } else if (barbellOnly.includes(baseName)) {
    variants.push({
      name: baseName,
      muscleGroup,
      equipment: "Barbell",
      category: "Full Gym",
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      description: `${baseName} targeting ${muscleGroup}.`,
      howTo: `Perform ${baseName} with controlled form; focus on range of motion.`,
      imageUrl: undefined,
    });
  } else {
    // Create variants for exercises that can be done with multiple equipment types
    for (const eq of equipments) {
      const name = `${eq} ${baseName}`;
      const category =
        eq === "Bodyweight"
          ? "Bodyweight"
          : eq === "Dumbbell"
            ? "Dumbbell"
            : "Full Gym";
      variants.push({
        name,
        muscleGroup,
        equipment: eq,
        category,
        difficulty:
          difficulties[Math.floor(Math.random() * difficulties.length)],
        description: `${name} targeting ${muscleGroup}.`,
        howTo: `Perform ${name} with controlled form; focus on range of motion.`,
        imageUrl: undefined,
      });
    }
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

  // Add cardio/conditioning exercises
  const cardio = [
    { name: "Rowing Erg", muscleGroup: "conditioning", equipment: "Machine" },
    { name: "Assault Bike", muscleGroup: "conditioning", equipment: "Machine" },
    { name: "Jump Rope", muscleGroup: "conditioning", equipment: "Bodyweight" },
    { name: "Burpee", muscleGroup: "conditioning", equipment: "Bodyweight" },
    {
      name: "Battle Ropes",
      muscleGroup: "conditioning",
      equipment: "Bodyweight",
    },
    { name: "Sled Push", muscleGroup: "conditioning", equipment: "Machine" },
    { name: "Sled Pull", muscleGroup: "conditioning", equipment: "Machine" },
    {
      name: "Stair Climber",
      muscleGroup: "conditioning",
      equipment: "Machine",
    },
    { name: "Elliptical", muscleGroup: "conditioning", equipment: "Machine" },
    {
      name: "Treadmill Run",
      muscleGroup: "conditioning",
      equipment: "Machine",
    },
    { name: "Sprint", muscleGroup: "conditioning", equipment: "Bodyweight" },
    {
      name: "High Knees",
      muscleGroup: "conditioning",
      equipment: "Bodyweight",
    },
    {
      name: "Box Step-up",
      muscleGroup: "conditioning",
      equipment: "Bodyweight",
    },
  ].map((c) => {
    const category =
      c.equipment === "Bodyweight"
        ? "Bodyweight"
        : c.equipment === "Dumbbell"
          ? "Dumbbell"
          : "Full Gym";
    return {
      ...c,
      category,
      difficulty: "Intermediate",
      description: `${c.name} for conditioning.`,
      howTo: `Maintain steady pace and proper technique for ${c.name}.`,
      imageUrl: undefined,
    };
  });
  items.push(...cardio);

  // Add Olympic lifts and complex movements
  const olympic = [
    { name: "Power Clean", muscleGroup: "legs", equipment: "Barbell" },
    { name: "Hang Clean", muscleGroup: "legs", equipment: "Barbell" },
    { name: "Clean and Jerk", muscleGroup: "legs", equipment: "Barbell" },
    { name: "Snatch", muscleGroup: "legs", equipment: "Barbell" },
    { name: "Hang Snatch", muscleGroup: "legs", equipment: "Barbell" },
    { name: "Power Snatch", muscleGroup: "legs", equipment: "Barbell" },
    { name: "Thruster", muscleGroup: "legs", equipment: "Barbell" },
  ].map((o) => ({
    ...o,
    category: "Full Gym",
    difficulty: "Advanced",
    description: `${o.name} - explosive Olympic-style lift.`,
    howTo: `Perform ${o.name} with explosive power and proper Olympic lifting technique.`,
    imageUrl: undefined,
  }));
  items.push(...olympic);

  return items;
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
