"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { getNextAction } from "@/lib/program-templates/getNextAction";
import type { SummaryMetrics, SummaryViewProps } from "./TrainSummary.types";
import { TrainSummaryView } from "./TrainSummary.view";

function parseNumberMaybe(v: string | null | undefined): number | null {
  if (!v) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

export function TrainSummary() {
  // Container: resolves data + navigation, delegates rendering to the view.
  const router = useRouter();
  const searchParams = useSearchParams();
  const logId = searchParams.get("logId");

  const { hydrated, history } = useWorkoutDraft();
  const { hydrated: programHydrated, activeProgram } = useActiveProgram();

  const item = useMemo(() => {
    if (!logId) return null;
    return history.find((h) => h.id === logId) ?? null;
  }, [history, logId]);

  const metrics: SummaryMetrics | null = useMemo(() => {
    if (!item) return null;
    const completedSets = item.sets.filter((s) => s.completed).length;
    const totalSets = item.sets.length;
    const durationMs =
      item.endedAt && item.startedAt
        ? new Date(item.endedAt).getTime() - new Date(item.startedAt).getTime()
        : 0;

    const volume = item.sets.reduce((acc, s) => {
      if (!s.completed) return acc;
      const reps = parseNumberMaybe(s.actualReps);
      const weight = parseNumberMaybe(s.actualWeight);
      if (reps == null || weight == null) return acc;
      return acc + reps * weight;
    }, 0);

    const exerciseCount = new Set(
      item.sets.filter((s) => s.completed).map((s) => s.exerciseId),
    ).size;
    const completionPercent =
      totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    return {
      completedSets,
      totalSets,
      durationMs,
      volume,
      exerciseCount,
      completionPercent,
    };
  }, [item]);

  const nextAction = useMemo(() => {
    if (!activeProgram || !item?.programDayIndex) return null;
    return getNextAction({
      days: activeProgram.plan.days,
      justFinishedDayIndex: item.programDayIndex,
    });
  }, [activeProgram, item?.programDayIndex]);

  let viewProps: SummaryViewProps;

  if (!hydrated || !programHydrated) {
    viewProps = { state: "loading" };
  } else if (!logId || !item || !metrics) {
    viewProps = {
      state: "missing",
      historyHref: "/train/history",
      overviewHref: "/train/overview",
    };
  } else {
    const dayLabel =
      item.programDayLabel ??
      (item.programDayIndex ? `Day ${item.programDayIndex}` : "Day");
    const finishedAtIso = item.endedAt ?? item.updatedAt ?? item.date;
    const isFullCompletion = metrics.completionPercent === 100;

    viewProps = {
      state: "ready",
      item,
      metrics,
      dayLabel,
      finishedAtIso,
      isFullCompletion,
      nextAction,
      onStartNext:
        nextAction?.type === "start_next"
          ? () =>
              router.push(`/train/log?day=${nextAction.dayIndex}&autostart=1`)
          : undefined,
      onSkipRest:
        nextAction?.type === "rest_day" && nextAction.nextWorkoutDayIndex
          ? () =>
              router.push(
                `/train/log?day=${nextAction.nextWorkoutDayIndex}&autostart=1`,
              )
          : undefined,
      onRepeat:
        item.programDayIndex
          ? () =>
              router.push(`/train/log?day=${item.programDayIndex}&autostart=1`)
          : undefined,
      homeHref: "/train",
      historyHref: "/train/history",
    };
  }

  return <TrainSummaryView {...viewProps} />;
}
