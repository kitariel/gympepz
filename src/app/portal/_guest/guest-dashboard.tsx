"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { GuestModeBanner } from "@/app/portal/_guest/guest-mode-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createSampleWeeklyPlanSnapshot,
  getWeekId,
  readWeeklyPlanSnapshot,
  writeWeeklyPlanSnapshot,
} from "@/lib/guest/storage";
import type { WeeklyPlanSnapshot } from "@/lib/guest/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function dayIndex(dayLabel: string | null) {
  if (!dayLabel) return 999;
  const idx = DAY_NAMES.indexOf(dayLabel as (typeof DAY_NAMES)[number]);
  return idx === -1 ? 999 : idx;
}

export function GuestDashboard() {
  const [snapshot, setSnapshot] = useState<WeeklyPlanSnapshot | null>(null);

  const todayLabel = DAY_NAMES[new Date().getDay()] ?? null;

  useEffect(() => {
    setSnapshot(readWeeklyPlanSnapshot());
  }, []);

  const todaysDay = useMemo(() => {
    if (!snapshot || !todayLabel) return null;
    return snapshot.days.find((d) => d.dayLabel === todayLabel) ?? null;
  }, [snapshot, todayLabel]);

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Try the full flow: plan → train → track → review.
          </p>
        </div>
        <GuestModeBanner />
      </div>

      {!snapshot ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Start with a sample plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Get a feel for training structure and real-time logging in seconds.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  const sample = createSampleWeeklyPlanSnapshot(getWeekId());
                  writeWeeklyPlanSnapshot(sample);
                  setSnapshot(sample);
                }}
              >
                Start a sample workout
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Save your progress</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="h-9">
                <Link href="/portal/train">Start training (home-first)</Link>
              </Button>
              <Button asChild variant="outline" className="h-9">
                <Link href="/login">Unlock AI planning</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">This Week</p>
              <p className="text-xs text-muted-foreground">
                Sample plan for this session • Read-only
              </p>
            </div>
            <Button asChild className="h-9">
              <Link href="/portal/train/log">
                {todaysDay && !todaysDay.isRestDay ? "Log today’s workout" : "Start workout"}
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {snapshot.days
              .slice()
              .sort((a, b) => {
                return dayIndex(a.dayLabel) - dayIndex(b.dayLabel);
              })
              .map((day) => {
                const isToday = day.dayLabel === todayLabel;
                const items = day.items.slice().sort((x, y) => x.order - y.order);
                return (
                  <Card key={`${day.dayLabel ?? day.title}`} className="border-0 shadow-sm">
                    <CardHeader className="px-4 pt-4 pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-base">
                            {day.title}
                          </CardTitle>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {day.dayLabel ?? "—"}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isToday ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Today
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 px-4 pb-4">
                      {day.isRestDay ? (
                        <p className="text-sm text-muted-foreground">Rest day</p>
                      ) : items.length ? (
                        <ul className="space-y-1">
                          {items.map((it) => (
                            <li
                              key={`${day.title}-${it.exerciseId}-${it.order}`}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="truncate">{it.name}</span>
                              <span className="text-muted-foreground shrink-0 text-xs">
                                {it.sets}×{it.reps}
                                {it.weight != null ? ` @ ${it.weight}` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No exercises</p>
                      )}

                      {isToday && !day.isRestDay ? (
                        <Button asChild size="sm" className="h-9 w-full">
                          <Link href="/portal/train/log">Open today</Link>
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-sm">AI planning (preview)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                <p className="text-sm text-muted-foreground">
                  Generate a personalized plan based on your goal and training level.
                </p>
                <Button asChild size="sm" className="h-9 w-full">
                  <Link href="/login">Unlock AI planning</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-sm">Progress analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                <p className="text-sm text-muted-foreground">
                  See strength and performance trends when workouts are saved.
                </p>
                <Button asChild variant="outline" size="sm" className="h-9 w-full">
                  <Link href="/portal/train/history">View history</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-sm">Gym discovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                <p className="text-sm text-muted-foreground">
                  Browse nearby gyms. Save favorites with an account.
                </p>
                <Button asChild variant="outline" size="sm" className="h-9 w-full">
                  <Link href="/portal/train/templates">Browse templates</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

