"use client";

import { useRouteContext } from "@/hooks/useRouteContext";
import { trainPath } from "@/lib/routes";
import type { ProgramTemplate } from "@/lib/program-templates/types";
import type { TemplateCardVM } from "./TemplateCard.types";
import { TemplateCardView } from "./TemplateCard.view";

export function TemplateCard({ template }: { template: ProgramTemplate }) {
  const routeContext = useRouteContext();

  const vm: TemplateCardVM = {
    id: template.id,
    name: template.name,
    description: template.description,
    daysPerWeek: template.daysPerWeek,
    viewHref: trainPath(routeContext, `template/${template.id}`),
    useHref: trainPath(routeContext, `template/${template.id}`),
  };

  return <TemplateCardView vm={vm} />;
}

