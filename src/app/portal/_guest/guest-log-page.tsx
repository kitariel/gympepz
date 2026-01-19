"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { GuestModeBanner } from "@/app/portal/_guest/guest-mode-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearOfflineWorkoutLogQueue, readOfflineWorkoutLogQueue } from "@/lib/guest/storage";
import type { OfflineWorkoutLog } from "@/lib/guest/types";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

export function GuestLogPage() {
  const [logs, setLogs] = useState<OfflineWorkoutLog[]>([]);

  useEffect(() => {
    const queue = readOfflineWorkoutLogQueue();
    setLogs(queue.logs);
  }, []);

  const summary = useMemo(() => {
    const total = logs.length;
    const completed = logs.filter((l) => l.completed).length;
    const pendingSync = logs.filter((l) => !l.synced).length;
    return { total, completed, pendingSync };
  }, [logs]);

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout Logs</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Your session history (clears when the session ends).
          </p>
        </div>
        <GuestModeBanner />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{summary.total} workouts</Badge>
        <Badge variant="secondary">{summary.completed} completed</Badge>
        <Badge variant="secondary">Analytics preview</Badge>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => {
            clearOfflineWorkoutLogQueue();
            setLogs([]);
          }}
        >
          Clear session
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm">Progress analytics (preview)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            GymPepz tracks strength, performance, volume, and consistency when your workouts are saved.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Consistency</p>
              <p className="text-lg font-semibold">4 workouts/wk</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">Volume trend</p>
              <p className="text-lg font-semibold">↑ steady</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-xs text-muted-foreground">PR tracking</p>
              <p className="text-lg font-semibold">Auto-detected</p>
            </div>
          </div>
          <Button asChild size="sm" className="h-9 w-full sm:w-auto">
            <Link href="/login">Save your progress to start tracking</Link>
          </Button>
        </CardContent>
      </Card>

      {logs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">No workouts yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Start a workout and you’ll see a summary and demo analytics here.
            </p>
            <Button asChild className="h-9">
              <Link href="/train/log">Start workout</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {logs.map((log) => {
            const setsCount = log.sets.length;
            const exercisesCount = new Set(log.sets.map((s) => s.exerciseId)).size;
            return (
              <Card key={log.clientLogId} className="border-0 shadow-sm">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {formatDate(log.date)}
                      </p>
                      {log.completed ? (
                        <Badge variant="success" className="text-[10px]">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          In progress
                        </Badge>
                      )}
                      {!log.synced ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Local
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Synced
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {exercisesCount} exercises • {setsCount} sets
                    </p>
                  </div>
                  {/* TODO: add a detail view + sync action after login */}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

