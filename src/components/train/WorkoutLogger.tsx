"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

function getDayNumberForToday(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d as 1 | 2 | 3 | 4 | 5 | 6;
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function WorkoutLogger() {
  const router = useRouter();
  const { activeProgram, hydrated: programHydrated } = useActiveProgram();
  const { draft, saveDraft, addSet, finish, hydrated: draftHydrated } =
    useWorkoutDraft();

  const hydrated = programHydrated && draftHydrated;

  const today = useMemo(() => getDayNumberForToday(), []);
  const todaysPlan = useMemo(() => {
    if (!activeProgram) return null;
    return (
      activeProgram.plan.days.find((d) => d.day === today) ??
      activeProgram.plan.days[0] ??
      null
    );
  }, [activeProgram, today]);

  // If there's no draft but we have an active program, create a fresh draft for today.
  useMemo(() => {
    if (!hydrated) return;
    if (!activeProgram) return;
    if (draft) return;
    if (!todaysPlan) return;

    saveDraft({
      id: makeId("workout"),
      programName: activeProgram.name,
      date: nowIso(),
      startedAt: nowIso(),
      completed: false,
      exercises: todaysPlan.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((it) => ({
          id: makeId("ex"),
          name: it.nameFallback ?? "Exercise",
          order: it.order,
        })),
      sets: [],
      notes: null,
      updatedAt: nowIso(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, activeProgram, draft, todaysPlan]);

  const [repsByExercise, setRepsByExercise] = useState<Record<string, string>>(
    {},
  );
  const [weightByExercise, setWeightByExercise] = useState<Record<string, string>>(
    {},
  );

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!activeProgram) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">No active program</h1>
        <p className="text-sm text-muted-foreground">
          Select a template first.
        </p>
        <Button className="h-10" onClick={() => router.push("/train/templates")}>
          Browse templates
        </Button>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Preparing workout…</p>
      </div>
    );
  }

  const setsByExercise = draft.sets.reduce<Record<string, number>>((acc, s) => {
    acc[s.exerciseName] = (acc[s.exerciseName] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Workout logger</h1>
          <p className="text-sm text-muted-foreground">{draft.programName}</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {draft.sets.length} sets logged
        </Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {draft.exercises
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((ex) => {
              const reps = repsByExercise[ex.name] ?? "";
              const weight = weightByExercise[ex.name] ?? "";
              const count = setsByExercise[ex.name] ?? 0;

              return (
                <div key={ex.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{ex.name}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {count} sets
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Reps</label>
                      <Input
                        value={reps}
                        inputMode="numeric"
                        placeholder="e.g. 10"
                        onChange={(e) =>
                          setRepsByExercise((s) => ({ ...s, [ex.name]: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Weight (optional)
                      </label>
                      <Input
                        value={weight}
                        inputMode="decimal"
                        placeholder="e.g. 40"
                        onChange={(e) =>
                          setWeightByExercise((s) => ({
                            ...s,
                            [ex.name]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="h-10 w-full"
                        onClick={() => {
                          const repsNum = Number(reps);
                          if (!Number.isFinite(repsNum) || repsNum <= 0) return;
                          const weightNum = weight.trim()
                            ? Number(weight)
                            : null;
                          addSet(
                            ex.name,
                            repsNum,
                            Number.isFinite(weightNum as number) ? weightNum : null,
                          );
                          setRepsByExercise((s) => ({ ...s, [ex.name]: "" }));
                        }}
                      >
                        Add set
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="h-10 flex-1"
          onClick={() => {
            finish();
            router.push("/train/history");
          }}
          disabled={draft.sets.length === 0}
        >
          Finish workout
        </Button>
        <Button
          variant="outline"
          className="h-10 flex-1"
          onClick={() => router.push("/train")}
        >
          Save & exit
        </Button>
      </div>
    </div>
  );
}

