export type TrainEntryLinkCta = {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost";
};

export type TrainEntryStartCard =
  | { kind: "loading" }
  | { kind: "draft"; cta: TrainEntryLinkCta; programName: string; dayLabel: string | null }
  | {
      kind: "program";
      primary: TrainEntryLinkCta;
      secondary: TrainEntryLinkCta;
      programName: string;
      dayLabel: string | null;
      setsProgress: string | null;
    }
  | { kind: "profile"; cta: TrainEntryLinkCta }
  | { kind: "new"; primary: TrainEntryLinkCta; secondary: TrainEntryLinkCta };

export type RecentWorkoutItem = {
  id: string;
  dateText: string;
  dayLabel: string | null;
  setsCount: number;
};

export type TrainEntryScreenViewProps = {
  statusText: string;
  sessionsText: string;
  startCard: TrainEntryStartCard;
  recentWorkouts: RecentWorkoutItem[];
  historyHref: string;
  templatesHref: string;
  buildHref: string;
  plansHref: string;
};
