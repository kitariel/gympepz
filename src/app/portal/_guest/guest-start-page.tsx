"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { GuestModeBanner } from "@/app/portal/_guest/guest-mode-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  appendOfflineWorkoutLog,
  createSampleWeeklyPlanSnapshot,
  getWeekId,
  readWeeklyPlanSnapshot,
  uuid,
  writeWeeklyPlanSnapshot,
} from "@/lib/guest/storage";
import type { OfflineWorkoutLog, OfflineWorkoutSet, WeeklyPlanSnapshot } from "@/lib/guest/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type SnapshotDay = WeeklyPlanSnapshot["days"][number];
type SnapshotItem = SnapshotDay["items"][number];

export function GuestStartPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<WeeklyPlanSnapshot | null>(null);
  const [draft, setDraft] = useState<OfflineWorkoutLog | null>(null);
  const [summaryLog, setSummaryLog] = useState<OfflineWorkoutLog | null>(null);

  const todayLabel = DAY_NAMES[new Date().getDay()] ?? null;

  useEffect(() => {
    setSnapshot(readWeeklyPlanSnapshot());
  }, []);

  const today = useMemo(() => {
    if (!snapshot || !todayLabel) return null;
    return snapshot.days.find((d) => d.dayLabel === todayLabel) ?? null;
  }, [snapshot, todayLabel]);

  const items = useMemo(() => {
    return (today?.items ?? []).slice().sort((a, b) => a.order - b.order);
  }, [today]);

  const setsByExercise = useMemo(() => {
    const map = new Map<string, OfflineWorkoutSet[]>();
    for (const s of draft?.sets ?? []) {
      const arr = map.get(s.exerciseId) ?? [];
      arr.push(s);
      map.set(s.exerciseId, arr);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => a.setNumber - b.setNumber);
      map.set(k, arr);
    }
    return map;
  }, [draft?.sets]);

  const startDraft = () => {
    if (!today) return;
    const now = new Date().toISOString();
    const log: OfflineWorkoutLog = {
      clientLogId: uuid(),
      planDayId: today.planDayId,
      date: new Date().toISOString(),
      startTime: now,
      endTime: null,
      completed: false,
      notes: null,
      synced: false,
      sets: [],
    };
    setDraft(log);
    setSummaryLog(null);
  };

  const addSet = (item: SnapshotItem) => {
    if (!draft) return;
    const existing = setsByExercise.get(item.exerciseId) ?? [];
    const nextNumber = existing.length + 1;
    const set: OfflineWorkoutSet = {
      clientSetId: uuid(),
      exerciseId: item.exerciseId,
      setNumber: nextNumber,
      targetReps: item.reps ?? null,
      actualReps: item.reps ?? 0,
      targetWeight: item.weight ?? null,
      actualWeight: item.weight ?? null,
      rpe: null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setDraft({ ...draft, sets: [...draft.sets, set] });
  };

  const updateSet = (clientSetId: string, patch: Partial<OfflineWorkoutSet>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      sets: draft.sets.map((s) => (s.clientSetId === clientSetId ? { ...s, ...patch } : s)),
    });
  };

  const saveAndExit = () => {
    if (!draft) return;
    appendOfflineWorkoutLog(draft);
    router.push("/portal/log");
  };

  const finishWorkout = () => {
    if (!draft) return;
    const finished: OfflineWorkoutLog = {
      ...draft,
      completed: true,
      endTime: new Date().toISOString(),
    };
    appendOfflineWorkoutLog(finished);
    setSummaryLog(finished);
    setDraft(null);
  };

  // Warn on tab close during an active guest workout
  useEffect(() => {
    const hasProgress = Boolean(draft && draft.sets.length > 0);
    if (!hasProgress) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [draft]);

  const summary = useMemo(() => {
    if (!summaryLog) return null;
    const start = new Date(summaryLog.startTime).getTime();
    const end = summaryLog.endTime ? new Date(summaryLog.endTime).getTime() : Date.now();
    const durationMin = Math.max(1, Math.round((end - start) / 60000));
    const totalSets = summaryLog.sets.length;
    const completedSets = summaryLog.sets.filter((s) => s.completed).length;
    const totalVolume = summaryLog.sets.reduce((sum, s) => {
      const w = s.actualWeight ?? s.targetWeight ?? 0;
      const r = s.actualReps ?? s.targetReps ?? 0;
      return sum + w * r;
    }, 0);
    return { durationMin, totalSets, completedSets, totalVolume };
  }, [summaryLog]);

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout session</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Real-time logging in Guest Mode (session-only).
          </p>
        </div>
        <GuestModeBanner />
      </div>

      {summaryLog && summary ? (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-base">Workout complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold">{summary.durationMin} min</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Sets</p>
                  <p className="text-lg font-semibold">
                    {summary.completedSets}/{summary.totalSets}
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="text-lg font-semibold">
                    {Math.round(summary.totalVolume)} kg
                  </p>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-sm font-medium">Save your progress</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Guest Mode is temporary. Create an account to save this session, unlock AI planning,
                  and build real progress history.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button asChild className="h-11">
                    <Link href="/login?callbackUrl=/portal/log">Save this session</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11">
                    <Link href="/portal/log">View session history</Link>
                  </Button>
                </div>
              </div>

              <Button asChild variant="ghost" className="h-9 w-full">
                <Link href="/portal">Back to dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm">Progress analytics (preview)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              <p className="text-sm text-muted-foreground">
                When workouts are saved, GymPepz tracks strength and performance trends over time.
              </p>
              <Button asChild size="sm" variant="outline" className="h-9 w-full sm:w-auto">
                <Link href="/portal/log">See demo analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {!summaryLog ? (
        !snapshot ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Start with a sample plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              This is a guided demo workout so you can try real-time logging fast.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  const sample = createSampleWeeklyPlanSnapshot(getWeekId());
                  writeWeeklyPlanSnapshot(sample);
                  setSnapshot(sample);
                }}
              >
                Start a sample workout
              </Button>
              <Button asChild variant="outline">
                <Link href="/portal">Back to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !today ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">No workout scheduled for today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Your cached plan doesn’t include a workout for {todayLabel ?? "today"}.
            </p>
            <Button asChild className="h-9">
              <Link href="/portal">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : today.isRestDay ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">{today.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">Rest day.</p>
            <Button asChild className="h-9">
              <Link href="/portal">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{today.title}</CardTitle>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {today.dayLabel ?? "Today"}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Guest
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {!draft ? (
                <Button onClick={startDraft} className="h-11 w-full">
                  Start workout
                </Button>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={finishWorkout} className="h-11 flex-1">
                    Finish workout
                  </Button>
                  <Button onClick={saveAndExit} variant="outline" className="h-11 flex-1">
                    Save & exit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {draft ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Textarea
                  value={draft.notes ?? ""}
                  onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                  placeholder="Optional notes…"
                  className="resize-none"
                  rows={3}
                />
              </CardContent>
            </Card>
          ) : null}

          <div className="space-y-3">
            {items.map((it) => {
              const exerciseSets = setsByExercise.get(it.exerciseId) ?? [];
              return (
                <Card key={it.exerciseId} className="border-0 shadow-sm">
                  <CardHeader className="px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-sm">{it.name}</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {it.sets}×{it.reps}
                        {it.weight != null ? ` @ ${it.weight}` : ""}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    {exerciseSets.length ? (
                      <div className="space-y-2">
                        {exerciseSets.map((s) => (
                          <div
                            key={s.clientSetId}
                            className="grid grid-cols-[auto_1fr_1fr_1fr] items-center gap-2"
                          >
                            <div className="text-xs text-muted-foreground">
                              #{s.setNumber}
                            </div>
                            <Input
                              inputMode="numeric"
                              value={String(s.actualReps)}
                              onChange={(e) =>
                                updateSet(s.clientSetId, {
                                  actualReps: Number(e.target.value || 0),
                                })
                              }
                              className="h-9"
                              placeholder="reps"
                            />
                            <Input
                              inputMode="decimal"
                              value={s.actualWeight == null ? "" : String(s.actualWeight)}
                              onChange={(e) =>
                                updateSet(s.clientSetId, {
                                  actualWeight:
                                    e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              className="h-9"
                              placeholder="kg"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-muted-foreground">Done</span>
                              <Checkbox
                                checked={s.completed}
                                onCheckedChange={(v) =>
                                  updateSet(s.clientSetId, { completed: Boolean(v) })
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Add your first set to start logging.
                      </p>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full"
                      disabled={!draft}
                      onClick={() => addSet(it)}
                    >
                      Add set
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        )
      ) : null}
    </div>
  );
}

