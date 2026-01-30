"use client";

import { useEffect, useMemo, useState } from "react";

import type { ProgramTemplate } from "@/lib/program-templates/types";
import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useRouteContext } from "@/hooks/useRouteContext";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useTemplateCache } from "@/hooks/useTemplateCache";
import { trainPath } from "@/lib/routes";
import { recommendTemplates } from "@/features/train/domain/recommendTemplates";
import { api } from "@/trpc/react";
import type { TemplateCardVM } from "../TemplateCard/TemplateCard.types";
import type { TemplateListViewProps } from "./TemplateList.types";
import { TemplateListView } from "./TemplateList.view";

export function TemplateList() {
  const { profile, hydrated } = useTrainingProfile();
  const routeContext = useRouteContext();
  const { isOnline } = useOnlineStatus();
  const { getTemplates, hasTemplatesCache } = useTemplateCache();
  const [cachedTemplates, setCachedTemplates] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      tags: string[];
      daysPerWeek: number;
    }>
  >([]);

  const { data: templates = [], isLoading: templatesLoading } =
    api.template.list.useQuery(undefined, { enabled: isOnline });

  useEffect(() => {
    if (isOnline) return;
    let active = true;
    const load = async () => {
      try {
        const cached = await getTemplates();
        if (!active) return;
        setCachedTemplates(
          cached.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            tags: t.tags,
            daysPerWeek: t.daysPerWeek,
          }))
        );
      } catch (error) {
        console.error("[TemplateList] Failed to load cached templates:", error);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isOnline, getTemplates]);

  const toVm = (input: { id: string; name: string; description: string; daysPerWeek: number }): TemplateCardVM => ({
    id: input.id,
    name: input.name,
    description: input.description,
    daysPerWeek: input.daysPerWeek,
    viewHref: trainPath(routeContext, `template/${input.id}`),
    useHref: trainPath(routeContext, `template/${input.id}`),
  });

  const sourceTemplates = isOnline ? templates : cachedTemplates;

  const all = useMemo<ProgramTemplate[]>(
    () =>
      sourceTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        tags: t.tags as ProgramTemplate["tags"],
        daysPerWeek: t.daysPerWeek,
        plan: { days: [] },
      })),
    [sourceTemplates],
  );
  const recommended = useMemo(() => {
    if (!profile) return [];
    return recommendTemplates(profile, all);
  }, [profile, all]);

  const viewProps: TemplateListViewProps = useMemo(() => {
    if (!hydrated || (isOnline && templatesLoading)) return { kind: "loading" };

    if (!profile) {
      return {
        kind: "noProfile",
        onboardingHref: trainPath(routeContext, "onboarding"),
        backHref: trainPath(routeContext),
      };
    }

    if (!isOnline && !hasTemplatesCache && cachedTemplates.length === 0) {
      return {
        kind: "offlineEmpty",
        backHref: trainPath(routeContext),
        title: "Connect once to download templates",
        message: "You’re offline and no templates are saved yet. Go online once to cache templates for offline use.",
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
      offlineNotice: !isOnline ? "Offline • Using saved templates" : undefined,
    };
  }, [
    hydrated,
    templatesLoading,
    profile,
    recommended,
    all,
    routeContext,
    toVm,
    isOnline,
    hasTemplatesCache,
    cachedTemplates.length,
  ]);

  return <TemplateListView {...viewProps} />;
}
