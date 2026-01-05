/**
 * Non-sortable exercise card component (for non-dragging state)
 */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import type { PlanExercise } from "../_types";

interface ExerciseCardProps {
  item: PlanExercise;
  itemIndex: number;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, field: "sets" | "reps" | "weight", value: number) => void;
  onRefetch: () => void;
}

export function ExerciseCard({
  item,
  itemIndex,
  onDeleteItem,
  onUpdateItem,
  onRefetch,
}: ExerciseCardProps) {
  return (
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
                onUpdateItem(item.id, "weight", Number(e.target.value))
              }
              onBlur={onRefetch}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

