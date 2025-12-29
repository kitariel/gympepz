"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  GripVertical,
  Dumbbell,
  Pencil,
  Copy,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
}

interface PlanExercise {
  id: string;
  sets: number;
  reps: number;
  weight: number | null;
  exerciseId: string;
  exercise: Exercise | null;
}

interface PlanDay {
  id: string;
  title: string;
  order: number;
  items: PlanExercise[];
}

interface Plan {
  id: string;
  name: string;
  days: PlanDay[];
}

interface WeeklyScheduleBoardProps {
  localDays: (PlanDay | null)[];
  currentDayOfWeek: number;
  onDragEnd: (event: DragEndEvent) => Promise<void>;
  onAddDay: (slot: number, dayName?: string) => void;
  onEditDay: (dayId: string) => void;
  onSaveDayTitle: (dayId: string) => void;
  onCancelEdit: () => void;
  onDeleteDay: (dayId: string) => void;
  onDuplicateDay: (dayId: string) => void;
  onOpenCopyDialog: (dayId: string) => void;
  onOpenDrawer: (dayId: string) => void;
  editingDayId: string | null;
  editingDayTitle: string;
  onEditingDayTitleChange: (title: string) => void;
  updateDay: { isPending: boolean };
  plan: Plan | null | undefined;
}

