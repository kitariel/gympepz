/**
 * Sortable exercise item component with drag and drop support
 */

import { useSortable } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2 } from "lucide-react";
import type { PlanExercise } from "../_types";

interface SortableExerciseItemProps {
  id: string;
  item: PlanExercise;
  itemIndex: number;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, field: "sets" | "reps" | "weight", value: number) => void;
  onRefetch: () => void;
  isDraggingState: boolean;
}

export function SortableExerciseItem({
  id,
  item,
  itemIndex,
  onDeleteItem,
  onUpdateItem,
  onRefetch,
  isDraggingState,
}: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { active } = useDndContext();
  const isAnyDragging = !!active || isDraggingState;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isAnyDragging ? transition : "all 0.3s ease-in-out",
    opacity: isDragging ? 0.5 : 1,
  };

  // Show collapsed view only when in arrange mode
  if (isDraggingState) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative transition-all duration-300 cursor-grab active:cursor-grabbing"
      >
        <div className="absolute left-0 top-0 z-10 flex h-full items-center justify-center px-2 text-muted-foreground pointer-events-none">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="pl-8 transition-all duration-300">
          <Card className="group relative border-2 shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/40 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-xl overflow-hidden">
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-extrabold text-primary border border-primary/20">
                    {itemIndex + 1}
                  </div>
                  <h4 className="text-base font-extrabold leading-tight tracking-tight truncate">
                    {item.exercise?.name ?? item.exerciseId}
                  </h4>
                  {item.exercise?.muscleGroup && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 font-semibold border-primary/30 rounded-full shrink-0"
                    >
                      {item.exercise.muscleGroup}
                    </Badge>
                  )}
                  <span className="text-muted-foreground text-xs shrink-0">
                    {item.sets} sets × {item.reps} reps
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/15 rounded-lg"
                  onClick={() => onDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Full expanded view when not dragging
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative transition-all duration-300 cursor-grab active:cursor-grabbing"
    >
      <div className="absolute left-0 top-0 z-10 flex h-full items-center justify-center px-2 text-muted-foreground pointer-events-none">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="pl-8 transition-all duration-300">
        <Card className="group relative border-2 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/40 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <CardContent className="relative p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-base font-extrabold text-primary border border-primary/20 shadow-sm">
                    {itemIndex + 1}
                  </div>
                  <h4 className="text-xl font-extrabold leading-tight tracking-tight">
                    {item.exercise?.name ?? item.exerciseId}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2.5 pl-[52px]">
                  {item.exercise?.muscleGroup && (
                    <Badge
                      variant="outline"
                      className="text-xs px-3.5 py-1.5 font-semibold border-2 border-primary/30 rounded-full"
                    >
                      {item.exercise.muscleGroup}
                    </Badge>
                  )}
                  {item.exercise?.equipment && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-3.5 py-1.5 font-semibold rounded-full"
                    >
                      {item.exercise.equipment}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/15 rounded-xl"
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-5 border-t-2 border-border/50">
              <div className="space-y-2.5">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  Sets
                </label>
                <Input
                  type="number"
                  min="1"
                  className="h-14 text-xl font-extrabold text-center border-2 focus:border-primary rounded-xl shadow-sm transition-all focus:shadow-lg focus:shadow-primary/20"
                  value={item.sets ?? 3}
                  onChange={(e) =>
                    onUpdateItem(item.id, "sets", Number(e.target.value))
                  }
                  onBlur={onRefetch}
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  Reps
                </label>
                <Input
                  type="number"
                  min="1"
                  className="h-14 text-xl font-extrabold text-center border-2 focus:border-primary rounded-xl shadow-sm transition-all focus:shadow-lg focus:shadow-primary/20"
                  value={item.reps ?? 10}
                  onChange={(e) =>
                    onUpdateItem(item.id, "reps", Number(e.target.value))
                  }
                  onBlur={onRefetch}
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  className="h-14 text-xl font-extrabold text-center border-2 focus:border-primary rounded-xl shadow-sm transition-all focus:shadow-lg focus:shadow-primary/20"
                  value={item.weight ?? ""}
                  placeholder="0"
                  onChange={(e) =>
                    onUpdateItem(
                      item.id,
                      "weight",
                      Number(e.target.value),
                    )
                  }
                  onBlur={onRefetch}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

