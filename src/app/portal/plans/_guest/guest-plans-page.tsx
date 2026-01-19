"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { GuestModeBanner } from "@/app/portal/_guest/guest-mode-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createSampleWeeklyPlanSnapshot,
  getWeekId,
  readWeeklyPlanSnapshot,
  writeWeeklyPlanSnapshot,
} from "@/lib/guest/storage";
import type { WeeklyPlanSnapshot } from "@/lib/guest/types";

export function GuestPlansPage() {
  const [snapshot, setSnapshot] = useState<WeeklyPlanSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(readWeeklyPlanSnapshot());
  }, []);

  const days = useMemo(() => snapshot?.days ?? [], [snapshot?.days]);

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">This Week</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Guest mode is read-only for plans.
          </p>
        </div>
        <GuestModeBanner />
      </div>

      {!snapshot ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">No weekly plan cached</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Login to generate/edit plans, or use a sample plan offline.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  const sample = createSampleWeeklyPlanSnapshot(getWeekId());
                  writeWeeklyPlanSnapshot(sample);
                  setSnapshot(sample);
                }}
              >
                Continue with a sample plan
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Login to edit plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {days.map((day) => (
            <Card key={`${day.dayLabel ?? day.title}`} className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{day.title}</CardTitle>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {day.dayLabel ?? "—"}
                    </p>
                  </div>
                  {day.isRestDay ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Rest
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                {day.isRestDay ? (
                  <p className="text-sm text-muted-foreground">Rest day</p>
                ) : day.items.length ? (
                  <ul className="space-y-1">
                    {day.items
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((it) => (
                        <li key={`${it.exerciseId}-${it.order}`} className="flex justify-between gap-3 text-sm">
                          <span className="truncate">{it.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {it.sets}×{it.reps}
                          </span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No exercises</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

