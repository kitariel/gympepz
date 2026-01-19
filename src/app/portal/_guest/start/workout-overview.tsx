"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuestWorkoutBuilderDraft } from "@/lib/guest/types";

export function WorkoutOverview({
  draft,
  onStart,
  onEdit,
}: {
  draft: GuestWorkoutBuilderDraft;
  onStart: () => void;
  onEdit: () => void;
}) {
  const exercises = draft.exercises.slice().sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Workout overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Workout name</p>
            <p className="text-lg font-semibold">{draft.name}</p>
            {draft.notes ? (
              <p className="text-sm text-muted-foreground">{draft.notes}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Exercises</p>
            {exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exercises added.</p>
            ) : (
              <div className="rounded-xl border bg-background">
                <div className="divide-y">
                  {exercises.map((ex, idx) => (
                    <div key={ex.exerciseId} className="flex items-center gap-3 p-3">
                      <div className="text-xs text-muted-foreground w-6 text-right">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.targetSets != null || ex.targetReps != null ? (
                            <>
                              Target:{" "}
                              {ex.targetSets != null ? `${ex.targetSets} sets` : "—"} •{" "}
                              {ex.targetReps != null ? `${ex.targetReps} reps` : "—"}
                              {ex.targetWeight != null ? ` • ${ex.targetWeight} kg` : ""}
                            </>
                          ) : (
                            "No targets set"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onEdit}>
              Edit workout
            </Button>
            <Button onClick={onStart}>Start workout</Button>
          </div>

          <p className="text-xs text-muted-foreground">
            This screen is read-only—review first, then press Start when you’re ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

