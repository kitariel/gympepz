"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { WorkoutLoggerViewProps } from "./WorkoutLogger.types";

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

              <div className="mt-3 space-y-2">
                {ex.setRows.map((set) => (
                  <div
                    key={set.id}
                    className="bg-background grid grid-cols-12 items-center gap-2 rounded-md border p-2"
                  >
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
