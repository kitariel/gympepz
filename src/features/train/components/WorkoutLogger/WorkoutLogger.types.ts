import type { WorkoutSetEntry } from "@/lib/storage/workoutRepo";

export type WorkoutLoggerExerciseVM = {
  id: string;
  name: string;
  targetLabel: string | null;
  targetText: string | null;
  setRows: Array<{
    id: string;
    setNumber: number;
    repsValue: string;
    repsPlaceholder: string;
    weightValue: string;
    weightPlaceholder: string;
    completed: boolean;
  }>;
  canAddExtraSet: boolean;
};

export type WorkoutLoggerViewProps =
  | {
      kind: "loading";
    }
  | {
      kind: "noProgram";
      onBrowseTemplates: () => void;
    }
  | {
      kind: "noDraft";
      programName: string;
      dayLabel: string | null;
      isRestDay: boolean;
      onStart: () => void;
      startDisabled?: boolean;
      onBackToOverview: () => void;
      onUseAutoDay: () => void;
    }
  | {
      kind: "logging";
      programName: string;
      setsDone: number;
      setsTotal: number;
      exercises: WorkoutLoggerExerciseVM[];
      onAddSet: (exerciseId: string) => void;
      onUpdateSet: (
        setId: string,
        patch: Partial<
          Pick<WorkoutSetEntry, "actualReps" | "actualWeight" | "completed">
        >,
      ) => void;
      onFinish: () => void;
      finishDisabled: boolean;
      onSaveExit: () => void;
    };
