"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { WorkoutLoggerViewProps } from "./WorkoutLogger.types";
import type { RestTimerState } from "@/lib/storage/workoutRepo";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function RestTimerBar({
  restTimer,
  onStartRestTimer,
  onStopRestTimer,
}: {
  restTimer: RestTimerState;
  onStartRestTimer: (durationMs: number) => void;
  onStopRestTimer: () => void;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (restTimer.status !== "running") return;

    const updateRemaining = () => {
      const elapsed = Date.now() - restTimer.startedAt;
      const remaining = Math.max(0, Math.ceil((restTimer.durationMs - elapsed) / 1000));
      setRemainingSeconds(remaining);

      if (remaining === 0 && restTimer.status === "running") {
        // Timer finished, but don't auto-stop - let it show "Rest complete"
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 100);
    return () => clearInterval(interval);
  }, [restTimer]);

  if (restTimer.status === "idle") {
    return (
      <div className="mb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartRestTimer(60000)}
          className="flex-1"
        >
          Rest 60s
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartRestTimer(90000)}
          className="flex-1"
        >
          Rest 90s
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartRestTimer(120000)}
          className="flex-1"
        >
          Rest 120s
        </Button>
      </div>
    );
  }

  if (restTimer.status === "running") {
    const isFinished = remainingSeconds === 0;

    return (
      <div className="bg-muted mb-4 flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isFinished ? "Rest complete" : "Resting"}
          </span>
          {!isFinished ? (
            <Badge variant="secondary" className="tabular-nums">
              {formatTime(remainingSeconds)}
            </Badge>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={onStopRestTimer}>
          Stop
        </Button>
      </div>
    );
  }

  return null;
}

export function WorkoutLoggerView(props: WorkoutLoggerViewProps) {
  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (props.kind === "noProgram") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">No active program</h1>
        <p className="text-muted-foreground text-sm">
          Select a template first.
        </p>
        <Button className="h-10" onClick={props.onBrowseTemplates}>
          Browse templates
        </Button>
      </div>
    );
  }

  if (props.kind === "draftConflict") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Active workout</h1>
        <p className="text-muted-foreground text-sm">
          You have an active workout in progress:
        </p>
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="font-medium">
            {props.activeDraftProgram}
            {props.activeDraftDay ? ` • ${props.activeDraftDay}` : ""}
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          You tried to start:
        </p>
        <div className="rounded-lg border p-4">
          <p className="font-medium">
            {props.requestedProgram}
            {props.requestedDay ? ` • ${props.requestedDay}` : ""}
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          Resume your active workout, or discard it to start a new one.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="h-10 flex-1" onClick={props.onResume}>
            Resume active workout
          </Button>
          <Button
            variant="destructive"
            className="h-10 flex-1"
            onClick={props.onDiscard}
          >
            Discard & start new
          </Button>
        </div>
        <Button
          variant="outline"
          className="h-10 w-full"
          onClick={props.onCancel}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (props.kind === "completedToday") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Workout completed</h1>
        <p className="text-muted-foreground text-sm">
          You’ve already completed today’s workout.
        </p>
        <p className="text-muted-foreground text-sm">
          {props.programName}
          {props.dayLabel ? ` • ${props.dayLabel}` : ""}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="h-10 flex-1" onClick={props.onTakeRestDay}>
            Take a rest day
          </Button>
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={props.onRepeat}
          >
            Repeat workout
          </Button>
        </div>

        <Button
          variant="outline"
          className="h-10 w-full sm:w-auto"
          onClick={props.onBackToOverview}
        >
          Back to overview
        </Button>
      </div>
    );
  }

  if (props.kind === "noDraft") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        {props.isRestDay ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Rest day</h1>
            <p className="text-muted-foreground text-sm">
              {props.dayLabel ?? "Today"} is a rest day. Choose another day or
              view your overview.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="h-10 flex-1" onClick={props.onBackToOverview}>
                Back to overview
              </Button>
              <Button
                variant="outline"
                className="h-10 flex-1"
                onClick={props.onUseAutoDay}
              >
                Use auto day
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Ready to start
            </h1>
            <p className="text-muted-foreground text-sm">
              {props.programName}
              {props.dayLabel ? ` • ${props.dayLabel}` : ""}
            </p>
            <Button
              className="h-10"
              onClick={props.onStart}
              disabled={props.startDisabled}
            >
              Start workout
            </Button>
          </>
        )}
      </div>
    );
  }

  const { programName, setsDone, setsTotal, exercises } = props;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Workout logger</h1>
          <p className="text-muted-foreground text-sm">{programName}</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {setsDone}/{setsTotal} sets done
        </Badge>
      </div>

      <RestTimerBar
        restTimer={props.restTimer}
        onStartRestTimer={props.onStartRestTimer}
        onStopRestTimer={props.onStopRestTimer}
      />

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {exercises.map((ex) => (
            <div key={ex.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{ex.name}</p>
                {ex.targetLabel ? (
                  <Badge variant="outline" className="text-[10px]">
                    {ex.targetLabel}
                  </Badge>
                ) : null}
              </div>

              {ex.targetText ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  {ex.targetText}
                </p>
              ) : null}

              {ex.previousPerformance ? (
                <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                  <span>
                    Previous:{" "}
                    {ex.previousPerformance.weight
                      ? `${ex.previousPerformance.weight} × ${ex.previousPerformance.reps}`
                      : ex.previousPerformance.reps}{" "}
                    ({ex.previousPerformance.relativeDate})
                  </span>
                  {!ex.previousPerformance.isSameProgram ? (
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 px-1 py-0"
                    >
                      {ex.previousPerformance.programName}
                    </Badge>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3 space-y-2">
                {ex.setRows.map((set, setIndex) => (
                  <div key={set.id} className="space-y-1">
                    <div className="bg-background grid grid-cols-12 items-center gap-2 rounded-md border p-2">
                      <div className="col-span-2">
                        <span className="text-muted-foreground text-xs">
                          Set {set.setNumber}
                        </span>
                      </div>
                    <div className="col-span-4">
                      <Input
                        value={set.repsValue}
                        placeholder={set.repsPlaceholder}
                        onChange={(e) =>
                          props.onUpdateSet(set.id, {
                            actualReps: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={set.weightValue}
                        placeholder={set.weightPlaceholder}
                        onChange={(e) =>
                          props.onUpdateSet(set.id, {
                            actualWeight: e.target.value.trim()
                              ? e.target.value
                              : null,
                          })
                        }
                      />
                    </div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <Checkbox
                          checked={set.completed}
                          onCheckedChange={(v) =>
                            props.onUpdateSet(set.id, { completed: Boolean(v) })
                          }
                        />
                      </div>
                    </div>
                    {ex.previousPerformance && setIndex === 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-6 w-full text-[10px]"
                        onClick={() => props.onCopyPrevious(ex.id, set.id)}
                      >
                        Copy previous
                      </Button>
                    ) : null}
                    {set.canCopyLastSet && setIndex !== 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-6 w-full text-[10px]"
                        onClick={() => props.onCopyLastSet(ex.id, set.id)}
                      >
                        Copy set {set.setNumber - 1}
                      </Button>
                    ) : null}
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="h-10 w-full"
                  onClick={() => props.onAddSet(ex.id)}
                >
                  {ex.canAddExtraSet ? "Add extra set" : "Add set"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="h-10 flex-1"
          onClick={props.onFinish}
          disabled={props.finishDisabled}
        >
          Finish workout
        </Button>
        <Button
          variant="outline"
          className="h-10 flex-1"
          onClick={props.onSaveExit}
        >
          Save & exit
        </Button>
      </div>
    </div>
  );
}
