export type TemplateDetailsDayItemVM = {
  name: string;
  setsText: string;
};

export type TemplateDetailsDayVM = {
  dayIndex: number;
  label: string;
  items: TemplateDetailsDayItemVM[];
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
      backHref: string;
    };

