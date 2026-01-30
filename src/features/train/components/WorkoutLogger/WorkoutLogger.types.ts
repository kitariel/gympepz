import type { WorkoutSetEntry, RestTimerState } from "@/lib/storage/workoutRepo";

export type PreviousSetData = {
  weight: string | null;
  reps: string;
  relativeDate: string; // "3d ago", "1w ago"
  programName: string;
  isSameProgram: boolean;
};

export type WorkoutLoggerExerciseVM = {
  id: string;
  name: string;
  targetLabel: string | null;
  targetText: string | null;
  goalHint?: string | null;
  goalUpdate?: {
    label: string;
    extraCount: number;
  } | null;
  previousPerformance: PreviousSetData | null;
  setRows: Array<{
    id: string;
    setNumber: number;
    repsValue: string;
    repsPlaceholder: string;
    weightValue: string;
    weightPlaceholder: string;
    completed: boolean;
    canCopyLastSet: boolean;
  }>;
  canAddExtraSet: boolean;
};

export type WorkoutLoggerViewProps =
  | {
      kind: "loading";
    }
  | {
      kind: "error";
      title: string;
      message: string;
      onRetry: () => void;
      onGoBack: () => void;
    }
  | {
      kind: "noProgram";
      onBrowseTemplates: () => void;
      onCreatePlan?: () => void;
    }
  | {
      kind: "draftConflict";
      activeDraftProgram: string;
      activeDraftDay: string | null;
      requestedProgram: string;
      requestedDay: string | null;
      onResume: () => void;
      onDiscard: () => void;
      onCancel: () => void;
    }
  | {
      kind: "completedToday";
      programName: string;
      dayLabel: string | null;
      onTakeRestDay: () => void;
      onRepeat: () => void;
      onBackToOverview: () => void;
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
      dayLabel?: string | null;
      elapsedTime: string; // "12:34" format
      isOnline: boolean;
      setsDone: number;
      setsTotal: number;
      exercises: WorkoutLoggerExerciseVM[];
      restTimer: RestTimerState;
      showTrackGoalsToggle: boolean;
      trackGoalsEnabled: boolean;
      onToggleTrackGoals: () => void;
      onAddSet: (exerciseId: string) => void;
      onUpdateSet: (
        setId: string,
        patch: Partial<
          Pick<WorkoutSetEntry, "actualReps" | "actualWeight" | "completed">
        >,
      ) => void;
      onCopyPrevious: (exerciseId: string, setId: string) => void;
      onCopyLastSet: (exerciseId: string, setId: string) => void;
      onStartRestTimer: (durationMs: number) => void;
      onAddRestTime: (extraMs: number) => void;
      onStopRestTimer: () => void;
      onNavigateExercise?: () => void;
      onFinish: () => void;
      onDiscardWorkout: () => void;
      finishDisabled: boolean;
      onSaveExit: () => void;
    };
