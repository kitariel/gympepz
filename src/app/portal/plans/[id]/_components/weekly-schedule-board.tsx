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
  ArrowRight,
  Moon,
  X,
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
  isRestDay?: boolean;
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
  onToggleRestDay: (dayId: string) => void;
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
  onToggleRestDay,
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
  onToggleRestDay: (dayId: string) => void;
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex h-[calc(100vh-265px)] min-h-[515px] max-h-[685px] w-[340px] shrink-0 flex-col relative",
        "!border-y-0 !border-t-0 !border-b-0 border-l-2 border-r-2 rounded-none overflow-hidden cursor-pointer bg-card/50 backdrop-blur-sm",
        "transition-all duration-300",
        "border-l-border/90 border-r-border/90 hover:border-l-border/60 hover:border-r-border/60 hover:bg-card",
        isDragging && "ring-2 ring-primary/40 z-50 rotate-1 opacity-50 scale-95",
        isCurrentDay && "!border-l-primary/50 !border-r-primary/50 bg-primary/5 ring-1 ring-primary/20",
        '!shadow-none'
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
        "flex-shrink-0 px-6 pt-5 pb-4 transition-colors duration-200",
        "bg-card",
        isCurrentDay && "bg-primary/[0.02]"
      )}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={cn(
                "text-muted-foreground/70 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap",
                isCurrentDay && "text-primary",
              )}
            >
              {dayName}
            </span>
            {isCurrentDay && (
              <Badge variant="default" className="px-2 py-0.5 text-[9px] font-semibold bg-primary text-primary-foreground border-0 shrink-0 rounded-md shadow-sm">
                Today
              </Badge>
            )}
            {dayData.isRestDay && (
              <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-semibold bg-muted/80 text-muted-foreground border-0 shrink-0 rounded-md shadow-sm flex items-center gap-1">
                <Moon className="h-2.5 w-2.5" />
                Rest Day
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div
              {...attributes}
              {...listeners}
              data-drag-handle
              className="hover:bg-muted cursor-grab touch-none rounded-md p-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100 active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="text-muted-foreground h-4 w-4" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-muted rounded-md"
                >
                  <MoreVertical className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] rounded-xl shadow-lg border">
                <DropdownMenuItem 
                  onClick={() => {
                    onToggleRestDay(dayData.id);
                  }} 
                  className="rounded-lg"
                >
                  {dayData.isRestDay ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Remove Rest Day
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Mark as Rest Day
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicateDay(dayData.id)} className="rounded-lg">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenCopyDialog(dayData.id)} className="rounded-lg">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Exercises To...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteDay(dayData.id)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
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
          <div className="flex flex-col gap-3 mt-2">
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
              className="h-11 text-base font-bold border focus:border-primary transition-colors rounded-xl shadow-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-semibold rounded-lg"
                onClick={() => onSaveDayTitle(dayData.id)}
                disabled={updateDay.isPending ?? !editingDayTitle.trim()}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-4 text-xs font-semibold rounded-lg"
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group/title flex items-start justify-between gap-2 mt-2">
            <CardTitle
              className="line-clamp-2 text-[22px] leading-tight font-bold cursor-pointer hover:text-foreground/80 transition-colors tracking-tight"
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
              className="h-8 w-8 shrink-0 opacity-0 transition-all group-hover/title:opacity-100 hover:bg-muted/50 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onEditDay(dayData.id);
              }}
            >
              <Pencil className="text-muted-foreground h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Stats - Clean Design */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground tabular-nums">{dayData.items?.length ?? 0}</span>
            <span className="text-xs text-muted-foreground font-medium">exercises</span>
          </div>
          <div className="h-4 w-px bg-border/30" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground tabular-nums">{totalSets}</span>
            <span className="text-xs text-muted-foreground font-medium">sets</span>
          </div>
        </div>
      </CardHeader>

      {/* Scrollable Exercise List - Connected Card Style */}
      <CardContent className="flex-1 overflow-y-auto px-5 py-3 min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent">
        <div className="space-y-2.5">
          {dayData.isRestDay ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 mb-5 border-2 border-primary/20">
                <Moon className="h-12 w-12 text-primary/70" />
              </div>
              <span className="text-base font-bold mb-2 text-foreground">Rest Day</span>
              <p className="text-xs text-muted-foreground mb-6 max-w-[220px]">
                Take time to recover and let your muscles heal
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-2 font-semibold rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRestDay(dayData.id);
                }}
              >
                <X className="h-4 w-4" />
                Remove Rest Day
              </Button>
            </div>
          ) : (dayData.items ?? []).length > 0 ? (
            (dayData.items ?? []).map((item, idx) => (
              <div
                key={item.id}
                className="group/item cursor-pointer border-0 bg-card rounded-t-2xl transition-all duration-200 relative hover:bg-muted/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDrawer(dayData.id);
                }}
              >
                {/* Card Content */}
                <div className="p-4 pb-6">
                  {/* Exercise Name and Muscle Group */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold leading-tight line-clamp-2 mb-1 text-foreground">
                        {item.exercise?.name ?? "Exercise"}
                      </h4>
                      {item.exercise?.muscleGroup && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {item.exercise.muscleGroup}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-muted-foreground/40 group-hover/item:text-muted-foreground/60 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Metrics with Labels */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-foreground tabular-nums">
                        {item.sets}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        sets
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-foreground tabular-nums">
                        {item.reps ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        reps
                      </span>
                    </div>
                    {item.weight && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-foreground tabular-nums">
                          {item.weight}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          kg
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom connection bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              </div>
            ))
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/30 mb-5">
                <Dumbbell className="h-9 w-9 text-muted-foreground/40" />
              </div>
              <span className="text-sm font-semibold mb-2 text-foreground/80">No exercises yet</span>
              <p className="text-xs text-muted-foreground mb-5 max-w-[220px]">
                Is this a rest day or would you like to add exercises?
              </p>
              <div className="flex flex-col gap-2 w-full px-6">
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 text-xs gap-2 font-semibold rounded-lg shadow-sm w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDrawer(dayData.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Exercise
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs gap-2 font-semibold rounded-lg w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRestDay(dayData.id);
                  }}
                >
                  <Moon className="h-4 w-4" />
                  Mark as Rest Day
                </Button>
              </div>
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
        "group flex h-[calc(100vh-265px)] min-h-[515px] max-h-[685px] w-[340px] shrink-0 cursor-pointer flex-col !border-y-0 !border-t-0 !border-b-0 border-l-2 border-r-2 border-dashed rounded-none transition-all relative",
        "border-l-border/30 border-r-border/30 bg-muted/10 hover:bg-muted/20 hover:border-l-border/50 hover:border-r-border/50",
        isOver && "!border-l-primary/50 !border-r-primary/50 bg-primary/5 border-solid scale-[1.01]",
        isCurrentDay && "!border-l-primary/50 !border-r-primary/50 bg-primary/[0.02]",
      )}
      onClick={() => onAddDay(slotIndex, dayName)}
    >
      <CardHeader className={cn(
        "flex-shrink-0 px-6 pt-5 pb-4",
        isCurrentDay && "bg-primary/[0.02]"
      )}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-muted-foreground/70 text-[11px] font-semibold tracking-wide uppercase transition-colors whitespace-nowrap",
              "group-hover:text-muted-foreground",
              isCurrentDay && "text-primary",
            )}
          >
            {dayName}
          </span>
          {isCurrentDay && (
            <Badge variant="default" className="px-2 py-0.5 text-[9px] font-semibold bg-primary text-primary-foreground border-0 shrink-0 rounded-md shadow-sm">
              Today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10">
        <div className={cn(
          "flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
          "bg-muted/40 group-hover:bg-muted/60",
          isOver && "bg-primary/10 scale-105"
        )}>
          <Plus className={cn(
            "h-8 w-8 transition-colors",
            "text-muted-foreground/60 group-hover:text-muted-foreground",
            isOver && "text-primary"
          )} />
        </div>
        <div className="text-center space-y-2">
          <p className={cn(
            "text-sm font-bold transition-colors",
            "text-foreground/70 group-hover:text-foreground",
            isOver && "text-primary"
          )}>
            {isOver ? "Drop Day Here" : "Add Workout Day"}
          </p>
          <p className="text-muted-foreground/60 text-xs font-medium">Click to create a new workout</p>
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
  onToggleRestDay,
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
                    onToggleRestDay={onToggleRestDay}
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
