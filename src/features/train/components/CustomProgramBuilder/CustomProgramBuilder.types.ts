import type {
  ProgramTemplateItem,
  TemplateDayNumber,
} from "@/lib/program-templates/types";
import type { BuilderDay } from "@/features/train/domain/customProgramBuilder";

export type PickerTab = "library" | "manual";

export type ExerciseResultVM = {
  id: string;
  name: string;
  muscleGroup: string | null;
};

export type ExercisesVM =
  | { status: "loading"; items: ExerciseResultVM[] }
  | { status: "error"; items: ExerciseResultVM[] }
  | { status: "ready"; items: ExerciseResultVM[] };

export type CustomProgramBuilderViewProps = {
  isOnline: boolean;
  totalExercises: number;

  editingId: string | null;
  programName: string;
  onProgramNameChange: (next: string) => void;

  restoredNotice: boolean;
  onClearDraft: () => void;

  days: BuilderDay[];
  onDayLabelChange: (day: TemplateDayNumber, next: string) => void;
  onDayRestChange: (day: TemplateDayNumber, checked: boolean) => void;

  onMoveItem: (day: TemplateDayNumber, fromIndex: number, toIndex: number) => void;
  onRemoveItem: (day: TemplateDayNumber, order: number) => void;
  onUpdateItem: (
    day: TemplateDayNumber,
    order: number,
    patch: Partial<Pick<ProgramTemplateItem, "sets" | "reps" | "weight" | "nameFallback">>,
  ) => void;

  onOpenPicker: (day: TemplateDayNumber) => void;

  canSave: boolean;
  onSave: () => void;
  onCancel: () => void;

  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  pickerDay: TemplateDayNumber | null;

  pickerTab: PickerTab;
  onPickerTabChange: (next: PickerTab) => void;

  query: string;
  onQueryChange: (next: string) => void;
  muscleGroup: string;
  onMuscleGroupChange: (next: string) => void;
  equipment: string;
  onEquipmentChange: (next: string) => void;
  difficulty: string;
  onDifficultyChange: (next: string) => void;

  manualName: string;
  onManualNameChange: (next: string) => void;

  exercises: ExercisesVM;
  onSelectExercise: (exercise: { id: string; name: string }) => void;
  onAddManual: () => void;
};

