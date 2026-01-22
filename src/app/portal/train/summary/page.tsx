"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Trophy,
  Clock,
  Dumbbell,
  Flame,
  ChevronRight,
  RotateCcw,
  Home,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { getNextAction } from "@/lib/program-templates/getNextAction";

function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min <= 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
    return `${date} • ${time}`;
  } catch {
    return iso;
  }
}

function parseNumberMaybe(v: string | null | undefined): number | null {
  if (!v) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="bg-muted/50 flex flex-col items-center justify-center rounded-xl p-4">
      <Icon className="text-muted-foreground mb-2 h-5 w-5" />
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
      {subValue ? (
        <p className="text-muted-foreground mt-1 text-[10px]">{subValue}</p>
      ) : null}
    </div>
  );
}

function PortalTrainSummaryPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logId = searchParams.get("logId");

  const { hydrated, history } = useWorkoutDraft();
  const { hydrated: programHydrated, activeProgram } = useActiveProgram();

  const item = useMemo(() => {
    if (!logId) return null;
    return history.find((h) => h.id === logId) ?? null;
  }, [history, logId]);

  const metrics = useMemo(() => {
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

  if (!hydrated || !programHydrated) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
        <div className="bg-muted h-32 animate-pulse rounded-xl" />
        <div className="bg-muted h-24 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!logId || !item || !metrics) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
        <div className="space-y-2 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Workout complete
          </h1>
          <p className="text-muted-foreground text-sm">
            We couldn&apos;t find that session on this device.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="touch-target h-12 flex-1">
            <Link href="/portal/train/history">View history</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="touch-target h-12 flex-1"
          >
            <Link href="/portal/train/overview">Back to overview</Link>
          </Button>
        </div>
      </div>
    );
  }

  const dayLabel =
    item.programDayLabel ??
    (item.programDayIndex ? `Day ${item.programDayIndex}` : "Day");
  const finishedAtIso = item.endedAt ?? item.updatedAt ?? item.date;
  const isFullCompletion = metrics.completionPercent === 100;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 pt-6 pb-24 md:p-6">
      {/* Hero celebration section */}
      <div className="space-y-4 text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isFullCompletion
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-amber-100 dark:bg-amber-900/30"
          }`}
        >
          <Trophy
            className={`h-10 w-10 ${
              isFullCompletion
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isFullCompletion ? "Great work!" : "Workout saved!"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {item.programName} • {dayLabel}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatDateTime(finishedAtIso)}
          </p>
        </div>

        {/* Completion progress */}
        <div className="mx-auto max-w-[200px] space-y-2">
          <Progress value={metrics.completionPercent} className="h-2" />
          <p className="text-muted-foreground text-xs">
            {metrics.completedSets}/{metrics.totalSets} sets completed (
            {metrics.completionPercent}%)
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Clock}
          label="Duration"
          value={formatDurationMs(metrics.durationMs)}
        />
        <StatCard
          icon={Dumbbell}
          label="Exercises"
          value={String(metrics.exerciseCount)}
        />
        <StatCard
          icon={Flame}
          label="Volume"
          value={
            metrics.volume > 0 ? `${Math.round(metrics.volume / 1000)}k` : "—"
          }
          subValue={
            metrics.volume > 0
              ? `${Math.round(metrics.volume).toLocaleString()} lbs`
              : undefined
          }
        />
      </div>

      {/* Next action card */}
      {nextAction ? (
        <Card elevation="hero">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {nextAction.type === "rest_day"
                    ? "Rest day tomorrow"
                    : "Ready for more?"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {nextAction.type === "start_next"
                    ? `Day ${nextAction.dayIndex} is up next`
                    : nextAction.type === "rest_day"
                      ? "Recovery is part of progress"
                      : "No more workouts this week"}
                </p>
              </div>
              {nextAction.type === "start_next" ? (
                <Button
                  size="sm"
                  className="shrink-0 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() =>
                    router.push(
                      `/portal/train/log?day=${nextAction.dayIndex}&autostart=1`,
                    )
                  }
                >
                  Start
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : nextAction.type === "rest_day" &&
                nextAction.nextWorkoutDayIndex ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() =>
                    router.push(
                      `/portal/train/log?day=${nextAction.nextWorkoutDayIndex}&autostart=1`,
                    )
                  }
                >
                  Skip rest
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Action buttons */}
      <div className="space-y-3">
        {item.programDayIndex ? (
          <Button
            variant="outline"
            className="touch-target h-12 w-full"
            onClick={() =>
              router.push(`/portal/train/log?day=${item.programDayIndex}&autostart=1`)
            }
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Repeat this workout
          </Button>
        ) : null}

        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="touch-target h-12 flex-1"
          >
            <Link href="/portal/train">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="touch-target h-12 flex-1"
          >
            <Link href="/portal/train/history">
              <History className="mr-2 h-4 w-4" />
              History
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PortalTrainSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
          <div className="bg-muted h-32 animate-pulse rounded-xl" />
          <div className="bg-muted h-24 animate-pulse rounded-xl" />
        </div>
      }
    >
      <PortalTrainSummaryPageInner />
    </Suspense>
  );
}
