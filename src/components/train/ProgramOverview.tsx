"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";

function getDayNumberForToday(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  // Convert JS day (Sun=0..Sat=6) -> template day (Mon=1..Sun=7)
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d as 1 | 2 | 3 | 4 | 5 | 6;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ProgramOverview() {
  const router = useRouter();
  const { activeProgram, hydrated, clearActiveProgram } = useActiveProgram();
  const { hydrated: prefsHydrated, selectedWorkoutDay, setSelectedWorkoutDay } =
    useTrainPrefs();
  const { hydrated: historyHydrated, history, draft } = useWorkoutDraft();
  const [repeatPromptOpen, setRepeatPromptOpen] = useState(false);

  const today = useMemo(() => getDayNumberForToday(), []);
  const picked = useMemo(() => {
    if (!activeProgram) return null;
    if (selectedWorkoutDay === "auto") {
      return pickWorkoutDayForWeekday(activeProgram.plan.days, today);
    }
    const manual =
      activeProgram.plan.days.find((d) => d.day === selectedWorkoutDay) ?? null;
    if (manual) return { day: manual, isExactMatch: false };
    return pickWorkoutDayForWeekday(activeProgram.plan.days, today);
  }, [activeProgram, today, selectedWorkoutDay]);

  if (!hydrated || !prefsHydrated || !historyHydrated) {
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
          Select a template to generate your program snapshot.
        </p>
        <Button asChild className="h-10">
          <Link href="/train/templates">Browse templates</Link>
        </Button>
      </div>
    );
  }

  const startHref =
    picked?.day != null ? `/train/log?day=${picked.day.day}` : "/train/log";
  const startHrefAuto =
    startHref.includes("?") ? `${startHref}&autostart=1` : `${startHref}?autostart=1`;

  const completedToday = (() => {
    const todayKey = localDateKey(new Date());
    return history.some((h) => {
      if (!h.completed) return false;
      const sameDay = localDateKey(new Date(h.date)) === todayKey;
      if (!sameDay) return false;
      const programId = h.programRef?.id ?? h.templateId;
      return programId === activeProgram.templateId;
    });
  })();

  const handleStart = () => {
    // If there's an active draft, always resume (no prompting).
    if (draft) {
      router.push("/train/log");
      return;
    }
    if (completedToday) {
      setRepeatPromptOpen(true);
      return;
    }
    router.push(startHrefAuto);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Program overview</h1>
          <p className="text-sm text-muted-foreground">{activeProgram.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(selectedWorkoutDay)}
            onValueChange={(v) =>
              setSelectedWorkoutDay(v === "auto" ? "auto" : (Number(v) as 1 | 2 | 3 | 4 | 5 | 6 | 7))
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
          <Button
            variant="outline"
            className="h-9"
            onClick={() => clearActiveProgram()}
          >
            Clear
          </Button>
        </div>
      </div>

      {picked?.day ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base">
                {picked.isExactMatch ? "Today" : "Next workout"}
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                Day {picked.day.day}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm font-medium">{picked.day.label}</p>
            <ul className="space-y-1">
              {picked.day.items
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((it) => (
                  <li
                    key={`${picked.day.label}-${it.order}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">{it.nameFallback ?? "Exercise"}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {it.sets}×{it.reps}
                    </span>
                  </li>
                ))}
            </ul>
            <Button className="h-10 w-full sm:w-auto" onClick={handleStart}>
              {draft ? "Resume workout" : "Start workout"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {activeProgram.plan.days
            .slice()
            .sort((a, b) => a.day - b.day)
            .map((day) => (
              <div key={day.label} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{day.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {day.items.length} exercises
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Day {day.day}
                  </Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="h-10 flex-1" onClick={handleStart}>
          {draft ? "Resume" : "Start workout"}
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
                router.push(startHrefAuto);
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

