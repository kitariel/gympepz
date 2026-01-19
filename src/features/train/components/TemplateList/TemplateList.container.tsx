"use client";

import { useMemo } from "react";

import { getTemplates } from "@/lib/program-templates/templates";
import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { recommendTemplates } from "@/features/train/domain/recommendTemplates";
import type { TemplateCardVM } from "../TemplateCard/TemplateCard.types";
import type { TemplateListViewProps } from "./TemplateList.types";
import { TemplateListView } from "./TemplateList.view";

function toVm(input: { id: string; name: string; description: string; daysPerWeek: number }): TemplateCardVM {
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    daysPerWeek: input.daysPerWeek,
    viewHref: `/train/template/${input.id}`,
    useHref: `/train/template/${input.id}`,
  };
}

export function TemplateList() {
  const { profile, hydrated } = useTrainingProfile();

  const all = useMemo(() => getTemplates(), []);
  const recommended = useMemo(() => {
    if (!profile) return [];
    return recommendTemplates(profile, all);
  }, [profile, all]);

  const viewProps: TemplateListViewProps = useMemo(() => {
    if (!hydrated) return { kind: "loading" };

    if (!profile) {
      return {
        kind: "noProfile",
        onboardingHref: "/train/onboarding",
        backHref: "/train",
      };
    }

    const recommendedSource = (recommended.length ? recommended : all).slice(0, 4);

    return {
      kind: "ready",
      editPrefsHref: "/train/onboarding",
      editPrefsLabel: "Edit preferences",
      backHref: "/train",
      recommendedTitle: "Recommended for you",
      recommendedCards: recommendedSource.map((t) =>
        toVm({ id: t.id, name: t.name, description: t.description, daysPerWeek: t.daysPerWeek }),
      ),
      allCards: all.map((t) =>
        toVm({ id: t.id, name: t.name, description: t.description, daysPerWeek: t.daysPerWeek }),
      ),
    };
  }, [hydrated, profile, recommended, all]);

  return <TemplateListView {...viewProps} />;
}

