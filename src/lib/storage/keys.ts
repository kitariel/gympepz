export const STORAGE_KEYS = {
  profile: "gympepz.profile",
  selectedTemplateId: "gympepz.selectedTemplateId",
  activeProgram: "gympepz.activeProgram",
  // Program-first model (single source of truth)
  currentProgramRef: "gympepz.currentProgramRef",
  currentProgramSnapshot: "gympepz.currentProgramSnapshot",
  activeWorkoutDraft: "gympepz.activeWorkoutDraft",
  history: "gympepz.history",
  customPrograms: "gympepz.customPrograms",
  programsDirty: "gympepz.programsDirty",
  trainBuilderDraft: "gympepz.train.builderDraft",
  trainSelectedWorkoutDay: "gympepz.train.selectedWorkoutDay",
  // Program day selection (preferred keys)
  programDayMode: "gympepz.programDayMode",
  programDayManualIndex: "gympepz.programDayManualIndex",
} as const;
