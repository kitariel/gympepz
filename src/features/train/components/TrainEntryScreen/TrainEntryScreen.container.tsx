"use client";

import { useMemo } from "react";

import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import type { TrainEntryScreenViewProps, TrainEntryStartCard } from "./TrainEntryScreen.types";
import { TrainEntryScreenView } from "./TrainEntryScreen.view";

export function TrainEntryScreen() {
  const { profile, hydrated: profileHydrated } = useTrainingProfile();
  const { activeProgram, hydrated: programHydrated } = useActiveProgram();
  const { draft, hydrated: workoutHydrated, summary } = useWorkoutDraft();

  const hydrated = profileHydrated && programHydrated && workoutHydrated;

  const hasProfile = Boolean(profile);
  const hasProgram = Boolean(activeProgram);
  const hasDraft = Boolean(draft);

  const statusText = useMemo(() => {
    if (!hydrated) return "Loading…";
    if (hasDraft) return "Workout in progress";
    if (hasProgram) return "Program ready";
    if (hasProfile) return "Profile saved";
    return "New session";
  }, [hydrated, hasDraft, hasProgram, hasProfile]);

  const startCard: TrainEntryStartCard = useMemo(() => {
    if (!hydrated) return { kind: "loading" };
    if (hasDraft) {
      return {
        kind: "draft",
        cta: { label: "Resume workout", href: "/train/log", variant: "default" },
      };
    }
    if (hasProgram && activeProgram) {
      return {
        kind: "program",
        primary: { label: "Start today’s workout", href: "/train/log", variant: "default" },
        secondary: { label: "View program overview", href: "/train/overview", variant: "outline" },
        programName: activeProgram.name,
      };
    }
    if (hasProfile) {
      return {
        kind: "profile",
        cta: { label: "See recommended templates", href: "/train/templates", variant: "default" },
      };
    }
    return {
      kind: "new",
      primary: { label: "Quick onboarding", href: "/train/onboarding", variant: "default" },
      secondary: { label: "Browse templates", href: "/train/templates", variant: "outline" },
    };
  }, [hydrated, hasDraft, hasProgram, activeProgram, hasProfile]);

  const viewProps: TrainEntryScreenViewProps = {
    statusText,
    sessionsText: `${summary.total} sessions`,
    startCard,
    historyHref: "/train/history",
    templatesHref: "/train/templates",
    buildHref: "/train/build",
    plansHref: "/train/plans",
  };

  return <TrainEntryScreenView {...viewProps} />;
}

