"use client";

import { useMemo } from "react";

import type { ProgramTemplate } from "@/lib/program-templates/types";
import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useRouteContext } from "@/hooks/useRouteContext";
import { trainPath } from "@/lib/routes";
import { recommendTemplates } from "@/features/train/domain/recommendTemplates";
import { api } from "@/trpc/react";
import type { TemplateCardVM } from "../TemplateCard/TemplateCard.types";
import type { TemplateListViewProps } from "./TemplateList.types";
import { TemplateListView } from "./TemplateList.view";

export function TemplateList() {
  const { profile, hydrated } = useTrainingProfile();
  const routeContext = useRouteContext();
  const { data: templates = [], isLoading: templatesLoading } =
    api.template.list.useQuery();

  const toVm = (input: { id: string; name: string; description: string; daysPerWeek: number }): TemplateCardVM => ({
    id: input.id,
    name: input.name,
    description: input.description,
    daysPerWeek: input.daysPerWeek,
    viewHref: trainPath(routeContext, `template/${input.id}`),
    useHref: trainPath(routeContext, `template/${input.id}`),
  });

  const all = useMemo<ProgramTemplate[]>(
    () =>
      templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        tags: t.tags as ProgramTemplate["tags"],
        daysPerWeek: t.daysPerWeek,
        plan: { days: [] },
      })),
    [templates],
  );
  const recommended = useMemo(() => {
    if (!profile) return [];
    return recommendTemplates(profile, all);
  }, [profile, all]);

  const viewProps: TemplateListViewProps = useMemo(() => {
    if (!hydrated || templatesLoading) return { kind: "loading" };

    if (!profile) {
      return {
        kind: "noProfile",
        onboardingHref: trainPath(routeContext, "onboarding"),
        backHref: trainPath(routeContext),
      };
    }

    const recommendedSource = (recommended.length ? recommended : all).slice(0, 4);

    return {
      kind: "ready",
      editPrefsHref: trainPath(routeContext, "onboarding"),
      editPrefsLabel: "Edit preferences",
      backHref: trainPath(routeContext),
      recommendedTitle: "Recommended for you",
      recommendedCards: recommendedSource.map((t) =>
        toVm({ id: t.id, name: t.name, description: t.description, daysPerWeek: t.daysPerWeek }),
      ),
      allCards: all.map((t) =>
        toVm({ id: t.id, name: t.name, description: t.description, daysPerWeek: t.daysPerWeek }),
      ),
    };
  }, [hydrated, templatesLoading, profile, recommended, all, routeContext, toVm]);

  return <TemplateListView {...viewProps} />;
}
