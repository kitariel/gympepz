export type HistoryListItemVM = {
  id: string;
  dateText: string;
  dayLabel: string | null;
  statusText: string;
  exercisesCount: number;
  setsCount: number;
};

export type HistoryListGroupVM = {
  programName: string;
  sessionsCount: number;
  items: HistoryListItemVM[];
};

export type HistoryListViewProps =
  | { kind: "loading" }
  | {
      kind: "empty";
      sessionsText: string;
      onClear: () => void;
      clearDisabled: boolean;
      backHref: string;
      goToTrainHref: string;
    }
  | {
      kind: "ready";
      sessionsText: string;
      onClear: () => void;
      clearDisabled: boolean;
      groups: HistoryListGroupVM[];
      backHref: string;
    };

