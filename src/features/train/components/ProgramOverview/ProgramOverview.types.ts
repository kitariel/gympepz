export type ProgramOverviewSelectedDay = "auto" | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ProgramOverviewPickedVM = {
  title: "Today" | "Next workout";
  dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  label: string;
  items: Array<{ name: string; setsText: string }>;
};

export type ProgramOverviewWeekDayVM = {
  dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  label: string;
  exercisesCount: number;
};

export type ProgramOverviewViewProps =
  | { kind: "loading" }
  | {
      kind: "noProgram";
      onBrowseTemplates: () => void;
    }
  | {
      kind: "ready";
      programName: string;
      selectedDay: ProgramOverviewSelectedDay;
      onSelectedDayChange: (value: ProgramOverviewSelectedDay) => void;
      onClearProgram: () => void;
      picked: ProgramOverviewPickedVM | null;
      week: ProgramOverviewWeekDayVM[];
      primaryCtaText: string;
      onPrimaryCta: () => void;
      repeatPromptEnabled: boolean;
      onConfirmRepeat: () => void;
      onChangeProgram: () => void;
    };

