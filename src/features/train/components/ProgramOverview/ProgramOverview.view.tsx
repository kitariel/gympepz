"use client";

import Link from "next/link";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProgramOverviewViewProps } from "./ProgramOverview.types";

export function ProgramOverviewView(props: ProgramOverviewViewProps) {
  const [repeatPromptOpen, setRepeatPromptOpen] = useState(false);

  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (props.kind === "noProgram") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">No active program</h1>
        <p className="text-sm text-muted-foreground">
          Select a template to generate your program snapshot.
        </p>
        <Button className="h-10" onClick={props.onBrowseTemplates}>
          Browse templates
        </Button>
      </div>
    );
  }

  const {
    programName,
    selectedDay,
    onSelectedDayChange,
    onClearProgram,
    picked,
    week,
    primaryCtaText,
    onPrimaryCta,
    repeatPromptEnabled,
    onConfirmRepeat,
  } = props;

  const handlePrimary = () => {
    if (repeatPromptEnabled) {
      setRepeatPromptOpen(true);
      return;
    }
    onPrimaryCta();
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Program overview</h1>
          <p className="text-sm text-muted-foreground">{programName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(selectedDay)}
            onValueChange={(v) =>
              onSelectedDayChange(
                v === "auto" ? "auto" : (Number(v) as 1 | 2 | 3 | 4 | 5 | 6 | 7),
              )
            }
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Today mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="1">Day 1</SelectItem>
              <SelectItem value="2">Day 2</SelectItem>
              <SelectItem value="3">Day 3</SelectItem>
              <SelectItem value="4">Day 4</SelectItem>
              <SelectItem value="5">Day 5</SelectItem>
              <SelectItem value="6">Day 6</SelectItem>
              <SelectItem value="7">Day 7</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-[10px]">
            Active
          </Badge>
          <Button variant="outline" className="h-9" onClick={onClearProgram}>
            Clear
          </Button>
        </div>
      </div>

      {picked ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base">{picked.title}</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                Day {picked.dayIndex}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm font-medium">{picked.label}</p>
            <ul className="space-y-1">
              {picked.items.map((it, idx) => (
                <li
                  key={`${picked.dayIndex}-${idx}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">{it.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{it.setsText}</span>
                </li>
              ))}
            </ul>
            <Button className="h-10 w-full sm:w-auto" onClick={handlePrimary}>
              {primaryCtaText}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {week.map((day) => (
            <div key={day.dayIndex} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{day.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {day.exercisesCount} exercises
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Day {day.dayIndex}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="h-10 flex-1" onClick={handlePrimary}>
          {primaryCtaText}
        </Button>
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href="/train/templates">Change program</Link>
        </Button>
      </div>

      <AlertDialog open={repeatPromptOpen} onOpenChange={setRepeatPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workout already completed today</AlertDialogTitle>
            <AlertDialogDescription>
              You’ve already finished a workout today. It’s usually better to rest and recover — but
              you can repeat this workout again if you feel good. Proceed with caution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Take a rest day</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRepeatPromptOpen(false);
                onConfirmRepeat();
              }}
            >
              Repeat workout (caution)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

