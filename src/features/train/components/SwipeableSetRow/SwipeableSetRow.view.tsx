"use client";

import { Check, Trash2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import type { SwipeableSetRowProps } from "./SwipeableSetRow.types";

export function SwipeableSetRow({
  setNumber,
  repsValue,
  repsPlaceholder,
  weightValue,
  weightPlaceholder,
  completed,
  onUpdateReps,
  onUpdateWeight,
  onToggleComplete,
  onSwipeComplete,
  onSwipeDelete,
}: SwipeableSetRowProps) {
  const { offset, isSwiping, direction, handlers } = useSwipeGesture({
    onSwipeRight: () => {
      onToggleComplete(true);
      onSwipeComplete?.();
    },
    onSwipeLeft: onSwipeDelete,
    threshold: 60,
    maxSwipeDistance: 100,
  });

  const showCompleteIndicator = direction === "right" && Math.abs(offset) > 30;
  const showDeleteIndicator = direction === "left" && Math.abs(offset) > 30;

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe action backgrounds */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-28 items-center justify-center bg-emerald-500 transition-opacity",
          showCompleteIndicator ? "opacity-100" : "opacity-0"
        )}
      >
        <Check className="h-6 w-6 text-white" />
      </div>
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-28 items-center justify-center bg-destructive transition-opacity",
          showDeleteIndicator ? "opacity-100" : "opacity-0"
        )}
      >
        <Trash2 className="h-6 w-6 text-white" />
      </div>

      {/* Main row content */}
      <div
        {...handlers}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease-out",
        }}
        className={cn(
          "relative flex touch-pan-y items-center gap-3 rounded-md px-2 py-2 sm:gap-4",
          completed
            // bg-emerald-200/70 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-200
            ? "bg-emerald-200/70 ring-1 ring-emerald-500/30 dark:bg-emerald-500/15 dark:ring-emerald-400/40"
            : "bg-gradient-to-r from-muted/20 via-transparent to-muted/10 dark:from-white/5 dark:to-white/10"
        )}
      >
        {/* Set number */}
        <div className="flex items-center justify-center">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
              completed
                ? "bg-emerald-500 text-white shadow-sm dark:bg-emerald-400 dark:text-emerald-950"
                : "bg-muted text-muted-foreground dark:bg-white/10 dark:text-white/70"
            )}
          >
            {setNumber}
          </span>
        </div>

        {/* Inputs */}
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-baseline gap-2">
            <Input
              type="text"
              inputMode="numeric"
              value={repsValue}
              placeholder={repsPlaceholder}
              onChange={(e) => onUpdateReps(e.target.value)}
              data-testid="set-reps"
              className="h-8 w-full min-w-0 border-0 bg-transparent p-0 px-2 text-lg font-semibold shadow-none focus-visible:ring-0 dark:text-white sm:w-24"
              disabled={completed}
            />
            <span className="text-muted-foreground text-sm dark:text-white/60">reps</span>
          </div>

          <div className="flex items-baseline gap-2">
            <Input
              type="text"
              inputMode="decimal"
              value={weightValue}
              placeholder={weightPlaceholder}
              onChange={(e) =>
                onUpdateWeight(e.target.value.trim() ? e.target.value : null)
              }
              data-testid="set-weight"
              className="h-8 w-full min-w-0 border-0 bg-transparent p-0 px-2 text-lg font-semibold shadow-none focus-visible:ring-0 dark:text-white sm:w-28"
              disabled={completed}
            />
            <span className="text-muted-foreground text-sm dark:text-white/60">weight</span>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-center justify-center">
          <Checkbox
            checked={completed}
            onCheckedChange={(v) => onToggleComplete(Boolean(v))}
            data-testid="set-complete"
            className={cn(
              "h-6 w-6 rounded-md",
              completed &&
              "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-400"
            )}
          />
        </div>
      </div>
    </div>
  );
}
