"use client";

import { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  GuestWorkoutBuilderDraft,
  OfflineWorkoutLog,
  OfflineWorkoutSet,
} from "@/lib/guest/types";
import { uuid } from "@/lib/guest/storage";

type LoggerUpdate = (next: OfflineWorkoutLog) => void;

export function WorkoutLogger({
  builder,
  log,
  onUpdateLog,
  onFinish,
  onSaveExit,
  onRequestLeave,
}: {
  builder: GuestWorkoutBuilderDraft;
  log: OfflineWorkoutLog;
  onUpdateLog: LoggerUpdate;
  onFinish: () => void;
  onSaveExit: () => void;
  onRequestLeave: () => void;
}) {
  const exercises = useMemo(
    () => builder.exercises.slice().sort((a, b) => a.order - b.order),
    [builder.exercises],
  );

  const setsByExercise = useMemo(() => {
    const map = new Map<string, OfflineWorkoutSet[]>();
    for (const s of log.sets) {
      const arr = map.get(s.exerciseId) ?? [];
      arr.push(s);
      map.set(s.exerciseId, arr);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => a.setNumber - b.setNumber);
      map.set(k, arr);
    }
    return map;
  }, [log.sets]);

  const hasLoggedSets = log.sets.length > 0;

  // Warn on tab close if user has logged sets
  useEffect(() => {
    if (!hasLoggedSets) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasLoggedSets]);

  const addSet = (exerciseId: string) => {
    const ex = builder.exercises.find((e) => e.exerciseId === exerciseId);
    const existing = setsByExercise.get(exerciseId) ?? [];
    const nextNumber = existing.length + 1;
    const set: OfflineWorkoutSet = {
      clientSetId: uuid(),
      exerciseId,
      setNumber: nextNumber,
      targetReps: ex?.targetReps ?? null,
      actualReps: ex?.targetReps ?? 0,
      targetWeight: ex?.targetWeight ?? null,
      actualWeight: ex?.targetWeight ?? null,
      rpe: null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    onUpdateLog({ ...log, sets: [...log.sets, set] });
  };

  const updateSet = (clientSetId: string, patch: Partial<OfflineWorkoutSet>) => {
    onUpdateLog({
      ...log,
      sets: log.sets.map((s) =>
        s.clientSetId === clientSetId ? { ...s, ...patch } : s,
      ),
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{builder.name}</CardTitle>
              <p className="text-xs text-muted-foreground">Logging in real time</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" className="h-9" onClick={onRequestLeave}>
                Leave
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="h-11 flex-1" onClick={onFinish}>
              Finish workout
            </Button>
            <Button variant="outline" className="h-11 flex-1" onClick={onSaveExit}>
              Save & exit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm">Notes</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Textarea
            value={log.notes ?? ""}
            onChange={(e) => onUpdateLog({ ...log, notes: e.target.value || null })}
            placeholder="Optional notes…"
            className="resize-none"
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {exercises.map((ex) => {
          const exSets = setsByExercise.get(ex.exerciseId) ?? [];
          return (
            <Card key={ex.exerciseId} className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm">{ex.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {ex.targetSets != null || ex.targetReps != null ? (
                      <>
                        Target:{" "}
                        {ex.targetSets != null ? `${ex.targetSets} sets` : "—"} •{" "}
                        {ex.targetReps != null ? `${ex.targetReps} reps` : "—"}
                        {ex.targetWeight != null ? ` • ${ex.targetWeight} kg` : ""}
                      </>
                    ) : (
                      "No targets"
                    )}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {exSets.length ? (
                  <div className="space-y-2">
                    {exSets.map((s) => (
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
                  onClick={() => addSet(ex.exerciseId)}
                >
                  Add set
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

