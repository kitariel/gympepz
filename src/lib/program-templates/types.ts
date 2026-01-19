export type TemplateTag =
  | "beginner"
  | "newbie"
  | "returning"
  | "intermediate"
  | "fat_loss"
  | "build_muscle"
  | "strength"
  | "general_fitness"
  | "full_gym"
  | "dumbbells_only"
  | "bodyweight";

export type TemplateDayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ProgramTemplateItem = {
  /**
   * Optional: can map to your DB exercise library later.
   * For now, nameFallback is enough for offline-first templates.
   */
  exerciseId?: string;
  nameFallback?: string;
  sets: number;
  /**
   * String is intentional for v1 flexibility: "8-12", "AMRAP", "5", etc.
   */
  reps: string;
  /**
   * Optional guidance string: "RPE 7", "Light", "Moderate", etc.
   */
  weight?: string;
  order: number;
};

export type ProgramTemplateDay = {
  day: TemplateDayNumber;
  label: string; // e.g. "Day 1 - Full Body A"
  isRestDay?: boolean;
  items: ProgramTemplateItem[];
};

export type ProgramTemplate = {
  id: string;
  name: string;
  tags: TemplateTag[];
  daysPerWeek: number;
  description: string;
  weeks?: number;
  plan: {
    days: ProgramTemplateDay[];
  };
};

