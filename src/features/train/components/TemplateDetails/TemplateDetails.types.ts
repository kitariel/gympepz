import type { TemplateDayNumber } from "@/lib/program-templates/types";

export type TemplateDetailsDayItemVM = {
  name: string;
  setsText: string;
};

export type TemplateDetailsDayVM = {
  dayIndex: number;
  label: string;
  items: TemplateDetailsDayItemVM[];
};

export type TemplateDetailsSchedulePrompt = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "default" | "custom";
  onModeChange: (mode: "default" | "custom") => void;
  daysPerWeek: number;
  todayLabel: string;
  allDays: Array<{ value: TemplateDayNumber; label: string }>;
  defaultDays: Array<{ value: TemplateDayNumber; label: string }>;
  selectedDays: TemplateDayNumber[];
  onToggleDay: (value: TemplateDayNumber) => void;
  onConfirmDefault: () => void;
  onConfirmCustom: () => void;
  customValid: boolean;
};

export type TemplateDetailsViewProps =
  | {
      kind: "notFound";
      backHref: string;
    }
  | {
      kind: "ready";
      name: string;
      description: string;
      daysPerWeek: number;
      days: TemplateDetailsDayVM[];
      template: import("@/lib/program-templates/types").ProgramTemplate;
      onUse: () => void;
      schedulePrompt?: TemplateDetailsSchedulePrompt;
      backHref: string;
    };
