/**
 * Sortable exercise item component with drag and drop support
 */

import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2 } from "lucide-react";
import type { PlanExercise } from "../_types";
import { cn } from "@/lib/utils";

interface SortableExerciseItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  item: PlanExercise;
  itemIndex: number;
  onDeleteItem: (id: string) => void;
}

export const SortableExerciseItem = forwardRef<
  HTMLDivElement,
  SortableExerciseItemProps
>(({ item, itemIndex, onDeleteItem, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-card text-card-foreground relative flex items-center gap-3 rounded-lg border p-3 shadow-sm",
        "data-[dragging]:relative data-[dragging]:z-50 data-[dragging]:shadow-xl",
        className,
      )}
      {...props}
    >
      <div className="text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="from-primary/20 to-primary/10 text-primary border-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br text-sm font-extrabold">
              {itemIndex + 1}
            </div>
            <h4 className="truncate text-sm font-medium">
              {item.exercise?.name ?? item.exerciseId}
            </h4>
            {item.exercise?.muscleGroup && (
              <Badge
                variant="outline"
                className="border-primary/30 shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
              >
                {item.exercise.muscleGroup}
              </Badge>
            )}
            <span className="text-muted-foreground shrink-0 text-xs">
              {item.sets} sets × {item.reps} reps
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/15 h-8 w-8 shrink-0 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
SortableExerciseItem.displayName = "SortableExerciseItem";
