export type WeekId = `${number}-${string}`; // e.g. "2026-03" or "2026-W03" depending on formatter

export type WeeklyPlanSnapshot = {
  weekId: string; // string like YYYY-WW
  planId?: string;
  generatedAt: number; // epoch ms
  days: Array<{
    planDayId: string | null;
    title: string;
    dayLabel: string | null; // e.g. "Monday"
    isRestDay: boolean;
    items: Array<{
      exerciseId: string;
      name: string;
      sets: number;
      reps: number;
      weight: number | null;
      order: number;
    }>;
  }>;
};

export type OfflineWorkoutSet = {
  clientSetId: string; // uuid
  exerciseId: string;
  setNumber: number;
  targetReps: number | null;
  actualReps: number;
  targetWeight: number | null;
  actualWeight: number | null;
  rpe: number | null;
  completed: boolean;
  createdAt: string; // ISO
};

export type OfflineWorkoutLog = {
  clientLogId: string; // uuid
  planDayId: string | null;
  date: string; // ISO (workout day)
  startTime: string; // ISO
  endTime: string | null; // ISO
  completed: boolean;
  notes: string | null;
  synced: boolean;
  sets: OfflineWorkoutSet[];
};

export type OfflineWorkoutLogQueue = {
  logs: OfflineWorkoutLog[];
};

export type GuestWorkoutBuilderExercise = {
  exerciseId: string; // can be uuid or a stable "custom_*" id
  name: string;
  order: number;
  targetSets: number | null;
  targetReps: number | null;
  targetWeight: number | null;
};

export type GuestWorkoutBuilderDraft = {
  id: string; // uuid
  name: string;
  notes: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  exercises: GuestWorkoutBuilderExercise[];
};

export type GuestWorkoutSessionPhase =
  | "home"
  | "builder_details"
  | "builder_exercises"
  | "overview"
  | "logging";

/**
 * Persisted state for the guest workout flow (legacy).
 * - `builder` is the "planned workout" (Notes/Sheets style)
 * - `activeLog` is only set after user presses "Start workout"
 */
export type GuestWorkoutSession = {
  phase: GuestWorkoutSessionPhase;
  builder: GuestWorkoutBuilderDraft | null;
  activeLog: OfflineWorkoutLog | null;
  lastUpdatedAt: string; // ISO
};

