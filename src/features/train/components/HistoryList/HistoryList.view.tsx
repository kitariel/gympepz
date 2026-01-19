"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoryListViewProps } from "./HistoryList.types";

export function HistoryListView(props: HistoryListViewProps) {
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
          <Badge variant="secondary">{props.kind === "loading" ? "…" : props.sessionsText}</Badge>
          <Button
            variant="outline"
            className="h-9"
            onClick={props.kind === "loading" ? undefined : props.onClear}
            disabled={props.kind === "loading" ? true : props.clearDisabled}
          >
            Clear
          </Button>
        </div>
      </div>

      {props.kind === "loading" ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : props.kind === "empty" ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">No sessions yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">Finish a workout and it’ll show up here.</p>
            <Button asChild className="h-10 w-full sm:w-auto">
              <Link href={props.goToTrainHref}>Go to Train</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {props.groups.map((group) => (
            <div key={group.programName} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{group.programName}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {group.sessionsCount} sessions
                </Badge>
              </div>
              <div className="grid gap-3">
                {group.items.map((h) => (
                  <Card key={h.id} className="border-0 shadow-sm">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{h.dateText}</p>
                          {h.dayLabel ? (
                            <Badge variant="outline" className="text-[10px]">
                              {h.dayLabel}
                            </Badge>
                          ) : null}
                          <Badge variant="secondary" className="text-[10px]">
                            {h.statusText}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {h.exercisesCount} exercises • {h.setsCount} sets
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {props.kind === "loading" ? null : (
        <Button asChild variant="outline" className="h-10 w-full sm:w-auto">
          <Link href={props.backHref}>Back</Link>
        </Button>
      )}
    </div>
  );
}

