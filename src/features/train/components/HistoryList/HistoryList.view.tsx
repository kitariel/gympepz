"use client";

import Link from "next/link";
import { Check, Clock, Trash2, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import type {
  HistoryListViewProps,
  HistoryListItemVM,
} from "./HistoryList.types";

function SwipeableHistoryItem({
  item,
  onDelete,
}: {
  item: HistoryListItemVM;
  onDelete: () => void;
}) {
  const { offset, isSwiping, direction, handlers } = useSwipeGesture({
    onSwipeLeft: onDelete,
    threshold: 80,
    maxSwipeDistance: 100,
  });

  const showDeleteIndicator = direction === "left" && Math.abs(offset) > 40;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl ring-1 ring-border/60 transition-shadow hover:shadow-lg"
      data-testid="history-item"
    >
      {/* Delete action background */}
      <div
        className={cn(
          "bg-destructive absolute inset-y-0 right-0 flex w-28 items-center justify-center transition-opacity",
          showDeleteIndicator ? "opacity-100" : "opacity-0",
        )}
      >
        <Trash2 className="h-5 w-5 text-white" />
      </div>

      {/* Card content */}
      <div
        {...handlers}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease-out",
        }}
        className="touch-pan-y"
      >
        <Card elevation="subtle" className="border-0 bg-card/90">
          <CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  item.statusText === "Completed"
                    ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground ring-1 ring-border/60",
                )}
              >
                {item.statusText === "Completed" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">
                    {item.programName}
                  </p>
                  {item.dayLabel ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {item.dayLabel}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-xs">
                  {item.dateText} · {item.exercisesCount} exercises ·{" "}
                  {item.setsCount} sets
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide",
                item.statusText === "Completed" &&
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {item.statusText}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function HistoryListView(props: HistoryListViewProps) {
  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
        <div className="bg-muted h-8 w-32 animate-pulse rounded-lg" />
        <div className="bg-muted h-24 animate-pulse rounded-2xl" />
        <div className="bg-muted h-24 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (props.kind === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-4">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{props.title}</h1>
            <p className="text-muted-foreground">{props.message}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="touch-target h-12 flex-1"
            onClick={props.onRetry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            className="touch-target h-12 flex-1"
            onClick={props.onGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (props.kind === "empty") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">History</h1>
            <p className="text-muted-foreground text-sm">
              Your workout history
            </p>
          </div>
          <Badge variant="secondary">{props.sessionsText}</Badge>
        </div>

        <Card
          elevation="subtle"
          className="border-0 py-4 bg-gradient-to-br from-card/95 via-card/90 to-card/80 ring-1 ring-border/60"
        >
          <CardHeader className="pb-2">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">No sessions yet</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Start a workout to build your history.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why it&apos;s useful
                </p>
                <p className="text-sm">Track progress, PRs, and consistency.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick start
                </p>
                <p className="text-sm">Pick a plan or log a simple workout.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="touch-target h-10 flex-1">
                <Link href={props.goToTrainHref}>Start a workout</Link>
              </Button>
              <Button asChild variant="outline" className="touch-target h-10 flex-1">
                <Link href={props.backHref}>Back</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground text-sm">Swipe left to delete</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{props.sessionsText}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onClear}
            disabled={props.clearDisabled}
            data-testid="history-clear"
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* Time-based groups */}
      <div className="space-y-7">
        {props.timeGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">{group.label}</h2>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <SwipeableHistoryItem
                  key={item.id}
                  item={item}
                  onDelete={() => props.onDeleteItem(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Back button */}
      <Button asChild variant="outline" className="h-10">
        <Link href={props.backHref}>Back</Link>
      </Button>
    </div>
  );
}
