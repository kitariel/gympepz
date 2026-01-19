export type TrainingExperience = "newbie" | "returning" | "intermediate";

export type TrainingGoal =
  | "build_muscle"
  | "fat_loss"
  | "strength"
  | "general_fitness";

export type TrainingEquipment = "full_gym" | "dumbbells_only" | "bodyweight";

export type UserTrainingProfile = {
  experience: TrainingExperience;
  goal: TrainingGoal;
  equipment: TrainingEquipment;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export function nowIso(): string {
  return new Date().toISOString();
}

