import type {
  ProgramTemplateDay,
  ProgramTemplateItem,
  TemplateDayNumber,
} from "@/lib/program-templates/types";

export type BuilderDay = {
  day: TemplateDayNumber;
  label: string;
  isRestDay: boolean;
  items: ProgramTemplateItem[];
};

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function defaultDays(): BuilderDay[] {
  const days: BuilderDay[] = [];
  for (let i = 1; i <= 7; i += 1) {
    const d = i as TemplateDayNumber;
    days.push({
      day: d,
      label: `Day ${d}`,
      isRestDay: false,
      items: [],
    });
  }
  return days;
}

function normalizeItems(items: ProgramTemplateItem[]): ProgramTemplateItem[] {
  return items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((it, idx) => ({ ...it, order: idx }));
}

export function mergeDays(inputDays: ProgramTemplateDay[]): BuilderDay[] {
  const seeded = defaultDays();
  return seeded.map((seed) => {
    const found = inputDays.find((d) => d.day === seed.day);
    if (!found) return seed;
    return {
      day: found.day,
      label: found.label,
      isRestDay: Boolean(found.isRestDay),
      items: normalizeItems(found.items ?? []),
    };
  });
}

export function toPlanDays(days: BuilderDay[]): ProgramTemplateDay[] {
  return days.map((d) => ({
    day: d.day,
    label: d.label.trim() || `Day ${d.day}`,
    isRestDay: d.isRestDay,
    items: d.isRestDay ? [] : normalizeItems(d.items),
  }));
}
