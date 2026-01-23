"use client";

import { useMemo } from "react";

import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useRouteContext } from "@/hooks/useRouteContext";
import { trainPath } from "@/lib/routes";
import {
  getDayNumberForToday,
  getEffectivePlanDay,
} from "@/features/train/domain/workoutSessionState";
import type {
  TrainEntryScreenViewProps,
  TrainEntryStartCard,
  RecentWorkoutItem,
} from "./TrainEntryScreen.types";
import { TrainEntryScreenView } from "./TrainEntryScreen.view";

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrainEntryScreen() {
  const { profile, hydrated: profileHydrated } = useTrainingProfile();
  const { activeProgram, hydrated: programHydrated } = useActiveProgram();
  const { draft, hydrated: workoutHydrated, summary, history } = useWorkoutDraft();
  const { selectedWorkoutDay, hydrated: prefsHydrated } = useTrainPrefs();
  const routeContext = useRouteContext();

  const hydrated = profileHydrated && programHydrated && workoutHydrated && prefsHydrated;

  const hasProfile = Boolean(profile);
  const hasProgram = Boolean(activeProgram);
  const hasDraft = Boolean(draft);

  const today = useMemo(() => getDayNumberForToday(), []);
  const todaysPlan = useMemo(() => {
    if (!activeProgram) return null;
    return getEffectivePlanDay({
      days: activeProgram.plan.days,
      selectedWorkoutDay,
      today,
    });
  }, [activeProgram, today, selectedWorkoutDay]);

  const statusText = useMemo(() => {
    if (!hydrated) return "Loading…";
    if (hasDraft) return "Workout in progress";
    if (hasProgram) return "Program ready";
    if (hasProfile) return "Profile saved";
    return "New session";
  }, [hydrated, hasDraft, hasProgram, hasProfile]);

  const startCard: TrainEntryStartCard = useMemo(() => {
    if (!hydrated) return { kind: "loading" };
    if (hasDraft && draft) {
      return {
        kind: "draft",
        cta: { label: "Resume workout", href: trainPath(routeContext, "log"), variant: "default" },
        programName: draft.programName,
        dayLabel: draft.programDayLabel ?? null,
      };
    }
    if (hasProgram && activeProgram) {
      const dayLabel = todaysPlan?.label ?? null;
      const exerciseCount = todaysPlan?.items.length ?? 0;
      const setsProgress = exerciseCount > 0 ? `${exerciseCount} exercises` : null;

      return {
        kind: "program",
        primary: { label: "Start today's workout", href: trainPath(routeContext, "log"), variant: "default" },
        secondary: { label: "View overview", href: trainPath(routeContext, "overview"), variant: "outline" },
        programName: activeProgram.name,
        dayLabel,
        setsProgress,
      };
    }
    if (hasProfile) {
      return {
        kind: "profile",
        cta: { label: "See recommended templates", href: trainPath(routeContext, "templates"), variant: "default" },
      };
    }
    return {
      kind: "new",
      primary: { label: "Quick onboarding", href: trainPath(routeContext, "onboarding"), variant: "default" },
      secondary: { label: "Browse templates", href: trainPath(routeContext, "templates"), variant: "outline" },
    };
  }, [hydrated, hasDraft, draft, hasProgram, activeProgram, hasProfile, todaysPlan, routeContext]);

  const recentWorkouts: RecentWorkoutItem[] = useMemo(() => {
    if (!hydrated) return [];
    return history
      .slice(0, 3)
      .map((h) => ({
        id: h.id,
        dateText: formatRelativeDate(h.date),
        dayLabel: h.programDayLabel ?? null,
        setsCount: h.sets.length,
      }));
  }, [hydrated, history]);

  const viewProps: TrainEntryScreenViewProps = {
    statusText,
    sessionsText: `${summary.total} sessions`,
    startCard,
    recentWorkouts,
    historyHref: trainPath(routeContext, "history"),
    templatesHref: trainPath(routeContext, "templates"),
    buildHref: trainPath(routeContext, "build"),
    plansHref: trainPath(routeContext, "plans"),
  };

  return <TrainEntryScreenView {...viewProps} />;
}
