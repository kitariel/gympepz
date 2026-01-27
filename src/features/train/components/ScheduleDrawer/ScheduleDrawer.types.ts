import type { PreferredDays } from "@/lib/storage/schedulePrefsRepo";

export type ScheduleDrawerNextSession = {
  label: string;
  dayNumber: number;
};

export type ScheduleDrawerLastCompleted = {
  label: string;
  relativeDate: string; // "Tue", "Yesterday", "2 days ago"
};

export type ScheduleDrawerMissedDay = {
  show: boolean;
  dateText: string; // "Yesterday"
  onTrainToday: () => void;
  onRestToday: () => void;
  onSkipSession: () => void;
};

export type ScheduleDrawerViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Up Next section
  nextSession: ScheduleDrawerNextSession | null;
  lastCompletedSession: ScheduleDrawerLastCompleted | null;

  // Missed day section
  missedDay: ScheduleDrawerMissedDay | null;

  // Preferences section
  preferredDays: PreferredDays | null;
  onEditPreferredDays?: () => void;
};