// Sortable Day Card Component
function SortableDayCard({
  dayData,
  dayName,
  slotIndex,
  onEditDay,
  onSaveDayTitle,
  onCancelEdit,
  onDeleteDay,
  onDuplicateDay,
  onOpenCopyDialog,
  onOpenDrawer,
  editingDayId,
  editingDayTitle,
  onEditingDayTitleChange,
  updateDay,
  plan,
  isCurrentDay = false,
}: {
  dayData: PlanDay;
  dayName: string;
  slotIndex: number;
  onEditDay: (dayId: string) => void;
  onSaveDayTitle: (dayId: string) => void;
  onCancelEdit: () => void;
  onDeleteDay: (dayId: string) => void;
  onDuplicateDay: (dayId: string) => void;
  onOpenCopyDialog: (dayId: string) => void;
  onOpenDrawer: (dayId: string) => void;
  editingDayId: string | null;
  editingDayTitle: string;
  onEditingDayTitleChange: (title: string) => void;
  updateDay: { isPending: boolean };
  plan: Plan | null | undefined;
  isCurrentDay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dayData.id,
    disabled: false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const totalSets = (dayData.items ?? []).reduce(
    (sum: number, item) => sum + (item.sets ?? 0),
    0,
  );

  // Generate gradient for day card
  const getDayGradient = (dayId: string) => {
    const gradients = [
      "from-orange-500/20 via-amber-500/10 to-yellow-500/5",
      "from-blue-500/20 via-cyan-500/10 to-teal-500/5",
      "from-purple-500/20 via-pink-500/10 to-rose-500/5",
      "from-emerald-500/20 via-teal-500/10 to-cyan-500/5",
      "from-indigo-500/20 via-purple-500/10 to-pink-500/5",
      "from-red-500/20 via-orange-500/10 to-amber-500/5",
      "from-violet-500/20 via-purple-500/10 to-fuchsia-500/5",
    ];
    const hash = dayId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const dayGradient = getDayGradient(dayData.id);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex h-[calc(100vh-280px)] min-h-[520px] max-h-[700px] w-[340px] shrink-0 flex-col border-0 shadow-lg transition-all hover:shadow-xl",
        isDragging && "ring-primary z-50 rotate-1 opacity-60 ring-2 scale-95",
        isCurrentDay && "ring-primary/60 bg-primary/5 ring-2 shadow-xl border-primary/20",
        `bg-gradient-to-br ${dayGradient} backdrop-blur-sm`,
      )}
      onClick={(e) => {
        // Only open drawer if click was not on interactive elements
        const target = e.target as HTMLElement;
        if (
          !target.closest("[data-drag-handle]") &&
          !target.closest("button") &&
          !target.closest('[role="menuitem"]') &&
          !isDragging
        ) {
          onOpenDrawer(dayData.id);
        }
      }}
    >
      <CardHeader className={cn(
        "flex-shrink-0 border-b-2 px-5 py-4 bg-card/50 backdrop-blur-sm",
        isCurrentDay && "bg-primary/10 border-primary/30"
      )}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span
              className={cn(
                "text-muted-foreground/80 text-[11px] font-extrabold tracking-widest uppercase whitespace-nowrap",
                isCurrentDay && "text-primary font-extrabold",
              )}
            >
              {dayName}
            </span>
            {isCurrentDay && (
              <Badge variant="default" className="px-2 py-0.5 text-[10px] bg-primary text-primary-foreground border-0 shrink-0 shadow-sm">
                Today
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div
              {...attributes}
              {...listeners}
              data-drag-handle
              className="hover:bg-muted/70 cursor-grab touch-none rounded-md p-1.5 opacity-0 transition-all group-hover:opacity-100 active:cursor-grabbing active:scale-110"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="text-muted-foreground h-4 w-4" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted"
                >
                  <MoreVertical className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onClick={() => onDuplicateDay(dayData.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenCopyDialog(dayData.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Exercises To...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteDay(dayData.id)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Day
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Day Title - Editable */}
        {editingDayId === dayData.id ? (
          <div className="flex flex-col gap-3 mt-1">
            <Input
              value={editingDayTitle}
              onChange={(e) => onEditingDayTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editingDayTitle.trim()) {
                  onSaveDayTitle(dayData.id);
                } else if (e.key === "Escape") {
                  onCancelEdit();
                }
              }}
              className="h-10 text-sm font-bold border-2 focus:border-primary transition-colors"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 px-3 text-xs font-semibold"
                onClick={() => onSaveDayTitle(dayData.id)}
                disabled={updateDay.isPending ?? !editingDayTitle.trim()}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group/title flex items-start justify-between gap-2 mt-1">
            <CardTitle 
              className="line-clamp-2 text-lg leading-snug font-bold cursor-pointer hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDrawer(dayData.id);
              }}
            >
              {dayData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 transition-all group-hover/title:opacity-100 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onEditDay(dayData.id);
              }}
            >
              <Pencil className="text-muted-foreground h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Stats Badge - Enhanced */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Dumbbell className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold text-foreground">{dayData.items?.length ?? 0}</span>
            <span>exercises</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{totalSets}</span>
            <span>sets</span>
          </div>
        </div>
      </CardHeader>

      {/* Scrollable Exercise List - Enhanced Jira Style */}
      <CardContent className="flex-1 overflow-y-auto px-4 py-4 min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <div className="space-y-3">
          {(dayData.items ?? []).length > 0 ? (
            (dayData.items ?? []).map((item, idx) => (
              <Card
                key={item.id}
                className="group/item cursor-pointer border-2 shadow-sm hover:shadow-lg transition-all hover:border-primary/50 bg-card/90 backdrop-blur-sm hover:bg-card"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDrawer(dayData.id);
                }}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary border border-primary/20">
                          {idx + 1}
                        </div>
                        <h4 className="text-sm font-bold leading-tight line-clamp-2 group-hover/item:text-primary transition-colors">
                          {item.exercise?.name ?? "Exercise"}
                        </h4>
                      </div>
                      {item.exercise?.muscleGroup && (
                        <Badge variant="outline" className="text-[10px] px-2.5 py-1 h-6 w-fit font-medium border-primary/20">
                          {item.exercise.muscleGroup}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium pt-2.5 border-t-2 border-border/50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground font-bold">
                        {item.sets}×{item.reps ?? 0}
                      </span>
                      <span className="text-muted-foreground/60">sets×reps</span>
                    </div>
                    {item.weight && (
                      <>
                        <span className="text-muted-foreground/30">•</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground font-bold">{item.weight}</span>
                          <span className="text-muted-foreground/60">kg</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-muted-foreground/50 flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 mb-4">
                <Dumbbell className="h-8 w-8 opacity-40" />
              </div>
              <span className="text-sm font-medium mb-3">No exercises yet</span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-2 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDrawer(dayData.id);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty Slot Component (Droppable)
function EmptyDaySlot({
  dayName,
  slotIndex,
  onAddDay,
  isCurrentDay = false,
}: {
  dayName: string;
  slotIndex: number;
  onAddDay: (slot: number, dayName?: string) => void;
  isCurrentDay?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotIndex.toString(),
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "group flex h-[calc(100vh-280px)] min-h-[520px] max-h-[700px] w-[340px] shrink-0 cursor-pointer flex-col border-2 border-dashed transition-all hover:shadow-xl",
        "border-muted-foreground/30 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/5 hover:border-primary/60 hover:bg-primary/10 hover:from-primary/10 hover:via-primary/5 hover:to-primary/5",
        isOver && "border-primary bg-primary/20 ring-4 ring-primary/20 shadow-2xl scale-[1.02]",
        isCurrentDay && "border-primary/70 bg-primary/15 ring-2 ring-primary/30",
      )}
      onClick={() => onAddDay(slotIndex, dayName)}
    >
      <CardHeader className={cn(
        "flex-shrink-0 border-b-2 border-dashed px-5 py-4 bg-card/50 backdrop-blur-sm",
        isCurrentDay && "bg-primary/10 border-primary/30"
      )}>
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "text-muted-foreground/60 group-hover:text-primary/80 text-[11px] font-extrabold tracking-widest uppercase transition-colors whitespace-nowrap",
              isCurrentDay && "text-primary font-extrabold",
            )}
          >
            {dayName}
          </span>
          {isCurrentDay && (
            <Badge variant="default" className="px-2 py-0.5 text-[10px] bg-primary text-primary-foreground border-0 shrink-0 shadow-sm">
              Today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-10">
        <div className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 shadow-lg",
          "bg-muted-foreground/15 group-hover:bg-primary/25 group-hover:scale-110 group-hover:shadow-xl",
          isOver && "bg-primary/30 scale-125"
        )}>
          <Plus className={cn(
            "h-8 w-8 transition-colors",
            "text-muted-foreground/60 group-hover:text-primary",
            isOver && "text-primary"
          )} />
        </div>
        <div className="text-center space-y-2">
          <p className={cn(
            "text-sm font-bold transition-colors",
            "text-muted-foreground/70 group-hover:text-primary/90",
            isOver && "text-primary font-extrabold"
          )}>
            {isOver ? "Drop Day Here" : "Add Workout Day"}
          </p>
          <p className="text-muted-foreground/60 text-xs">Click to create a new workout</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyScheduleBoard({
  localDays,
  currentDayOfWeek,
  onDragEnd,
  onAddDay,
  onEditDay,
  onSaveDayTitle,
  onCancelEdit,
  onDeleteDay,
  onDuplicateDay,
  onOpenCopyDialog,
  onOpenDrawer,
  editingDayId,
  editingDayTitle,
  onEditingDayTitleChange,
  updateDay,
  plan,
}: WeeklyScheduleBoardProps) {
  // Drag and drop sensors with activation distance to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor),
  );

  return (
    <div className="relative w-full overflow-hidden -mx-4 sm:-mx-6">
      {/* Enhanced Fade gradients for scroll indicators */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background via-background/80 to-transparent" />
      
      <div className="overflow-x-auto overflow-y-visible pb-5 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50 px-4 sm:px-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={localDays
              .filter((day) => day !== null)
              .map((day) => day?.id)}
            strategy={horizontalListSortingStrategy}
            disabled={false}
          >
            {/* Board Columns - Fixed Width Jira Style */}
            {/* 
              Fixed width calculation:
              - 7 cards × 340px = 2,380px
              - 6 gaps × 20px (gap-5) = 120px
              - Total: 2,500px minimum width
              This ensures all cards fit without overlapping
            */}
            <div className="flex gap-5 min-w-[2500px] pb-3">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((dayName, slotIndex) => {
                const dayData = localDays[slotIndex];
                const isCurrentDay = slotIndex === currentDayOfWeek;

                if (!dayData) {
                  return (
                    <EmptyDaySlot
                      key={slotIndex}
                      dayName={dayName}
                      slotIndex={slotIndex}
                      onAddDay={(slot, dayName?: string) => {
                        if (dayName) {
                          onAddDay(slot, dayName);
                        } else {
                          onAddDay(slot);
                        }
                      }}
                      isCurrentDay={isCurrentDay}
                    />
                  );
                }

                return (
                  <SortableDayCard
                    key={dayData.id}
                    dayData={dayData}
                    dayName={dayName}
                    slotIndex={slotIndex}
                    onEditDay={onEditDay}
                    onSaveDayTitle={onSaveDayTitle}
                    onCancelEdit={onCancelEdit}
                    onDeleteDay={onDeleteDay}
                    onDuplicateDay={onDuplicateDay}
                    onOpenCopyDialog={onOpenCopyDialog}
                    onOpenDrawer={onOpenDrawer}
                    editingDayId={editingDayId}
                    editingDayTitle={editingDayTitle}
                    onEditingDayTitleChange={onEditingDayTitleChange}
                    updateDay={updateDay}
                    plan={plan}
                    isCurrentDay={isCurrentDay}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
