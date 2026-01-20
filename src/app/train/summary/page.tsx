"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function TrainSummaryPageInner() {
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

    return { completedSets, totalSets, durationMs, volume };
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
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!logId || !item || !metrics) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Workout complete</h1>
        <p className="text-sm text-muted-foreground">
          We couldn’t find that session on this device.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-10 flex-1">
            <Link href="/train/history">View history</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 flex-1">
            <Link href="/train/overview">Back to overview</Link>
          </Button>
        </div>
      </div>
    );
  }

  const dayLabel =
    item.programDayLabel ?? (item.programDayIndex ? `Day ${item.programDayIndex}` : "Day");
  const finishedAtIso = item.endedAt ?? item.updatedAt ?? item.date;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Workout complete</h1>
        <p className="text-sm text-muted-foreground">
          {item.programName} • {dayLabel}
        </p>
        <p className="text-sm text-muted-foreground">Finished {formatDateTime(finishedAtIso)}</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-4 pb-4">
          <Badge variant="secondary">
            {metrics.completedSets}/{metrics.totalSets} sets completed
          </Badge>
          <Badge variant="secondary">Duration: {formatDurationMs(metrics.durationMs)}</Badge>
          <Badge variant="secondary">
            Volume: {Math.round(metrics.volume).toLocaleString()}
          </Badge>
        </CardContent>
      </Card>

      {nextAction ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">
              {nextAction.type === "rest_day" ? "Take a rest day" : "Ready for the next one?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            {nextAction.type === "start_next" ? (
              <p className="text-sm text-muted-foreground">
                Your next workout is Day {nextAction.dayIndex}.
              </p>
            ) : nextAction.type === "rest_day" ? (
              <p className="text-sm text-muted-foreground">
                Next scheduled day is a rest day. Recovery is part of progress.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No workouts configured in this program week.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {nextAction.type === "start_next" ? (
                <Button
                  className="h-10 flex-1"
                  onClick={() =>
                    router.push(`/train/log?day=${nextAction.dayIndex}&autostart=1`)
                  }
                >
                  Start next workout
                </Button>
              ) : nextAction.type === "rest_day" ? (
                <>
                  <Button
                    className="h-10 flex-1"
                    onClick={() => router.push("/train/overview")}
                  >
                    Take a rest day
                  </Button>
                  {nextAction.nextWorkoutDayIndex ? (
                    <Button
                      variant="outline"
                      className="h-10 flex-1"
                      onClick={() =>
                        router.push(
                          `/train/log?day=${nextAction.nextWorkoutDayIndex}&autostart=1`,
                        )
                      }
                    >
                      Start next workout
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        {item.programDayIndex ? (
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() =>
              router.push(`/train/log?day=${item.programDayIndex}&autostart=1`)
            }
          >
            Repeat this workout
          </Button>
        ) : null}
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href="/train/overview">Back to overview</Link>
        </Button>
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href="/train/history">View history</Link>
        </Button>
      </div>
    </div>
  );
}

export default function TrainSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <TrainSummaryPageInner />
    </Suspense>
  );
}
