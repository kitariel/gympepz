"use client";

import Link from "next/link";
import { Check, Clock, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import type { HistoryListViewProps, HistoryListItemVM } from "./HistoryList.types";

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
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete action background */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-destructive transition-opacity",
          showDeleteIndicator ? "opacity-100" : "opacity-0"
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
        <Card elevation="subtle">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  item.statusText === "Completed"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
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
                  <p className="truncate text-sm font-medium">{item.programName}</p>
                  {item.dayLabel ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {item.dayLabel}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-xs">
                  {item.dateText} · {item.exercisesCount} exercises · {item.setsCount} sets
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 text-[10px]",
                item.statusText === "Completed" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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
        <div className="bg-muted h-24 animate-pulse rounded-xl" />
        <div className="bg-muted h-24 animate-pulse rounded-xl" />
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

        <Card elevation="subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">No sessions yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Finish a workout and it'll show up here.
            </p>
            <Button asChild className="touch-target h-10">
              <Link href={props.goToTrainHref}>Go to Train</Link>
            </Button>
          </CardContent>
        </Card>

        <Button asChild variant="outline" className="h-10">
          <Link href={props.backHref}>Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground text-sm">
            Swipe left to delete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{props.sessionsText}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onClear}
            disabled={props.clearDisabled}
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* Time-based groups */}
      <div className="space-y-6">
        {props.timeGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <h2 className="text-sm font-semibold">{group.label}</h2>
            <div className="space-y-2">
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
