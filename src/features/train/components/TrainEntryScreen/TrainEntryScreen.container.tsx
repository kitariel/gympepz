"use client";

import { useMemo, useState } from "react";

import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useRouteContext } from "@/hooks/useRouteContext";
import { trainPath } from "@/lib/routes";
import { getDayNumberForToday } from "@/features/train/domain/workoutSessionState";
import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";
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

  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);

  const hydrated = profileHydrated && programHydrated && workoutHydrated && prefsHydrated;

  const hasProfile = Boolean(profile);
  const hasProgram = Boolean(activeProgram);
  const hasDraft = Boolean(draft);

  const today = useMemo(() => getDayNumberForToday(), []);
  const autoPick = useMemo(() => {
    if (!activeProgram || selectedWorkoutDay !== "auto") return null;
    return pickWorkoutDayForWeekday(activeProgram.plan.days, today);
  }, [activeProgram, selectedWorkoutDay, today]);

  const todaysPlan = useMemo(() => {
    if (!activeProgram) return null;
    if (selectedWorkoutDay === "auto") return autoPick?.day ?? null;
    return activeProgram.plan.days.find((d) => d.day === selectedWorkoutDay) ?? null;
  }, [activeProgram, selectedWorkoutDay, autoPick]);

  const isScheduleMatch = selectedWorkoutDay === "auto" ? Boolean(autoPick?.isExactMatch) : true;

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

      const primary = isScheduleMatch
        ? { label: "Start today's workout", href: trainPath(routeContext, "log"), variant: "default" }
        : { label: "View next workout", href: trainPath(routeContext, "overview"), variant: "default" };
      const secondary = isScheduleMatch
        ? { label: "View overview", href: trainPath(routeContext, "overview"), variant: "outline" }
        : { label: "Change program", href: trainPath(routeContext, "templates"), variant: "outline" };
      const nextLabel = !isScheduleMatch && dayLabel ? `Next workout: ${dayLabel}` : dayLabel;

      return {
        kind: "program",
        primary,
        secondary,
        programName: activeProgram.name,
        dayLabel: nextLabel,
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
  }, [
    hydrated,
    hasDraft,
    draft,
    hasProgram,
    activeProgram,
    hasProfile,
    todaysPlan,
    routeContext,
    isScheduleMatch,
  ]);

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
    // Schedule drawer
    showScheduleLink: hasProgram,
    scheduleDrawerOpen,
    onScheduleDrawerOpenChange: setScheduleDrawerOpen,
  };

  return <TrainEntryScreenView {...viewProps} />;
}
