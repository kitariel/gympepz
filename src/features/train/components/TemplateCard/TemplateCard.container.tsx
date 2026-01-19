"use client";

import type { ProgramTemplate } from "@/lib/program-templates/types";
import type { TemplateCardVM } from "./TemplateCard.types";
import { TemplateCardView } from "./TemplateCard.view";

function toVm(template: ProgramTemplate): TemplateCardVM {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    daysPerWeek: template.daysPerWeek,
    viewHref: `/train/template/${template.id}`,
    useHref: `/train/template/${template.id}`,
  };
}

export function TemplateCard({ template }: { template: ProgramTemplate }) {
  return <TemplateCardView vm={toVm(template)} />;
}

