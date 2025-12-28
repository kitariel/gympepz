"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Dumbbell,
  Save,
  Eye,
  Calendar,
  Pencil,
  Copy,
  MoreVertical,
  ChevronRight,
} from "lucide-react";

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
  p,
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
  p: Plan | null | undefined;
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
        "group ring-border hover:ring-primary/20 bg-card flex h-full min-h-[180px] cursor-pointer flex-col border-0 shadow-sm ring-1 transition-all hover:shadow-md",
        isDragging && "ring-primary z-50 rotate-2 opacity-50 ring-2",
        isCurrentDay && "ring-primary/60 bg-primary/5 ring-2",
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
      <CardHeader className="space-y-1 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase",
                isCurrentDay && "text-primary font-bold",
              )}
            >
              {dayName}
            </span>
            {isCurrentDay && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
                Today
              </Badge>
            )}
          </div>
          <div
            {...attributes}
            {...listeners}
            data-drag-handle
            className="hover:bg-muted -mt-2 -mr-2 shrink-0 cursor-grab touch-none rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="text-muted-foreground h-4 w-4" />
          </div>
        </div>

        {editingDayId === dayData.id ? (
          <div className="flex flex-col gap-2 pt-1">
            <Input
              value={editingDayTitle}
              onChange={(e) => onEditingDayTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSaveDayTitle(dayData.id);
                } else if (e.key === "Escape") {
                  onCancelEdit();
                }
              }}
              className="h-8 text-sm font-semibold"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onSaveDayTitle(dayData.id)}
                disabled={updateDay.isPending ?? !editingDayTitle.trim()}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group/title flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base leading-tight font-bold">
              {dayData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-1 h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover/title:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onEditDay(dayData.id);
              }}
            >
              <Pencil className="text-muted-foreground h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-4 pb-4">
        {/* Exercise Preview */}
        <div className="min-h-[3rem] flex-1 space-y-1.5">
          {(dayData.items ?? []).length > 0 ? (
            <>
              {(dayData.items ?? []).slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <div className="bg-primary/40 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span className="truncate">
                    {item.exercise?.name ?? "Exercise"}
                  </span>
                  {item.sets && (
                    <span className="text-muted-foreground/50 ml-auto shrink-0 text-[10px]">
                      {item.sets} sets
                    </span>
                  )}
                </div>
              ))}
              {(dayData.items?.length ?? 0) > 3 && (
                <p className="text-muted-foreground/60 pt-0.5 pl-3.5 text-xs">
                  + {(dayData.items?.length ?? 0) - 3} more
                </p>
              )}
            </>
          ) : (
            <div className="text-muted-foreground/40 flex h-full flex-col items-center justify-center py-2 text-xs italic">
              No exercises added
            </div>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Dumbbell className="h-3.5 w-3.5" />
              <span>{dayData.items?.length ?? 0}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <span className="text-muted-foreground/60 text-[10px] tracking-wider uppercase">
                Sets
              </span>
              <span>{totalSets}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="text-muted-foreground h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem onClick={() => onDuplicateDay(dayData.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenCopyDialog(dayData.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy To...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteDay(dayData.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
  onAddDay: (slot: number) => void;
  isCurrentDay?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotIndex.toString(),
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "group border-muted-foreground/10 bg-muted/5 hover:border-primary/40 hover:bg-primary/5 flex h-full min-h-[180px] cursor-pointer flex-col border-2 border-dashed transition-all",
        isOver && "border-primary bg-primary/10",
        isCurrentDay && "border-primary/50 bg-primary/10",
      )}
      onClick={() => onAddDay(slotIndex)}
    >
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-muted-foreground/50 group-hover:text-primary/60 text-[10px] font-semibold tracking-wider uppercase transition-colors",
              isCurrentDay && "text-primary font-bold",
            )}
          >
            {dayName}
          </span>
          {isCurrentDay && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">
              Today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 pb-8">
        <div className="bg-muted-foreground/5 group-hover:bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110">
          <Plus className="text-muted-foreground/40 group-hover:text-primary h-5 w-5 transition-colors" />
        </div>
        <div className="text-center">
          <p className="text-muted-foreground/60 group-hover:text-primary/80 text-sm font-medium transition-colors">
            {isOver ? "Drop Day Here" : "Add Workout"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

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
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [planName, setPlanName] = useState("");
  const [isAddDayDialogOpen, setIsAddDayDialogOpen] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState("");
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [targetDayId, setTargetDayId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState("");

  const plan = api.plan.get.useQuery({ id }, { enabled: !!id });
  const updateMeta = api.plan.updateMeta.useMutation();
  const addDay = api.plan.addDay.useMutation();
  const addEx = api.plan.addExercise.useMutation();
  const updItem = api.plan.updateItem.useMutation();
  const delItem = api.plan.deleteItem.useMutation();
  const deleteDay = api.plan.deleteDay.useMutation();
  const updateDay = api.plan.updateDay.useMutation();
  const updateDayOrder = api.plan.updateDayOrder.useMutation();
  const updateDaysOrder = api.plan.updateDaysOrder.useMutation();
  const duplicateDay = api.plan.duplicateDay.useMutation();
  const copyExercises = api.plan.copyExercises.useMutation();
  const reorderDays = api.plan.reorderDays.useMutation();
  const [copyFromDayId, setCopyFromDayId] = useState<string | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [localDays, setLocalDays] = useState<(PlanDay | null)[]>([]);

  const p = plan.data as Plan | null | undefined;

  // Get current day of week (0 = Sunday, 6 = Saturday)
  const currentDayOfWeek = new Date().getDay();

  // Initialize local days from plan data
  useEffect(() => {
    if (p?.days && p.days.length > 0) {
      // Sort days by order
      const sortedDays = [...p.days].sort((a, b) => a.order - b.order);

      // Create array with 7 slots (Sunday = 0, Monday = 1, etc.)
      const weekSlots: (PlanDay | null)[] = Array.from(
        { length: 7 },
        () => null,
      );

      // Map days to slots: order should directly map to slot (0-6)
      // This ensures drag-and-drop positions persist correctly
      sortedDays.forEach((day) => {
        // For weekly view, order values 0-6 map directly to slots 0-6
        if (day.order >= 0 && day.order < 7) {
          const slotIndex = day.order;
          // If slot is empty, assign day; otherwise skip (shouldn't happen if orders are unique)
          if (!weekSlots[slotIndex]) {
            weekSlots[slotIndex] = day;
          } else {
            // Conflict: day with same order already exists
            // This shouldn't happen, but if it does, find next available slot
            console.warn(
              `Order conflict: day ${day.id} has order ${day.order} but slot is taken`,
            );
            for (let i = 0; i < 7; i++) {
              const checkSlot = (slotIndex + 1 + i) % 7;
              if (!weekSlots[checkSlot]) {
                weekSlots[checkSlot] = day;
                break;
              }
            }
          }
        } else if (day.order >= 7) {
          // Orders >= 7 are outside weekly view range, place in first available slot
          for (let i = 0; i < 7; i++) {
            if (!weekSlots[i]) {
              weekSlots[i] = day;
              break;
            }
          }
        }
      });
      setLocalDays(weekSlots);
    } else {
      setLocalDays(Array(7).fill(null));
    }
  }, [plan.data?.days]);

  // Drag and drop sensors with activation distance to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor),
  );

  const exercises = api.exercise.list.useQuery(
    { q: searchQuery, take: 20 },
    { enabled: isAddExerciseDialogOpen },
  );

  useEffect(() => {
    if (p?.name && !planName) {
      setPlanName(p.name);
    }
  }, [p?.name, planName]);

  const handleSaveName = async () => {
    if (!id || !planName) return;
    await updateMeta.mutateAsync({ id, name: planName });
    await plan.refetch();
  };

  const handleAddDay = async (targetSlot?: number) => {
    if (!newDayTitle && !targetSlot) {
      setIsAddDayDialogOpen(true);
      return;
    }

    const order = targetSlot ?? p?.days?.length ?? 0;
    await addDay.mutateAsync({
      planId: id,
      title: newDayTitle || `Day ${order + 1}`,
      order,
    });
    setNewDayTitle("");
    setIsAddDayDialogOpen(false);
    await plan.refetch();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeDayId = active.id as string;
    let overSlotIndex = -1;

    // Check if over.id is a slot index (0-6)
    if (["0", "1", "2", "3", "4", "5", "6"].includes(over.id as string)) {
      overSlotIndex = parseInt(over.id as string);
    } else {
      // Otherwise assume it's a day ID and look it up
      overSlotIndex = localDays.findIndex((d) => d?.id === over.id);
    }

    // If dropping on a slot (slot index 0-6)
    if (overSlotIndex >= 0 && overSlotIndex < 7) {
      const newDays = [...localDays];
      const activeDay = p?.days?.find((d) => d.id === activeDayId);

      if (!activeDay) return;

      // Find current position of dragged day
      const currentSlotIndex = newDays.findIndex(
        (day) => day?.id === activeDayId,
      );

      // Check if target slot already has a day (need to swap)
      const existingDayAtSlot = newDays[overSlotIndex];

      if (currentSlotIndex >= 0) {
        // Clear current slot
        newDays[currentSlotIndex] = null;

        // If target slot has a day, move it to the source slot (swap)
        if (existingDayAtSlot && existingDayAtSlot.id !== activeDayId) {
          // Update the swapped day's order to match its new slot position
          newDays[currentSlotIndex] = {
            ...existingDayAtSlot,
            order: currentSlotIndex,
          };
        }
      }

      // Place active day in target slot with updated order
      newDays[overSlotIndex] = { ...activeDay, order: overSlotIndex };

      // Update local state immediately for responsive UI
      setLocalDays(newDays);

      // Build array of order updates for all days in their new positions
      // Day at slot N should have order = N
      const orderUpdates: Array<{ id: string; order: number }> = [];
      newDays.forEach((day, slotIndex) => {
        if (day) {
          orderUpdates.push({
            id: day.id,
            order: slotIndex,
          });
        }
      });

      // Update all days' orders atomically in a single transaction
      if (orderUpdates.length > 0) {
        try {
          await updateDaysOrder.mutateAsync({
            planId: id,
            orders: orderUpdates,
          });

          // Refetch to sync with database after updates complete
          await plan.refetch();
        } catch (error) {
          console.error("Failed to update day orders:", error);
          // Revert by refetching original data
          await plan.refetch();
        }
      }
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Delete this day and all its exercises?")) return;
    await deleteDay.mutateAsync({ id: dayId });
    await plan.refetch();
  };

  const handleAddExercise = async (exerciseId: string) => {
    if (!targetDayId) return;
    await addEx.mutateAsync({
      dayId: targetDayId,
      exerciseId,
      sets: 3,
      reps: 10,
    });
    setIsAddExerciseDialogOpen(false);
    setSearchQuery("");
    await plan.refetch();
  };

  const handleUpdateItem = async (
    itemId: string,
    field: "sets" | "reps" | "weight",
    value: number,
  ) => {
    await updItem.mutateAsync({ id: itemId, [field]: value });
  };

  const handleDeleteItem = async (itemId: string) => {
    await delItem.mutateAsync({ id: itemId });
    await plan.refetch();
  };

  const handleStartEditDay = (dayId: string, currentTitle: string) => {
    setEditingDayId(dayId);
    setEditingDayTitle(currentTitle);
  };

  const handleSaveDayTitle = async (dayId: string) => {
    if (!editingDayTitle.trim()) return;
    await updateDay.mutateAsync({ id: dayId, title: editingDayTitle });
    setEditingDayId(null);
    setEditingDayTitle("");
    await plan.refetch();
  };

  const handleCancelEditDay = () => {
    setEditingDayId(null);
    setEditingDayTitle("");
  };

  const handleDuplicateDay = async (dayId: string) => {
    if (!id) return;
    await duplicateDay.mutateAsync({ dayId, planId: id });
    await plan.refetch();
  };

  const handleOpenCopyDialog = (dayId: string) => {
    setCopyFromDayId(dayId);
    setIsCopyDialogOpen(true);
  };

  const handleCopyExercises = async (targetDayId: string) => {
    if (!copyFromDayId) return;
    await copyExercises.mutateAsync({
      sourceDayId: copyFromDayId,
      targetDayId,
    });
    setIsCopyDialogOpen(false);
    setCopyFromDayId(null);
    await plan.refetch();
  };

  if (plan.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Dumbbell className="text-muted-foreground mx-auto mb-3 h-10 w-10 animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading plan...</p>
        </div>
      </div>
    );
  }

  const totalExercises =
    p?.days?.reduce((sum: number, d) => sum + (d.items?.length ?? 0), 0) ?? 0;

  return (
    <div className="flex-1 space-y-3 p-4 pt-4 sm:space-y-4 sm:p-6">
      {/* Responsive Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 sm:h-8 sm:w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
              Edit Plan
            </h2>
            <p className="text-muted-foreground mt-0.5 hidden text-xs sm:block sm:text-sm">
              Customize your workout program
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => router.push(`/portal/log`)}
          className="h-9 w-full gap-2 sm:h-8 sm:w-auto"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Preview</span>
          <span className="sm:hidden">View Logs</span>
        </Button>
      </div>

      {/* Plan Name - Responsive */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3 sm:px-4">
          <CardTitle className="text-sm font-semibold">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 sm:px-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Plan name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void handleSaveName();
                }
              }}
              className="h-10 flex-1 sm:h-9"
            />
            <Button
              size="sm"
              onClick={handleSaveName}
              disabled={updateMeta.isPending || !planName}
              className="h-10 w-full sm:h-9 sm:w-auto"
            >
              <Save className="mr-1.5 h-4 w-4 sm:h-3.5 sm:w-3.5" />
              {updateMeta.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs sm:gap-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {p?.days?.length ?? 0} {p?.days?.length === 1 ? "day" : "days"}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              {totalExercises} {totalExercises === 1 ? "exercise" : "exercises"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Workout Days */}
      <div className="space-y-3 sm:space-y-3 md:space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 md:gap-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold sm:text-base md:text-lg">
              Weekly Schedule
            </h3>
            <p className="text-muted-foreground mt-0.5 hidden text-xs sm:block sm:text-xs md:text-sm">
              Drag and drop workout days to rearrange. Click empty days to add
              workouts.
            </p>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localDays
              .filter((day) => day !== null)
              .map((day) => day?.id)}
            strategy={horizontalListSortingStrategy}
            disabled={false}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
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
                      onAddDay={(slot) => {
                        setNewDayTitle(`${dayName} Workout`);
                        void handleAddDay(slot);
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
                    onEditDay={(dayId) =>
                      handleStartEditDay(dayId, dayData.title)
                    }
                    onSaveDayTitle={(dayId) => handleSaveDayTitle(dayId)}
                    onCancelEdit={handleCancelEditDay}
                    onDeleteDay={handleDeleteDay}
                    onDuplicateDay={handleDuplicateDay}
                    onOpenCopyDialog={handleOpenCopyDialog}
                    onOpenDrawer={(dayId) => setSelectedDayId(dayId)}
                    editingDayId={editingDayId}
                    editingDayTitle={editingDayTitle}
                    onEditingDayTitleChange={setEditingDayTitle}
                    updateDay={updateDay}
                    p={p}
                    isCurrentDay={isCurrentDay}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Day Dialog */}
        <Dialog open={isAddDayDialogOpen} onOpenChange={setIsAddDayDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Add New Workout Day
              </DialogTitle>
              <p className="text-muted-foreground mt-2 text-sm">
                A workout day is a collection of exercises you&apos;ll do
                together in one session.
              </p>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Day Name</label>
                <Input
                  placeholder="e.g., Monday - Push Day, Leg Day, Upper Body"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleAddDay();
                    }
                  }}
                  className="h-10 sm:h-9"
                />
                <p className="text-muted-foreground text-xs">
                  Tip: Use descriptive names like &quot;Push Day&quot;,
                  &quot;Pull Day&quot;, or day of the week.
                </p>
              </div>
              <Button
                className="h-10 w-full sm:h-9"
                onClick={() => handleAddDay()}
                disabled={!newDayTitle || addDay.isPending}
              >
                {addDay.isPending ? "Adding..." : "Create Workout Day"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Exercise Drawer/Sheet */}
        {selectedDayId &&
          (() => {
            const selectedDay = (p?.days ?? []).find(
              (d: PlanDay) => d.id === selectedDayId,
            );
            if (!selectedDay) return null;

            return (
              <Sheet
                open={!!selectedDayId}
                onOpenChange={(open) => !open && setSelectedDayId(null)}
              >
                <SheetContent
                  side="bottom"
                  className="flex max-h-[95vh] w-full flex-col overflow-y-auto p-0 sm:max-h-[92vh] md:max-h-[85vh]"
                >
                  <SheetHeader className="bg-background sticky top-0 z-10 border-b px-6 pt-6 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {editingDayId === selectedDay.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingDayTitle}
                              onChange={(e) =>
                                setEditingDayTitle(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  void handleSaveDayTitle(selectedDay.id);
                                } else if (e.key === "Escape") {
                                  handleCancelEditDay();
                                }
                              }}
                              className="h-9 flex-1 text-base font-semibold"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => handleSaveDayTitle(selectedDay.id)}
                              disabled={
                                updateDay.isPending || !editingDayTitle.trim()
                              }
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={handleCancelEditDay}
                            >
                              ×
                            </Button>
                          </div>
                        ) : (
                          <>
                            <SheetTitle className="text-xl sm:text-2xl">
                              {selectedDay.title}
                            </SheetTitle>
                            <SheetDescription className="mt-2">
                              {selectedDay.items?.length ?? 0}{" "}
                              {selectedDay.items?.length === 1
                                ? "exercise"
                                : "exercises"}
                              {(selectedDay.items ?? []).length > 0 && (
                                <span className="ml-2">
                                  •{" "}
                                  {selectedDay.items.reduce(
                                    (sum: number, item: { sets?: number }) =>
                                      sum + (item.sets! ?? 0),
                                    0,
                                  )}{" "}
                                  total sets
                                </span>
                              )}
                            </SheetDescription>
                          </>
                        )}
                      </div>
                      {editingDayId !== selectedDay.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() =>
                            handleStartEditDay(
                              selectedDay.id,
                              selectedDay.title,
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </SheetHeader>

                  <div className="flex-1 space-y-4 overflow-y-auto px-6 pt-6 pb-6">
                    {/* Add Exercise Button */}
                    <Button
                      className="h-11 w-full gap-2"
                      onClick={() => {
                        setTargetDayId(selectedDay.id);
                        setIsAddExerciseDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Exercise
                    </Button>

                    {/* Exercise List */}
                    {(selectedDay.items ?? []).length > 0 ? (
                      <div className="space-y-4">
                        {(selectedDay.items ?? []).map(
                          (item, itemIndex: number) => (
                            <Card key={itemIndex} className="border shadow-sm">
                              <CardContent className="space-y-4 p-5 sm:p-4">
                                {/* Exercise Header */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="mb-2 text-base font-semibold">
                                      {item.exercise?.name ?? item.exerciseId}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {item.exercise?.muscleGroup && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {item.exercise.muscleGroup}
                                        </Badge>
                                      )}
                                      {item.exercise?.equipment && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {item.exercise.equipment}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Sets/Reps/Weight */}
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-muted-foreground text-xs font-medium">
                                      Sets
                                    </label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
                                      value={item.sets ?? 3}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          item.id,
                                          "sets",
                                          Number(e.target.value),
                                        )
                                      }
                                      onBlur={() => plan.refetch()}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-muted-foreground text-xs font-medium">
                                      Reps
                                    </label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
                                      value={item.reps ?? 10}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          item.id,
                                          "reps",
                                          Number(e.target.value),
                                        )
                                      }
                                      onBlur={() => plan.refetch()}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-muted-foreground text-xs font-medium">
                                      Weight (kg)
                                    </label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
                                      value={item.weight ?? ""}
                                      placeholder="0"
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          item.id,
                                          "weight",
                                          Number(e.target.value),
                                        )
                                      }
                                      onBlur={() => plan.refetch()}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-12 text-center">
                        <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
                        <h3 className="mb-2 text-lg font-semibold">
                          No exercises yet
                        </h3>
                        <p className="text-muted-foreground mb-6 text-sm">
                          Add your first exercise to this workout day
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTargetDayId(selectedDay.id);
                            setIsAddExerciseDialogOpen(true);
                          }}
                          className="h-11"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Exercise
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            );
          })()}
      </div>

      {/* Add Exercise Dialog - Responsive */}
      <Dialog
        open={isAddExerciseDialogOpen}
        onOpenChange={setIsAddExerciseDialogOpen}
      >
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col sm:max-h-[85vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">
              Add Exercise to Workout Day
            </DialogTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              Search and select exercises to add to this workout session.
            </p>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col space-y-4 pt-4">
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 flex-shrink-0 sm:h-9"
            />
            <div className="max-h-[50vh] flex-1 space-y-2 overflow-y-auto sm:max-h-[400px]">
              {exercises.data?.map((ex) => (
                <Button
                  key={ex.id}
                  variant="outline"
                  className="h-auto w-full justify-start py-3 sm:py-2.5"
                  onClick={() => handleAddExercise(ex.id)}
                >
                  <div className="flex w-full items-start gap-2.5 text-left sm:gap-2">
                    <Dumbbell className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium sm:text-xs">
                        {ex.name}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-1">
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 text-[10px] sm:px-1.5 sm:py-0 sm:text-[9px]"
                        >
                          {ex.muscleGroup}
                        </Badge>
                        {ex.equipment && (
                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-[10px] sm:px-1.5 sm:py-0 sm:text-[9px]"
                          >
                            {ex.equipment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
              {searchQuery && exercises.data?.length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-xs sm:py-4 sm:text-sm">
                  No exercises found.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy Exercises Dialog - Responsive */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Copy Exercises To...
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm">
              Select a day to copy exercises to:
            </p>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto sm:max-h-[300px]">
              {(p?.days ?? [])
                .filter((d) => d.id !== copyFromDayId)
                .map((day) => (
                  <Button
                    key={day.id}
                    variant="outline"
                    className="h-auto w-full justify-start py-3 sm:py-2.5"
                    onClick={() => handleCopyExercises(day.id)}
                    disabled={copyExercises.isPending}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-medium">
                          {day.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {day.items?.length ?? 0}{" "}
                          {day.items?.length === 1 ? "exercise" : "exercises"}
                        </p>
                      </div>
                      <Copy className="ml-2 h-4 w-4 shrink-0" />
                    </div>
                  </Button>
                ))}
              {(p?.days ?? []).filter((d: PlanDay) => d.id !== copyFromDayId)
                .length === 0 && (
                <p className="text-muted-foreground py-6 text-center text-xs sm:py-4 sm:text-sm">
                  No other days available.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
