/**
 * Exercise sheet/drawer component for viewing and editing day exercises
 */

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sortable,
  SortableContent,
  SortableItem,
  type DragEndEvent,
} from "@/components/ui/sortable";
import { Dumbbell, Plus, Move, Check, Pencil, Save } from "lucide-react";
import { SortableExerciseItem } from "./sortable-exercise-item";
import { ExerciseCard } from "./exercise-card";
import type { PlanDay } from "../_types";

interface ExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: PlanDay;
  editingDayId: string | null;
  editingDayTitle: string;
  onEditingDayTitleChange: (title: string) => void;
  onStartEdit: (dayId: string, currentTitle: string) => void;
  onSaveDayTitle: (dayId: string, title: string) => void;
  onCancelEdit: () => void;
  onAddExercise: () => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (
    id: string,
    field: "sets" | "reps" | "weight",
    value: number,
  ) => void;
  onRefetch: () => void;
  onExerciseDragEnd: (event: DragEndEvent, dayId: string) => void;
  isUpdatingDay: boolean;
}

export function ExerciseSheet({
  open,
  onOpenChange,
  day,
  editingDayId,
  editingDayTitle,
  onEditingDayTitleChange,
  onStartEdit,
  onSaveDayTitle,
  onCancelEdit,
  onAddExercise,
  onDeleteItem,
  onUpdateItem,
  onRefetch,
  onExerciseDragEnd,
  isUpdatingDay,
}: ExerciseSheetProps) {
  const [isDragging, setIsDragging] = useState(false);

  const sortedItems = [...(day.items ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const totalSets =
    day.items?.reduce((sum, item) => sum + (item.sets ?? 0), 0) ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[95vh] w-full flex-col overflow-y-auto p-0 sm:max-h-[92vh] md:max-h-[85vh]"
      >
        <SheetHeader className="from-muted/40 via-muted/20 to-background border-border/50 sticky top-0 z-10 border-b bg-gradient-to-b px-6 pt-7 pb-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              {editingDayId === day.id ? (
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <Input
                    value={editingDayTitle}
                    onChange={(e) => onEditingDayTitleChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingDayTitle.trim()) {
                        void onSaveDayTitle(day.id, editingDayTitle);
                      } else if (e.key === "Escape") {
                        onCancelEdit();
                      }
                    }}
                    className="focus:border-primary h-12 flex-1 rounded-xl border-2 text-lg font-bold shadow-sm transition-all"
                    autoFocus
                    placeholder="Enter day title..."
                  />
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      className="shadow-primary/20 h-12 gap-2 rounded-xl px-6 font-semibold shadow-lg"
                      onClick={() => onSaveDayTitle(day.id, editingDayTitle)}
                      disabled={isUpdatingDay || !editingDayTitle.trim()}
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 shrink-0 rounded-xl"
                      onClick={onCancelEdit}
                    >
                      <span className="text-2xl leading-none">×</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <SheetTitle className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl leading-tight font-extrabold tracking-tight text-transparent sm:text-4xl">
                      {day.title}
                    </SheetTitle>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="from-primary/15 to-primary/5 border-primary/20 flex items-center gap-2.5 rounded-full border bg-gradient-to-r px-4 py-2 shadow-sm">
                        <Dumbbell className="text-primary h-4 w-4" />
                        <span className="text-primary text-sm font-extrabold">
                          {day.items?.length ?? 0}
                        </span>
                        <span className="text-foreground/70 text-sm font-semibold">
                          {day.items?.length === 1 ? "exercise" : "exercises"}
                        </span>
                      </div>
                      {totalSets > 0 && (
                        <div className="bg-muted/60 flex items-center gap-2.5 rounded-full px-4 py-2 shadow-sm backdrop-blur-sm">
                          <span className="text-foreground text-sm font-extrabold">
                            {totalSets}
                          </span>
                          <span className="text-muted-foreground text-sm font-semibold">
                            total sets
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {editingDayId !== day.id && (
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-primary/5 hover:border-primary/50 h-12 w-12 shrink-0 rounded-xl shadow-sm transition-all"
                onClick={() => onStartEdit(day.id, day.title)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 pt-7 pb-8">
          {/* Arrange Mode Toggle Button */}
          <div className="flex items-center gap-3">
            <Button
              variant={isDragging ? "default" : "outline"}
              onClick={() => setIsDragging(!isDragging)}
              className="h-14 gap-2 font-semibold"
            >
              {isDragging ? (
                <>
                  <Check className="h-4 w-4" />
                  Done Arranging
                </>
              ) : (
                <>
                  <Move className="h-4 w-4" />
                  Arrange Exercises
                </>
              )}
            </Button>
            {!isDragging && (
              <Button
                className="group shadow-primary/30 hover:shadow-primary/40 h-14 flex-1 gap-3 rounded-xl text-base font-bold shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl"
                onClick={onAddExercise}
              >
                <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                Add Exercise to Workout
              </Button>
            )}
          </div>

          {/* Exercise List */}
          {sortedItems.length > 0 ? (
            isDragging ? (
              <Sortable
                value={sortedItems}
                onDragEnd={(e) => onExerciseDragEnd(e, day.id)}
                getItemValue={(item) => item.id}
                orientation="vertical"
              >
                <div className="flex flex-col gap-2">
                  <SortableContent>
                    {sortedItems.map((item, itemIndex) => (
                      <SortableItem
                        key={item.id}
                        value={item.id}
                        asChild
                        asHandle
                        className="mb-2"
                      >
                        <SortableExerciseItem
                          item={item}
                          itemIndex={itemIndex}
                          onDeleteItem={onDeleteItem}
                        />
                      </SortableItem>
                    ))}
                  </SortableContent>
                </div>
              </Sortable>
            ) : (
              <div className="space-y-4">
                {sortedItems.map((item, itemIndex) => (
                  <ExerciseCard
                    key={item.id}
                    item={item}
                    itemIndex={itemIndex}
                    onDeleteItem={onDeleteItem}
                    onUpdateItem={onUpdateItem}
                    onRefetch={onRefetch}
                  />
                ))}
              </div>
            )
          ) : (
            <Card className="from-muted/30 to-muted/10 overflow-hidden rounded-2xl border-2 bg-gradient-to-br backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="relative mb-8">
                  <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-2xl" />
                  <div className="from-muted/80 to-muted/60 relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br shadow-xl">
                    <Dumbbell className="text-muted-foreground h-12 w-12" />
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-extrabold tracking-tight">
                  No exercises added yet
                </h3>
                <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed">
                  Start building your workout by adding exercises to this day.
                  You can set sets, reps, and weight for each exercise.
                </p>
                <Button
                  size="lg"
                  onClick={onAddExercise}
                  className="group shadow-primary/30 hover:shadow-primary/40 h-14 gap-3 rounded-xl px-8 text-base font-bold shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Add Your First Exercise
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
