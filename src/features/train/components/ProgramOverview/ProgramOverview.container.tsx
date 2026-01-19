"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";
import { isDoneToday } from "@/features/train/domain/isDoneToday";
import type {
  ProgramOverviewPickedVM,
  ProgramOverviewViewProps,
  ProgramOverviewWeekDayVM,
} from "./ProgramOverview.types";
import { ProgramOverviewView } from "./ProgramOverview.view";

function getDayNumberForToday(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d as 1 | 2 | 3 | 4 | 5 | 6;
}

export function ProgramOverview() {
  const router = useRouter();
  const { activeProgram, hydrated, clearActiveProgram } = useActiveProgram();
  const { hydrated: prefsHydrated, selectedWorkoutDay, setSelectedWorkoutDay } = useTrainPrefs();
  const { hydrated: historyHydrated, history, draft } = useWorkoutDraft();

  const today = useMemo(() => getDayNumberForToday(), []);

  const pickedRaw = useMemo(() => {
    if (!activeProgram) return null;
    if (selectedWorkoutDay === "auto") {
      return pickWorkoutDayForWeekday(activeProgram.plan.days, today);
    }
    const manual = activeProgram.plan.days.find((d) => d.day === selectedWorkoutDay) ?? null;
    if (manual) return { day: manual, isExactMatch: false };
    return pickWorkoutDayForWeekday(activeProgram.plan.days, today);
  }, [activeProgram, selectedWorkoutDay, today]);

  const startHref = useMemo(() => {
    const base = pickedRaw?.day != null ? `/train/log?day=${pickedRaw.day.day}` : "/train/log";
    return base.includes("?") ? `${base}&autostart=1` : `${base}?autostart=1`;
  }, [pickedRaw]);

  const completedToday = useMemo(() => {
    if (!activeProgram) return false;
    return isDoneToday({ history, programId: activeProgram.templateId });
  }, [history, activeProgram]);

  const viewProps: ProgramOverviewViewProps = useMemo(() => {
    if (!hydrated || !prefsHydrated || !historyHydrated) return { kind: "loading" };

    if (!activeProgram) {
      return {
        kind: "noProgram",
        onBrowseTemplates: () => router.push("/train/templates"),
      };
    }

    const picked: ProgramOverviewPickedVM | null = pickedRaw?.day
      ? {
          title: pickedRaw.isExactMatch ? "Today" : "Next workout",
          dayIndex: pickedRaw.day.day,
          label: pickedRaw.day.label,
          items: pickedRaw.day.items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((it) => ({
              name: it.nameFallback ?? "Exercise",
              setsText: `${it.sets}×${it.reps}`,
            })),
        }
      : null;

    const week: ProgramOverviewWeekDayVM[] = activeProgram.plan.days
      .slice()
      .sort((a, b) => a.day - b.day)
      .map((d) => ({
        dayIndex: d.day,
        label: d.label,
        exercisesCount: d.items.length,
      }));

    const hasDraft = Boolean(draft);
    const repeatPromptEnabled = !hasDraft && completedToday;

    const onPrimaryCta = () => {
      if (hasDraft) {
        router.push("/train/log");
        return;
      }
      router.push(startHref);
    };

    return {
      kind: "ready",
      programName: activeProgram.name,
      selectedDay: selectedWorkoutDay,
      onSelectedDayChange: (v) => setSelectedWorkoutDay(v),
      onClearProgram: () => clearActiveProgram(),
      picked,
      week,
      primaryCtaText: hasDraft ? "Resume" : "Start workout",
      onPrimaryCta,
      repeatPromptEnabled,
      onConfirmRepeat: () => router.push(startHref),
    };
  }, [
    hydrated,
    prefsHydrated,
    historyHydrated,
    activeProgram,
    router,
    pickedRaw,
    draft,
    completedToday,
    startHref,
    selectedWorkoutDay,
    setSelectedWorkoutDay,
    clearActiveProgram,
  ]);

  return <ProgramOverviewView {...viewProps} />;
}

