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
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe action backgrounds */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-24 items-center justify-center bg-emerald-500 transition-opacity",
          showCompleteIndicator ? "opacity-100" : "opacity-0"
        )}
      >
        <Check className="h-6 w-6 text-white" />
      </div>
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-destructive transition-opacity",
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
          "bg-card relative grid touch-pan-y grid-cols-12 items-center gap-3 rounded-xl border p-3",
          completed && "bg-muted/50 opacity-75"
        )}
      >
        {/* Set number */}
        <div className="col-span-2 flex items-center justify-center">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
              completed
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {setNumber}
          </span>
        </div>

        {/* Reps input */}
        <div className="col-span-4">
          <Input
            type="text"
            inputMode="numeric"
            value={repsValue}
            placeholder={repsPlaceholder}
            onChange={(e) => onUpdateReps(e.target.value)}
            className="touch-target h-12 text-center text-base"
            disabled={completed}
          />
          <span className="text-muted-foreground mt-1 block text-center text-[10px]">
            reps
          </span>
        </div>

        {/* Weight input */}
        <div className="col-span-4">
          <Input
            type="text"
            inputMode="decimal"
            value={weightValue}
            placeholder={weightPlaceholder}
            onChange={(e) =>
              onUpdateWeight(e.target.value.trim() ? e.target.value : null)
            }
            className="touch-target h-12 text-center text-base"
            disabled={completed}
          />
          <span className="text-muted-foreground mt-1 block text-center text-[10px]">
            weight
          </span>
        </div>

        {/* Checkbox */}
        <div className="col-span-2 flex items-center justify-center">
          <Checkbox
            checked={completed}
            onCheckedChange={(v) => onToggleComplete(Boolean(v))}
            className="h-6 w-6"
          />
        </div>
      </div>
    </div>
  );
}
