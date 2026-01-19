"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import type {
  GuestWorkoutBuilderDraft,
  GuestWorkoutBuilderExercise,
} from "@/lib/guest/types";
import { SAMPLE_EXERCISES } from "./sample-exercise-library";

function nextOrder(exercises: GuestWorkoutBuilderExercise[]) {
  if (!exercises.length) return 0;
  return Math.max(...exercises.map((e) => e.order)) + 1;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  if (item === undefined) return arr;
  copy.splice(to, 0, item);
  return copy;
}

export function BuilderExercisesStep({
  draft,
  onChange,
  onBack,
  onNext,
}: {
  draft: GuestWorkoutBuilderDraft;
  onChange: (next: GuestWorkoutBuilderDraft) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState("");

  const exercises = useMemo(
    () => draft.exercises.slice().sort((a, b) => a.order - b.order),
    [draft.exercises],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_EXERCISES.slice(0, 10);
    return SAMPLE_EXERCISES.filter((e) =>
      e.name.toLowerCase().includes(q),
    ).slice(0, 10);
  }, [query]);

  const canContinue = exercises.length > 0;

  const addExercise = (id: string, name: string) => {
    const exists = draft.exercises.some(
      (e) => e.exerciseId === id || e.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) return;
    const ex: GuestWorkoutBuilderExercise = {
      exerciseId: id,
      name,
      order: nextOrder(draft.exercises),
      targetSets: null,
      targetReps: null,
      targetWeight: null,
    };
    onChange({
      ...draft,
      exercises: [...draft.exercises, ex],
      updatedAt: new Date().toISOString(),
    });
  };

  const addCustom = () => {
    const n = customName.trim();
    if (!n) return;
    const id = `custom_${n.toLowerCase().replace(/\s+/g, "_")}`;
    addExercise(id, n);
    setCustomName("");
  };

  const updateExercise = (
    exerciseId: string,
    patch: Partial<GuestWorkoutBuilderExercise>,
  ) => {
    onChange({
      ...draft,
      exercises: draft.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, ...patch } : e,
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const removeExercise = (exerciseId: string) => {
    onChange({
      ...draft,
      exercises: draft.exercises.filter((e) => e.exerciseId !== exerciseId),
      updatedAt: new Date().toISOString(),
    });
  };

  const reorder = (fromIdx: number, toIdx: number) => {
    const ordered = exercises;
    const moved = move(ordered, fromIdx, toIdx).map((e, idx) => ({
      ...e,
      order: idx,
    }));
    onChange({ ...draft, exercises: moved, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Add exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search library</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises…"
              />
              <div className="space-y-2">
                {results.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="hover:bg-accent flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm"
                    onClick={() => addExercise(r.id, r.name)}
                  >
                    <span className="truncate">{r.name}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Add
                    </Badge>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Offline mode uses a small built-in library. You can always add a custom exercise name.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom exercise</label>
              <div className="flex gap-2">
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Cable Fly"
                />
                <Button type="button" onClick={addCustom}>
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this when you can’t find an exercise in the list.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Selected exercises</p>
            {exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add at least one exercise to continue.
              </p>
            ) : (
              <div className="space-y-2">
                {exercises.map((ex, idx) => (
                  <div key={ex.exerciseId} className="rounded-xl border bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Optional targets (sets / reps / weight)
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          disabled={idx === 0}
                          onClick={() => reorder(idx, idx - 1)}
                        >
                          Up
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          disabled={idx === exercises.length - 1}
                          onClick={() => reorder(idx, idx + 1)}
                        >
                          Down
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-8"
                          onClick={() => removeExercise(ex.exerciseId)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Sets</label>
                        <Input
                          inputMode="numeric"
                          value={ex.targetSets ?? ""}
                          onChange={(e) =>
                            updateExercise(ex.exerciseId, {
                              targetSets:
                                e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Reps</label>
                        <Input
                          inputMode="numeric"
                          value={ex.targetReps ?? ""}
                          onChange={(e) =>
                            updateExercise(ex.exerciseId, {
                              targetReps:
                                e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Weight (kg)</label>
                        <Input
                          inputMode="decimal"
                          value={ex.targetWeight ?? ""}
                          onChange={(e) =>
                            updateExercise(ex.exerciseId, {
                              targetWeight:
                                e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext} disabled={!canContinue}>
              Next: Overview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

