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
}: {
  dayData: any;
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
  updateDay: any;
  p: any;
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-0 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group border-2 border-transparent min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] flex flex-col",
        isDragging && "opacity-50"
      )}
      onClick={(e) => {
        // Only open drawer if click was not on interactive elements
        const target = e.target as HTMLElement;
        if (
          !target.closest('[data-drag-handle]') &&
          !target.closest('button') &&
          !target.closest('[role="menuitem"]') &&
          !isDragging
        ) {
          onOpenDrawer(dayData.id);
        }
      }}
    >
      <CardHeader className="px-3 sm:px-3 md:px-4 pt-3 sm:pt-3 md:pt-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs sm:text-xs md:text-sm font-medium text-muted-foreground truncate flex-1">
            {dayName}
          </CardTitle>
          <div
            {...attributes}
            {...listeners}
            data-drag-handle
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-3 sm:px-3 md:px-4 pb-3 sm:pb-3 md:pb-4 space-y-2 min-h-0">
        {editingDayId === dayData.id ? (
          <div className="flex flex-col gap-2">
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
              className="h-7 sm:h-8 text-xs sm:text-sm font-semibold"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7"
                onClick={() => onSaveDayTitle(dayData.id)}
                disabled={updateDay.isPending || !editingDayTitle.trim()}
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7"
                onClick={onCancelEdit}
              >
                ×
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 flex flex-col">
              <h4 className="font-semibold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 line-clamp-2 leading-tight">
                {dayData.title}
              </h4>
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <Badge variant="secondary" className="text-[10px] sm:text-xs w-fit">
                  {dayData.items?.length ?? 0} {dayData.items?.length === 1 ? 'ex' : 'ex'}
                </Badge>
                {(dayData.items ?? []).length > 0 && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {dayData.items.reduce((sum: number, item: any) => sum + (item.sets || 0), 0)} sets
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 pt-2 mt-auto border-t">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDay(dayData.id);
                }}
              >
                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
              <div className="flex-1" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 sm:h-7 sm:w-7 opacity-70 hover:opacity-100 shrink-0"
                  >
                    <MoreVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem
                    onClick={() => onDuplicateDay(dayData.id)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onOpenCopyDialog(dayData.id)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy To...
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteDay(dayData.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Empty Slot Component (Droppable)
function EmptyDaySlot({
  dayName,
  slotIndex,
  onAddDay,
}: {
  dayName: string;
  slotIndex: number;
  onAddDay: (slot: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotIndex.toString(),
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-all min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] flex flex-col",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <CardHeader className="px-3 sm:px-3 md:px-4 pt-3 sm:pt-3 md:pt-4 pb-2">
        <CardTitle className="text-xs sm:text-xs md:text-sm font-medium text-muted-foreground text-center">
          {dayName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center px-3 sm:px-3 md:px-4 pb-3 sm:pb-3 md:pb-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-auto py-2 sm:py-3 md:py-4 gap-1.5 sm:gap-2 flex-col"
          onClick={() => onAddDay(slotIndex)}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground text-center leading-tight">
            {isOver ? "Drop here" : "Add Workout Day"}
          </span>
        </Button>
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
  const [localDays, setLocalDays] = useState<any[]>([]);

  const p = plan.data as any;

  // Initialize local days from plan data
  useEffect(() => {
    if (plan.data?.days && plan.data.days.length > 0) {
      // Sort days by order
      const sortedDays = [...plan.data.days].sort((a, b) => a.order - b.order);
      
      // Create array with 7 slots (Sunday = 0, Monday = 1, etc.)
      const weekSlots = Array(7).fill(null);
      
      // Map days to slots: order should directly map to slot (0-6)
      // This ensures drag-and-drop positions persist correctly
      sortedDays.forEach((day: any) => {
        // For weekly view, order values 0-6 map directly to slots 0-6
        if (day.order >= 0 && day.order < 7) {
          const slotIndex = day.order;
          // If slot is empty, assign day; otherwise skip (shouldn't happen if orders are unique)
          if (!weekSlots[slotIndex]) {
            weekSlots[slotIndex] = day;
          } else {
            // Conflict: day with same order already exists
            // This shouldn't happen, but if it does, find next available slot
            console.warn(`Order conflict: day ${day.id} has order ${day.order} but slot is taken`);
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
    useSensor(KeyboardSensor)
  );

  const exercises = api.exercise.list.useQuery(
    { q: searchQuery, take: 20 },
    { enabled: isAddExerciseDialogOpen }
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
    
    const order = targetSlot !== undefined ? targetSlot : (p?.days?.length ?? 0);
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
    const overSlotIndex = parseInt(over.id as string);
    
    // If dropping on a slot (slot index 0-6)
    if (!isNaN(overSlotIndex) && overSlotIndex >= 0 && overSlotIndex < 7) {
      const newDays = [...localDays];
      const activeDay = p?.days?.find((d: any) => d.id === activeDayId);
      
      if (!activeDay) return;
      
      // Find current position of dragged day
      const currentSlotIndex = newDays.findIndex((day) => day?.id === activeDayId);
      
      // Check if target slot already has a day (need to swap)
      const existingDayAtSlot = newDays[overSlotIndex];
      
      if (currentSlotIndex >= 0) {
        // Clear current slot
        newDays[currentSlotIndex] = null;
        
        // If target slot has a day, move it to the source slot (swap)
        if (existingDayAtSlot && existingDayAtSlot.id !== activeDayId) {
          // Update the swapped day's order to match its new slot position
          newDays[currentSlotIndex] = { ...existingDayAtSlot, order: currentSlotIndex };
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
    value: number
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Dumbbell className="h-10 w-10 animate-pulse mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    );
  }

  const totalExercises = p?.days?.reduce(
    (sum: number, d: any) => sum + (d.items?.length ?? 0),
    0
  ) ?? 0;

  return (
    <div className="flex-1 space-y-3 sm:space-y-4 p-4 sm:p-6 pt-4">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 sm:h-8 sm:w-8 shrink-0" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Edit Plan</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Customize your workout program
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => router.push(`/portal/log`)} 
          className="gap-2 w-full sm:w-auto h-9 sm:h-8"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Preview</span>
          <span className="sm:hidden">View Logs</span>
        </Button>
      </div>

      {/* Plan Name - Responsive */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 sm:px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-4 pb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Plan name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                }
              }}
              className="h-10 sm:h-9 flex-1"
            />
            <Button
              size="sm"
              onClick={handleSaveName}
              disabled={updateMeta.isPending || !planName}
              className="h-10 sm:h-9 w-full sm:w-auto"
            >
              <Save className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5" />
              {updateMeta.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {p?.days?.length ?? 0} {p?.days?.length === 1 ? 'day' : 'days'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>{totalExercises} {totalExercises === 1 ? 'exercise' : 'exercises'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Workout Days */}
      <div className="space-y-3 sm:space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-base md:text-lg font-semibold">Weekly Schedule</h3>
            <p className="text-xs sm:text-xs md:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Drag and drop workout days to rearrange. Click empty days to add workouts.
            </p>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localDays.filter((day) => day !== null).map((day) => day!.id)}
            strategy={horizontalListSortingStrategy}
            disabled={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3 sm:gap-3 md:gap-4">
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                (dayName, slotIndex) => {
                  const dayData = localDays[slotIndex];
                  
                  if (!dayData) {
                    return (
                      <EmptyDaySlot
                        key={slotIndex}
                        dayName={dayName}
                        slotIndex={slotIndex}
                        onAddDay={(slot) => {
                          setNewDayTitle(`${dayName} Workout`);
                          handleAddDay(slot);
                        }}
                      />
                    );
                  }
                  
                  return (
                    <SortableDayCard
                      key={dayData.id}
                      dayData={dayData}
                      dayName={dayName}
                      slotIndex={slotIndex}
                      onEditDay={(dayId) => handleStartEditDay(dayId, dayData.title)}
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
                    />
                  );
                }
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Day Dialog */}
        <Dialog open={isAddDayDialogOpen} onOpenChange={setIsAddDayDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Add New Workout Day</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                A workout day is a collection of exercises you'll do together in one session.
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
                      handleAddDay();
                    }
                  }}
                  className="h-10 sm:h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use descriptive names like "Push Day", "Pull Day", or day of the week.
                </p>
              </div>
              <Button
                className="w-full h-10 sm:h-9"
                onClick={() => handleAddDay()}
                disabled={!newDayTitle || addDay.isPending}
              >
                {addDay.isPending ? "Adding..." : "Create Workout Day"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

            {/* Exercise Drawer/Sheet */}
            {selectedDayId && (() => {
              const selectedDay = (p?.days ?? []).find((d: any) => d.id === selectedDayId);
              if (!selectedDay) return null;

              return (
                <Sheet open={!!selectedDayId} onOpenChange={(open) => !open && setSelectedDayId(null)}>
                  <SheetContent side="bottom" className="w-full max-h-[95vh] sm:max-h-[92vh] md:max-h-[85vh] overflow-y-auto p-0 flex flex-col">
                    <SheetHeader className="sticky top-0 bg-background z-10 pb-4 pt-6 px-6 border-b">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {editingDayId === selectedDay.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingDayTitle}
                                onChange={(e) => setEditingDayTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveDayTitle(selectedDay.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEditDay();
                                  }
                                }}
                                className="h-9 text-base font-semibold flex-1"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => handleSaveDayTitle(selectedDay.id)}
                                disabled={updateDay.isPending || !editingDayTitle.trim()}
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
                              <SheetTitle className="text-xl sm:text-2xl">{selectedDay.title}</SheetTitle>
                              <SheetDescription className="mt-2">
                                {selectedDay.items?.length ?? 0} {selectedDay.items?.length === 1 ? 'exercise' : 'exercises'}
                                {(selectedDay.items ?? []).length > 0 && (
                                  <span className="ml-2">
                                    • {selectedDay.items.reduce((sum: number, item: any) => sum + (item.sets || 0), 0)} total sets
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
                            onClick={() => handleStartEditDay(selectedDay.id, selectedDay.title)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-4">
                      {/* Add Exercise Button */}
                      <Button
                        className="w-full h-11 gap-2"
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
                          {(selectedDay.items ?? []).map((item: any, itemIndex: number) => (
                            <Card key={item.id} className="border shadow-sm">
                              <CardContent className="p-5 sm:p-4 space-y-4">
                                {/* Exercise Header */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base mb-2">
                                      {item.exercise?.name ?? item.exerciseId}
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                      {item.exercise?.muscleGroup && (
                                        <Badge variant="outline" className="text-xs">
                                          {item.exercise.muscleGroup}
                                        </Badge>
                                      )}
                                      {item.exercise?.equipment && (
                                        <Badge variant="outline" className="text-xs">
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
                                    <label className="text-xs font-medium text-muted-foreground">Sets</label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
                                      value={item.sets ?? 3}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          item.id,
                                          "sets",
                                          Number(e.target.value)
                                        )
                                      }
                                      onBlur={() => plan.refetch()}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Reps</label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
                                      value={item.reps ?? 10}
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          item.id,
                                          "reps",
                                          Number(e.target.value)
                                        )
                                      }
                                      onBlur={() => plan.refetch()}
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Weight (kg)</label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
                                      value={item.weight ?? ""}
                                      placeholder="0"
                                      onChange={(e) =>
                                        handleUpdateItem(
                                          item.id,
                                          "weight",
                                          Number(e.target.value)
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
                      ) : (
                        <div className="text-center py-12 px-4">
                          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <h3 className="font-semibold mb-2 text-lg">No exercises yet</h3>
                          <p className="text-sm text-muted-foreground mb-6">
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
                            <Plus className="h-4 w-4 mr-2" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">Add Exercise to Workout Day</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Search and select exercises to add to this workout session.
            </p>
          </DialogHeader>
          <div className="space-y-4 pt-4 flex-1 flex flex-col min-h-0">
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 sm:h-9 flex-shrink-0"
            />
            <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto space-y-2 flex-1">
              {exercises.data?.map((ex) => (
                <Button
                  key={ex.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 sm:py-2.5"
                  onClick={() => handleAddExercise(ex.id)}
                >
                  <div className="flex items-start gap-2.5 sm:gap-2 text-left w-full">
                    <Dumbbell className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-xs">{ex.name}</p>
                      <div className="flex gap-1.5 mt-1.5 sm:mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] sm:text-[9px] px-2 py-0.5 sm:px-1.5 sm:py-0">
                          {ex.muscleGroup}
                        </Badge>
                        {ex.equipment && (
                          <Badge variant="outline" className="text-[10px] sm:text-[9px] px-2 py-0.5 sm:px-1.5 sm:py-0">
                            {ex.equipment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
              {searchQuery && exercises.data?.length === 0 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-6 sm:py-4">
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
            <DialogTitle className="text-lg sm:text-xl">Copy Exercises To...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Select a day to copy exercises to:
            </p>
            <div className="max-h-[50vh] sm:max-h-[300px] overflow-y-auto space-y-2">
              {(p?.days ?? [])
                .filter((d: any) => d.id !== copyFromDayId)
                .map((day: any) => (
                  <Button
                    key={day.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 sm:py-2.5"
                    onClick={() => handleCopyExercises(day.id)}
                    disabled={copyExercises.isPending}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{day.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {day.items?.length ?? 0} {day.items?.length === 1 ? 'exercise' : 'exercises'}
                        </p>
                      </div>
                      <Copy className="h-4 w-4 ml-2 shrink-0" />
                    </div>
                  </Button>
                ))}
              {(p?.days ?? []).filter((d: any) => d.id !== copyFromDayId).length === 0 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-6 sm:py-4">
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
