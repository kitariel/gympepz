import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";
import type { ProgramTemplate } from "@/lib/program-templates/types";

export type ActiveProgram = {
  templateId: string;
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  /**
   * Snapshot of the plan at selection time (so later template changes don't break a user's plan).
   */
  plan: ProgramTemplate["plan"];
};

export const programRepo = {
  getSelectedTemplateId(): string | null {
    return getJSON<string>(STORAGE_KEYS.selectedTemplateId);
  },
  setSelectedTemplateId(id: string): void {
    setJSON(STORAGE_KEYS.selectedTemplateId, id);
  },
  clearSelectedTemplateId(): void {
    remove(STORAGE_KEYS.selectedTemplateId);
  },
  getActiveProgram(): ActiveProgram | null {
    return getJSON<ActiveProgram>(STORAGE_KEYS.activeProgram);
  },
  saveActiveProgram(program: ActiveProgram): void {
    setJSON(STORAGE_KEYS.activeProgram, program);
  },
  clearActiveProgram(): void {
    remove(STORAGE_KEYS.activeProgram);
  },
};

