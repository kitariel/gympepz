"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { getTemplateById } from "@/lib/program-templates/templates";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import type { TemplateDetailsDayVM, TemplateDetailsViewProps } from "./TemplateDetails.types";
import { TemplateDetailsView } from "./TemplateDetails.view";

function nowIso(): string {
  return new Date().toISOString();
}

export function TemplateDetails({ templateId }: { templateId: string }) {
  const router = useRouter();
  const { selectTemplate, saveActiveProgram } = useActiveProgram();
  const { clearDraft } = useWorkoutDraft();

  const template = useMemo(() => getTemplateById(templateId), [templateId]);

  const viewProps: TemplateDetailsViewProps = useMemo(() => {
    if (!template) {
      return { kind: "notFound", backHref: "/train/templates" };
    }

    const days: TemplateDetailsDayVM[] = template.plan.days
      .slice()
      .sort((a, b) => a.day - b.day)
      .map((day) => ({
        dayIndex: day.day,
        label: day.label,
        items: day.items
          .slice()
          .sort((x, y) => x.order - y.order)
          .map((it) => ({
            name: it.nameFallback ?? "Exercise",
            setsText: `${it.sets}×${it.reps}${it.weight ? ` • ${it.weight}` : ""}`,
          })),
      }));

    return {
      kind: "ready",
      name: template.name,
      description: template.description,
      daysPerWeek: template.daysPerWeek,
      days,
      onUse: () => {
        clearDraft();
        selectTemplate(template.id);
        saveActiveProgram({
          templateId: template.id,
          name: template.name,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          plan: template.plan,
        });
        router.push("/train/overview");
      },
      backHref: "/train/templates",
    };
  }, [template, clearDraft, selectTemplate, saveActiveProgram, router]);

  return <TemplateDetailsView {...viewProps} />;
}

