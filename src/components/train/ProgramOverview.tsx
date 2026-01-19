"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";

function getDayNumberForToday(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  // Convert JS day (Sun=0..Sat=6) -> template day (Mon=1..Sun=7)
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d as 1 | 2 | 3 | 4 | 5 | 6;
}

export function ProgramOverview() {
  const { activeProgram, hydrated, clearActiveProgram } = useActiveProgram();

  const today = useMemo(() => getDayNumberForToday(), []);
  const picked = useMemo(() => {
    if (!activeProgram) return null;
    return pickWorkoutDayForWeekday(activeProgram.plan.days, today);
  }, [activeProgram, today]);

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
          Select a template to generate your program snapshot.
        </p>
        <Button asChild className="h-10">
          <Link href="/train/templates">Browse templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Program overview</h1>
          <p className="text-sm text-muted-foreground">{activeProgram.name}</p>
        </div>
        <div className="flex items-center gap-2">
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
            <Button asChild className="h-10 w-full sm:w-auto">
              <Link href="/train/log">Start workout</Link>
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
        <Button asChild className="h-10 flex-1">
          <Link href="/train/log">Start / Resume</Link>
        </Button>
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href="/train/templates">Change program</Link>
        </Button>
      </div>
    </div>
  );
}

