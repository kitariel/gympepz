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

