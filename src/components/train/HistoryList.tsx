"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function HistoryList() {
  const { history, hydrated, clearHistory, summary } = useWorkoutDraft();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Offline workout history stored on this device.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{summary.total} sessions</Badge>
          <Button
            variant="outline"
            className="h-9"
            onClick={() => clearHistory()}
            disabled={!hydrated || history.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : history.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">No sessions yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Finish a workout and it’ll show up here.
            </p>
            <Button asChild className="h-10 w-full sm:w-auto">
              <Link href="/train">Go to Train</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {history.map((h) => {
            const exercisesCount = new Set(h.sets.map((s) => s.exerciseName)).size;
            return (
              <Card key={h.id} className="border-0 shadow-sm">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {formatDate(h.date)}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {h.completed ? "Completed" : "Saved"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {exercisesCount} exercises • {h.sets.length} sets
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{h.programName}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Button asChild variant="outline" className="h-10 w-full sm:w-auto">
        <Link href="/train">Back</Link>
      </Button>
    </div>
  );
}

