import { getJSON, remove, setJSON } from "./kv";
import { STORAGE_KEYS } from "./keys";
import type { ProgramTemplate, ProgramTemplateDay } from "@/lib/program-templates/types";
import { programRepo, type ActiveProgram } from "@/lib/storage/programRepo";

export type CurrentProgramRef = { type: "template" | "custom"; id: string };

export type CurrentProgramSnapshot = {
  ref: CurrentProgramRef;
  programName: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  plan: ProgramTemplate["plan"];
};

function nowIso(): string {
  return new Date().toISOString();
}

function inferRefType(id: string): CurrentProgramRef["type"] {
  // Best-effort: our custom builder ids start with "custom_"
  if (id.startsWith("custom_") || id.startsWith("custom")) return "custom";
  return "template";
}

function normalizeTo7Days(days: ProgramTemplateDay[]): ProgramTemplateDay[] {
  const byDay = new Map<number, ProgramTemplateDay>();
  for (const d of days) byDay.set(d.day, d);
  const result: ProgramTemplateDay[] = [];
  for (let i = 1; i <= 7; i += 1) {
    const found = byDay.get(i);
    if (found) {
      result.push(found);
    } else {
      result.push({
        day: i as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        label: `Day ${i}`,
        isRestDay: true,
        items: [],
      });
    }
  }
  return result;
}

function migrateFromLegacy(): CurrentProgramSnapshot | null {
  const legacy = programRepo.getActiveProgram();
  if (!legacy) return null;
  const ref: CurrentProgramRef = {
    type: inferRefType(legacy.templateId),
    id: legacy.templateId,
  };
  const snap: CurrentProgramSnapshot = {
    ref,
    programName: legacy.name,
    createdAt: legacy.createdAt ?? nowIso(),
    updatedAt: legacy.updatedAt ?? nowIso(),
    plan: { days: normalizeTo7Days(legacy.plan.days) },
  };
  // Persist new keys so next load is fast.
  setJSON(STORAGE_KEYS.currentProgramRef, ref);
  setJSON(STORAGE_KEYS.currentProgramSnapshot, snap);
  return snap;
}

export const currentProgramRepo = {
  getRef(): CurrentProgramRef | null {
    return getJSON<CurrentProgramRef>(STORAGE_KEYS.currentProgramRef);
  },
  getSnapshot(): CurrentProgramSnapshot | null {
    const snap = getJSON<CurrentProgramSnapshot>(STORAGE_KEYS.currentProgramSnapshot);
    if (snap) return snap;
    return migrateFromLegacy();
  },
  setCurrentProgram(ref: CurrentProgramRef, snapshot: Omit<CurrentProgramSnapshot, "ref">): void {
    setJSON(STORAGE_KEYS.currentProgramRef, ref);
    setJSON(STORAGE_KEYS.currentProgramSnapshot, { ...snapshot, ref });
    // Keep legacy key in sync for now (back-compat)
    const legacy: ActiveProgram = {
      templateId: ref.id,
      name: snapshot.programName,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      plan: snapshot.plan,
    };
    programRepo.saveActiveProgram(legacy);
  },
  clear(): void {
    remove(STORAGE_KEYS.currentProgramRef);
    remove(STORAGE_KEYS.currentProgramSnapshot);
    // Keep legacy clear
    programRepo.clearActiveProgram();
  },
  normalizeTo7Days,
};
