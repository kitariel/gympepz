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
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dumbbell,
  Plus,
  Move,
  Check,
  Pencil,
  Save,
} from "lucide-react";
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
  onUpdateItem: (id: string, field: "sets" | "reps" | "weight", value: number) => void;
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

  // Drag and drop sensors for exercises
  const exerciseSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedItems = [...(day.items ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  const totalSets = day.items?.reduce(
    (sum, item) => sum + (item.sets ?? 0),
    0,
  ) ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[95vh] w-full flex-col overflow-y-auto p-0 sm:max-h-[92vh] md:max-h-[85vh]"
      >
        <SheetHeader className="bg-gradient-to-b from-muted/40 via-muted/20 to-background sticky top-0 z-10 border-b border-border/50 px-6 pt-7 pb-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              {editingDayId === day.id ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                    className="h-12 flex-1 text-lg font-bold border-2 focus:border-primary rounded-xl shadow-sm transition-all"
                    autoFocus
                    placeholder="Enter day title..."
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="h-12 gap-2 px-6 font-semibold shadow-lg shadow-primary/20 rounded-xl"
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
                    <SheetTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {day.title}
                    </SheetTitle>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 shadow-sm">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <span className="font-extrabold text-primary text-sm">
                          {day.items?.length ?? 0}
                        </span>
                        <span className="text-sm text-foreground/70 font-semibold">
                          {day.items?.length === 1 ? "exercise" : "exercises"}
                        </span>
                      </div>
                      {totalSets > 0 && (
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-muted/60 backdrop-blur-sm shadow-sm">
                          <span className="font-extrabold text-foreground text-sm">
                            {totalSets}
                          </span>
                          <span className="text-sm text-muted-foreground font-semibold">
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
                className="h-12 w-12 shrink-0 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all shadow-sm"
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
                className="group h-14 flex-1 gap-3 font-bold text-base shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 rounded-xl transition-all hover:scale-[1.02]"
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
              <DndContext
                sensors={exerciseSensors}
                collisionDetection={closestCenter}
                onDragStart={() => {}}
                onDragEnd={(e) => onExerciseDragEnd(e, day.id)}
              >
                <SortableContext
                  items={sortedItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {sortedItems.map((item, itemIndex) => (
                      <SortableExerciseItem
                        key={item.id}
                        id={item.id}
                        item={item}
                        itemIndex={itemIndex}
                        onDeleteItem={onDeleteItem}
                        onUpdateItem={onUpdateItem}
                        onRefetch={onRefetch}
                        isDraggingState={isDragging}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
            <Card className="border-2 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-muted/80 to-muted/60 shadow-xl">
                    <Dumbbell className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="mb-3 text-2xl font-extrabold tracking-tight">
                  No exercises added yet
                </h3>
                <p className="text-muted-foreground mb-10 text-base max-w-md leading-relaxed">
                  Start building your workout by adding exercises to this day.
                  You can set sets, reps, and weight for each exercise.
                </p>
                <Button
                  size="lg"
                  onClick={onAddExercise}
                  className="group h-14 gap-3 px-8 font-bold text-base shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 rounded-xl transition-all hover:scale-105"
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

