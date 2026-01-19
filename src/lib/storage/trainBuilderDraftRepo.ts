import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";
import type { ProgramTemplateItem, TemplateDayNumber } from "@/lib/program-templates/types";

export type TrainBuilderDraftDay = {
  day: TemplateDayNumber;
  label: string;
  isRestDay: boolean;
  items: ProgramTemplateItem[];
};

export type TrainBuilderDraft = {
  /**
   * null means "new plan".
   * string means "editing existing custom plan id".
   */
  editingId: string | null;
  programName: string;
  days: TrainBuilderDraftDay[];
  updatedAt: string; // ISO
};

export const trainBuilderDraftRepo = {
  get(): TrainBuilderDraft | null {
    return getJSON<TrainBuilderDraft>(STORAGE_KEYS.trainBuilderDraft);
  },
  save(draft: TrainBuilderDraft): void {
    setJSON(STORAGE_KEYS.trainBuilderDraft, draft);
  },
  clear(): void {
    remove(STORAGE_KEYS.trainBuilderDraft);
  },
};

