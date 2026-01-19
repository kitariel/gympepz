"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";

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
  const {
    draft,
    saveDraft,
    clearDraft,
    addSet,
    updateSet,
    finish,
    hydrated: draftHydrated,
  } =
    useWorkoutDraft();

  const hydrated = programHydrated && draftHydrated;

  const today = useMemo(() => getDayNumberForToday(), []);
  const todaysPlan = useMemo(() => {
    if (!activeProgram) return null;
    return pickWorkoutDayForWeekday(activeProgram.plan.days, today)?.day ?? null;
  }, [activeProgram, today]);

  // If user switched templates, drop the stale draft so we regenerate from the new program.
  useEffect(() => {
    if (!hydrated) return;
    if (!activeProgram) return;
    if (!draft) return;
    if (!draft.templateId) return;
    if (draft.templateId === activeProgram.templateId) return;
    clearDraft();
  }, [hydrated, activeProgram, draft, clearDraft]);

  // If there's no draft but we have an active program, create a fresh draft for today.
  useEffect(() => {
    if (!hydrated) return;
    if (!activeProgram) return;
    if (draft) return;
    if (!todaysPlan) return;

    const exercises = todaysPlan.items
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((it) => ({
        id: makeId("ex"),
        name: it.nameFallback ?? "Exercise",
        order: it.order,
        targetSets: it.sets ?? null,
        targetReps: it.reps ?? null,
        targetWeight: it.weight ?? null,
      }));

    const sets = exercises.flatMap((ex) => {
      const target = ex.targetSets ?? 0;
      if (!target || target <= 0) return [];
      return Array.from({ length: target }, (_, idx) => ({
        id: makeId("set"),
        exerciseId: ex.id,
        exerciseName: ex.name,
        setNumber: idx + 1,
        targetReps: ex.targetReps ?? null,
        actualReps: ex.targetReps ?? "",
        targetWeight: ex.targetWeight ?? null,
        actualWeight: ex.targetWeight ?? null,
        completed: false,
        createdAt: nowIso(),
      }));
    });

    saveDraft({
      id: makeId("workout"),
      templateId: activeProgram.templateId,
      programName: activeProgram.name,
      date: nowIso(),
      startedAt: nowIso(),
      completed: false,
      exercises,
      sets,
      notes: null,
      updatedAt: nowIso(),
    });
  }, [hydrated, activeProgram, draft, todaysPlan]);

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
    acc[s.exerciseId] = (acc[s.exerciseId] ?? 0) + 1;
    return acc;
  }, {});

  const completedCount = draft.sets.filter((s) => s.completed).length;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Workout logger</h1>
          <p className="text-sm text-muted-foreground">{draft.programName}</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {completedCount}/{draft.sets.length} sets done
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
              const setsForExercise = draft.sets
                .filter((s) => s.exerciseId === ex.id)
                .slice()
                .sort((a, b) => a.setNumber - b.setNumber);

              const count = setsByExercise[ex.id] ?? 0;
              const completed = setsForExercise.filter((s) => s.completed).length;
              const targetSets = ex.targetSets ?? null;
              const targetLabel =
                targetSets != null
                  ? `${completed}/${targetSets} sets`
                  : `${completed} sets`;

              return (
                <div key={ex.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{ex.name}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {targetLabel}
                    </Badge>
                  </div>

                  {(ex.targetReps || ex.targetWeight || ex.targetSets) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Target:{" "}
                      {ex.targetSets != null ? `${ex.targetSets} sets` : null}
                      {ex.targetReps ? ` • ${ex.targetReps}` : ""}
                      {ex.targetWeight ? ` • ${ex.targetWeight}` : ""}
                    </p>
                  )}

                  <div className="mt-3 space-y-2">
                    {setsForExercise.map((set) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-12 items-center gap-2 rounded-md border bg-background p-2"
                      >
                        <div className="col-span-2">
                          <span className="text-xs text-muted-foreground">
                            Set {set.setNumber}
                          </span>
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={set.actualReps}
                            placeholder={set.targetReps ?? "reps / time"}
                            onChange={(e) =>
                              updateSet(set.id, { actualReps: e.target.value })
                            }
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={set.actualWeight ?? ""}
                            placeholder={set.targetWeight ?? "weight / notes"}
                            onChange={(e) =>
                              updateSet(set.id, {
                                actualWeight: e.target.value.trim() ? e.target.value : null,
                              })
                            }
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Checkbox
                            checked={set.completed}
                            onCheckedChange={(v) =>
                              updateSet(set.id, { completed: Boolean(v) })
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="h-10 w-full"
                      onClick={() => addSet(ex.id)}
                    >
                      {targetSets != null && count >= targetSets ? "Add extra set" : "Add set"}
                    </Button>
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

