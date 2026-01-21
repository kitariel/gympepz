export type HistoryListItemVM = {
  id: string;
  dateText: string;
  dayLabel: string | null;
  programName: string;
  statusText: string;
  exercisesCount: number;
  setsCount: number;
};

export type HistoryListTimeGroupVM = {
  label: "Today" | "Yesterday" | "This Week" | "Earlier";
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
      onDeleteItem: (id: string) => void;
      clearDisabled: boolean;
      timeGroups: HistoryListTimeGroupVM[];
      backHref: string;
    };
