import { z } from "zod";

// Enhanced workout planner state to track conversation context
export const WorkoutPlannerState = z.object({
  createdDays: z.array(z.string()).default([]),
  userGoal: z.string().optional(),
  userExperience: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  userEquipment: z
    .enum(["Full Gym", "Dumbbells", "Home Setup", "Hybrid"])
    .optional(),
  lastMuscleGroups: z.array(z.string()).default([]),
});
