"use client";

import { useState, useEffect, use, useMemo } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Dumbbell,
  Save,
  Eye,
  Calendar,
  Pencil,
  Copy,
  Move,
  Check,
} from "lucide-react";
import { WeeklyScheduleBoard } from "./_components/weekly-schedule-board";

// Sortable wrapper component for plan exercises with collapsed view when dragging
function SortableExerciseItem({
  id,
  item,
  itemIndex,
  onDeleteItem,
  onUpdateItem,
  onRefetch,
  isDraggingState,
}: {
  id: string;
  item: PlanExercise;
  itemIndex: number;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, field: "sets" | "reps" | "weight", value: number) => void;
  onRefetch: () => void;
  isDraggingState: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  // Check if any item is being dragged (not just this one)
  const { active } = useDndContext();
  const isAnyDragging = !!active || isDraggingState;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isAnyDragging ? transition : "all 0.3s ease-in-out",
    opacity: isDragging ? 0.5 : 1,
  };

  // Show collapsed view only when in arrange mode, otherwise show full card
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
                    onUpdateItem(
                      item.id,
                      "sets",
                      Number(e.target.value),
                    )
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
                    onUpdateItem(
                      item.id,
                      "reps",
                      Number(e.target.value),
                    )
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
  order?: number; // Order within the plan day
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

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, useDndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const utils = api.useUtils();

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
  const updateDaysOrder = api.plan.updateDaysOrder.useMutation();
  const duplicateDay = api.plan.duplicateDay.useMutation();
  const copyExercises = api.plan.copyExercises.useMutation();
  const toggleRestDay = api.plan.toggleRestDay.useMutation();
  const reorderItems = api.plan.reorderItems.useMutation();
  const [copyFromDayId, setCopyFromDayId] = useState<string | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [localDays, setLocalDays] = useState<(PlanDay | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
  }, [p?.days]);

  const exercises = api.exercise.list.useQuery(
    { q: searchQuery, take: 20 },
    { enabled: isAddExerciseDialogOpen },
  );

  // Drag and drop sensors for exercises
  const exerciseSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle exercise reordering within a day
  const handleExerciseDragEnd = async (event: DragEndEvent, dayId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const selectedDay = p?.days?.find((d) => d.id === dayId);
    if (!selectedDay) return;

    // Sort items by order to ensure correct indices
    const items = [...(selectedDay.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(items, oldIndex, newIndex);
      const orderedIds = reordered.map((item) => item.id);
      
      await reorderItems.mutateAsync({
        dayId,
        orderedIds,
      });
      await plan.refetch();
    }
  };

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

  const handleAddDay = async (targetSlot?: number, dayName?: string) => {
    if (!newDayTitle && !targetSlot) {
      setIsAddDayDialogOpen(true);
      return;
    }

    const order = targetSlot ?? p?.days?.length ?? 0;
    const title = newDayTitle || (dayName ? `${dayName} Workout` : `Day ${order + 1}`);
    
    await addDay.mutateAsync({
      planId: id,
      title,
      order,
    });
    setNewDayTitle("");
    setIsAddDayDialogOpen(false);
    await plan.refetch();
    // Invalidate getTodaysWorkout query so start page updates
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
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
          
          // Invalidate getTodaysWorkout query so start page updates
          if (userId) {
            await utils.plan.getTodaysWorkout.invalidate({ userId });
          }
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
    // Invalidate getTodaysWorkout query so start page updates
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
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
    // Invalidate getTodaysWorkout query so start page updates
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
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
    // Invalidate getTodaysWorkout query so start page updates
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
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
    // Invalidate getTodaysWorkout query so start page updates
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
  };

  const handleCancelEditDay = () => {
    setEditingDayId(null);
    setEditingDayTitle("");
  };

  const handleDuplicateDay = async (dayId: string) => {
    if (!id) return;
    await duplicateDay.mutateAsync({ dayId, planId: id });
    await plan.refetch();
    // Invalidate getTodaysWorkout query so start page updates
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
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
    // Invalidate getTodaysWorkout query so start page updates
    if (userId) {
      await utils.plan.getTodaysWorkout.invalidate({ userId });
    }
  };

  if (plan.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto animate-pulse">
            <Dumbbell className="text-primary h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-semibold text-foreground">Loading workout plan...</p>
            <p className="text-muted-foreground text-sm">Preparing your schedule</p>
          </div>
        </div>
      </div>
    );
  }

  const totalExercises =
    p?.days?.reduce((sum: number, d) => sum + (d.items?.length ?? 0), 0) ?? 0;

  return (
    <div className="flex-1 space-y-6 overflow-x-hidden p-4 pt-4 sm:space-y-6 sm:p-6">
      {/* Premium Header Design */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 mt-1 hover:bg-muted/80 transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {p?.name ?? "Untitled Plan"}
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                Build and organize your weekly workout schedule
              </p>
            </div>
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-foreground">{p?.days?.length ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Workout Days</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Dumbbell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-foreground">{totalExercises}</div>
                  <div className="text-xs text-muted-foreground">Total Exercises</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/portal/log`)}
            className="h-9 gap-2 shrink-0"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">View Logs</span>
            <span className="sm:hidden">Logs</span>
          </Button>
        </div>
      </div>

      {/* Plan Name Editor - Floating Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Plan Name
              </label>
              <Input
                placeholder="e.g., PPL Split, Upper Lower, Full Body"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleSaveName();
                  }
                }}
                className="h-12 text-base font-semibold border-2 focus:border-primary transition-colors"
              />
            </div>
            <Button
              size="default"
              onClick={handleSaveName}
              disabled={updateMeta.isPending || !planName || planName === p?.name}
              className="h-12 gap-2 px-6 shrink-0 font-medium"
            >
              <Save className="h-4 w-4" />
              {updateMeta.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule - Enhanced Header */}
      <div className="space-y-5 w-full max-w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Weekly Schedule
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Drag days to reorder • Click empty slots to add workouts • Scroll horizontally to view all days
            </p>
          </div>
        </div>

        {/* Weekly Schedule Board - Isolated Component */}
        <WeeklyScheduleBoard
          localDays={localDays}
          currentDayOfWeek={currentDayOfWeek}
          onDragEnd={handleDragEnd}
          onAddDay={(slot, dayName) => {
            setNewDayTitle(`${dayName} Workout`);
            void handleAddDay(slot, dayName);
          }}
          onEditDay={(dayId) => {
            const day = p?.days?.find((d) => d.id === dayId);
            if (day) handleStartEditDay(dayId, day.title);
          }}
          onSaveDayTitle={handleSaveDayTitle}
          onCancelEdit={handleCancelEditDay}
          onDeleteDay={handleDeleteDay}
          onDuplicateDay={handleDuplicateDay}
          onOpenCopyDialog={handleOpenCopyDialog}
          onOpenDrawer={(dayId) => setSelectedDayId(dayId)}
          onToggleRestDay={async (dayId) => {
            await toggleRestDay.mutateAsync({ id: dayId });
            await plan.refetch();
            // Invalidate getTodaysWorkout query so start page updates
            if (userId) {
              await utils.plan.getTodaysWorkout.invalidate({ userId });
            }
          }}
          editingDayId={editingDayId}
          editingDayTitle={editingDayTitle}
          onEditingDayTitleChange={setEditingDayTitle}
          updateDay={updateDay}
          plan={p}
        />

        {/* Add Day Dialog - Enhanced */}
        <Dialog open={isAddDayDialogOpen} onOpenChange={setIsAddDayDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                Create New Workout Day
              </DialogTitle>
              <p className="text-muted-foreground text-center text-sm">
                Add a new day to your weekly training schedule. You can add exercises to this day after creating it.
              </p>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-foreground">
                  Day Name
                </label>
                <Input
                  placeholder="e.g., Push Day, Leg Day, Upper Body, Monday Workout"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newDayTitle.trim()) {
                      void handleAddDay();
                    }
                  }}
                  className="h-12 text-base border-2 focus:border-primary transition-colors"
                  autoFocus
                />
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <span className="text-[10px] font-bold text-primary">💡</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Tip:</strong> Use descriptive names like &quot;Push Day&quot;,
                    &quot;Pull Day&quot;, or include the day of week (e.g., &quot;Monday - Chest & Triceps&quot;).
                  </p>
                </div>
              </div>
              <Button
                className="h-12 w-full gap-2 font-semibold text-base"
                onClick={() => handleAddDay()}
                disabled={!newDayTitle.trim() || addDay.isPending}
              >
                <Plus className="h-5 w-5" />
                {addDay.isPending ? "Creating..." : "Create Workout Day"}
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
                  <SheetHeader className="bg-gradient-to-b from-muted/40 via-muted/20 to-background sticky top-0 z-10 border-b border-border/50 px-6 pt-7 pb-6 shadow-lg backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-4">
                        {editingDayId === selectedDay.id ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <Input
                              value={editingDayTitle}
                              onChange={(e) =>
                                setEditingDayTitle(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && editingDayTitle.trim()) {
                                  void handleSaveDayTitle(selectedDay.id);
                                } else if (e.key === "Escape") {
                                  handleCancelEditDay();
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
                                onClick={() => handleSaveDayTitle(selectedDay.id)}
                                disabled={
                                  updateDay.isPending || !editingDayTitle.trim()
                                }
                              >
                                <Save className="h-4 w-4" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 shrink-0 rounded-xl"
                                onClick={handleCancelEditDay}
                              >
                                <span className="text-2xl leading-none">×</span>
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-4">
                              <SheetTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {selectedDay.title}
                              </SheetTitle>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 shadow-sm">
                                  <Dumbbell className="h-4 w-4 text-primary" />
                                  <span className="font-extrabold text-primary text-sm">
                                    {selectedDay.items?.length ?? 0}
                                  </span>
                                  <span className="text-sm text-foreground/70 font-semibold">
                                    {selectedDay.items?.length === 1
                                      ? "exercise"
                                      : "exercises"}
                                  </span>
                                </div>
                                {(selectedDay.items ?? []).length > 0 && (
                                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-muted/60 backdrop-blur-sm shadow-sm">
                                    <span className="font-extrabold text-foreground text-sm">
                                      {selectedDay.items.reduce(
                                        (sum: number, item: { sets?: number }) =>
                                          sum + (item.sets! ?? 0),
                                        0,
                                      )}
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
                      {editingDayId !== selectedDay.id && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 shrink-0 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all shadow-sm"
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
                          onClick={() => {
                            setTargetDayId(selectedDay.id);
                            setIsAddExerciseDialogOpen(true);
                          }}
                        >
                          <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                          Add Exercise to Workout
                        </Button>
                      )}
                    </div>

                    {/* Exercise List - Premium Cards */}
                    {(selectedDay.items ?? []).length > 0 ? (
                      isDragging ? (
                        <DndContext
                          sensors={exerciseSensors}
                          collisionDetection={closestCenter}
                          onDragStart={() => {}}
                          onDragEnd={(e) => {
                            handleExerciseDragEnd(e, selectedDay.id);
                          }}
                        >
                        <SortableContext
                          items={(selectedDay.items ?? []).map((item) => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {(selectedDay.items ?? [])
                              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                              .map((item, itemIndex: number) => (
                                <SortableExerciseItem
                                  key={item.id}
                                  id={item.id}
                                  item={item}
                                  itemIndex={itemIndex}
                                  onDeleteItem={handleDeleteItem}
                                  onUpdateItem={handleUpdateItem}
                                  onRefetch={() => plan.refetch()}
                                  isDraggingState={isDragging}
                                />
                              ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="space-y-4">
                        {(selectedDay.items ?? [])
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((item, itemIndex: number) => (
                            <Card key={item.id} className="group relative border-2 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/40 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
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
                                    onClick={() => handleDeleteItem(item.id)}
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
                                        handleUpdateItem(
                                          item.id,
                                          "sets",
                                          Number(e.target.value),
                                        )
                                      }
                                      onBlur={() => plan.refetch()}
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
                                        handleUpdateItem(
                                          item.id,
                                          "reps",
                                          Number(e.target.value),
                                        )
                                      }
                                      onBlur={() => plan.refetch()}
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
                            Start building your workout by adding exercises to this day. You can set sets, reps, and weight for each exercise.
                          </p>
                          <Button
                            size="lg"
                            onClick={() => {
                              setTargetDayId(selectedDay.id);
                              setIsAddExerciseDialogOpen(true);
                            }}
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
          })()}
      </div>

      {/* Add Exercise Dialog - Enhanced */}
      <Dialog
        open={isAddExerciseDialogOpen}
        onOpenChange={setIsAddExerciseDialogOpen}
      >
        <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col sm:max-h-[85vh]">
          <DialogHeader className="flex-shrink-0 space-y-3 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Add Exercise to Workout
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm">
              Search and select exercises from your library to add to this workout day
            </p>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col space-y-5 pt-2">
            <div className="relative">
              <Input
                placeholder="Search exercises by name, muscle group, or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-base border-2 focus:border-primary transition-colors pr-10"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                  onClick={() => setSearchQuery("")}
                >
                  ×
                </Button>
              )}
            </div>
            <div className="max-h-[50vh] flex-1 space-y-2 overflow-y-auto sm:max-h-[450px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {exercises.data && exercises.data.length > 0 ? (
                exercises.data.map((ex) => (
                  <Card
                    key={ex.id}
                    className="cursor-pointer border-2 transition-all hover:border-primary/50 hover:shadow-md group"
                    onClick={() => handleAddExercise(ex.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex w-full items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Dumbbell className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <h4 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                            {ex.name}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs px-2.5 py-1 font-medium border-primary/20"
                            >
                              {ex.muscleGroup}
                            </Badge>
                            {ex.equipment && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-2.5 py-1 font-medium"
                              >
                                {ex.equipment}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Plus className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-base font-semibold mb-1">No exercises found</p>
                  <p className="text-muted-foreground text-sm">
                    Try a different search term or check your exercise library
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4 animate-pulse" />
                  <p className="text-muted-foreground text-sm">Start typing to search exercises...</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy Exercises Dialog - Enhanced */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <Copy className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Copy Exercises
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm">
              Select a workout day to copy exercises to
            </p>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="max-h-[50vh] space-y-2 overflow-y-auto sm:max-h-[400px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {(p?.days ?? [])
                .filter((d) => d.id !== copyFromDayId)
                .map((day) => (
                  <Card
                    key={day.id}
                    className="cursor-pointer border-2 transition-all hover:border-primary/50 hover:shadow-md group"
                    onClick={() => !copyExercises.isPending && handleCopyExercises(day.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex w-full items-center justify-between">
                        <div className="min-w-0 flex-1 text-left space-y-1">
                          <p className="truncate text-base font-semibold group-hover:text-primary transition-colors">
                            {day.title}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Dumbbell className="h-3.5 w-3.5" />
                              {day.items?.length ?? 0}{" "}
                              {day.items?.length === 1 ? "exercise" : "exercises"}
                            </span>
                            {day.items && day.items.length > 0 && (
                              <>
                                <span>•</span>
                                <span>
                                  {day.items.reduce(
                                    (sum: number, item: { sets?: number }) =>
                                      sum + (item.sets ?? 0),
                                    0,
                                  )}{" "}
                                  sets
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Copy className="ml-4 h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {(p?.days ?? []).filter((d: PlanDay) => d.id !== copyFromDayId)
                .length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-base font-semibold mb-1">No other days available</p>
                  <p className="text-muted-foreground text-sm">
                    Create more workout days to copy exercises between them
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
