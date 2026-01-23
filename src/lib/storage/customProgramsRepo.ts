import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";
import type { ProgramTemplate } from "@/lib/program-templates/types";

export type CustomProgramRecord = {
  id: string;
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  plan: ProgramTemplate["plan"];
};

function normalize(list: unknown): CustomProgramRecord[] {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean) as CustomProgramRecord[];
}

export const customProgramsRepo = {
  list(): CustomProgramRecord[] {
    return normalize(getJSON<CustomProgramRecord[]>(STORAGE_KEYS.customPrograms));
  },
  get(id: string): CustomProgramRecord | null {
    return customProgramsRepo.list().find((p) => p.id === id) ?? null;
  },
  upsert(record: CustomProgramRecord, options?: { markDirty?: boolean }): void {
    const current = customProgramsRepo.list();
    const idx = current.findIndex((p) => p.id === record.id);
    if (idx === -1) current.unshift(record);
    else current[idx] = record;
    setJSON(STORAGE_KEYS.customPrograms, current);
    if (options?.markDirty !== false) {
      setJSON(STORAGE_KEYS.programsDirty, true);
    }
  },
  remove(id: string, options?: { markDirty?: boolean }): void {
    const next = customProgramsRepo.list().filter((p) => p.id !== id);
    setJSON(STORAGE_KEYS.customPrograms, next);
    if (options?.markDirty !== false) {
      setJSON(STORAGE_KEYS.programsDirty, true);
    }
  },
  clear(options?: { markDirty?: boolean }): void {
    remove(STORAGE_KEYS.customPrograms);
    if (options?.markDirty !== false) {
      setJSON(STORAGE_KEYS.programsDirty, true);
    }
  },
};
