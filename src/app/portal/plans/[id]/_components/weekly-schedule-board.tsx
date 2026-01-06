"use client";

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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { DayCardContent } from "./day-card-content";
import { EmptyDaySlotContent } from "./empty-day-slot-content";
import { MobileDayNavigator } from "./mobile-day-navigator";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  isCurrentDay = false,
}: {
  dayData: PlanDay;
  dayName: string;
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

  return (
    <DayCardContent
      dayData={dayData}
      dayName={dayName}
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
      isCurrentDay={isCurrentDay}
      innerRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
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
    <EmptyDaySlotContent
      innerRef={setNodeRef}
      dayName={dayName}
      onAddDay={() => onAddDay(slotIndex, dayName)}
      isCurrentDay={isCurrentDay}
      isOver={isOver}
    />
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

  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayOfWeek);
  const [isRearrangeMode, setIsRearrangeMode] = useState(false);

  return (
    <div className="relative w-full">
      <div className="mb-4 flex justify-end px-1 md:hidden">
        <Button
          variant={isRearrangeMode ? "default" : "outline"}
          size="sm"
          className="h-8 gap-2 text-xs"
          onClick={() => setIsRearrangeMode(!isRearrangeMode)}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {isRearrangeMode ? "Done Rearranging" : "Re-arrange Workout"}
        </Button>
      </div>

      {!isRearrangeMode && (
        <MobileDayNavigator
          days={localDays}
          currentDayOfWeek={currentDayOfWeek}
          selectedDayIndex={selectedDayIndex}
          onSelectDay={setSelectedDayIndex}
        />
      )}
      {/* Enhanced Fade gradients for scroll indicators - Desktop only */}
      <div className="from-background via-background/80 pointer-events-none absolute top-0 left-0 z-10 hidden h-full w-12 bg-linear-to-r to-transparent md:block" />
      <div className="from-background via-background/80 pointer-events-none absolute top-0 right-0 z-10 hidden h-full w-12 bg-linear-to-l to-transparent md:block" />

      <div className="md:scrollbar-thin md:scrollbar-thumb-muted-foreground/30 md:scrollbar-track-transparent md:hover:scrollbar-thumb-muted-foreground/50 pb-5 md:overflow-x-auto md:overflow-y-visible md:px-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={localDays
              .filter((day) => day !== null)
              .map((day) => day?.id)}
            strategy={rectSortingStrategy}
            disabled={false}
          >
            {/* Board Columns - Responsive Layout */}
            {/* 
              Mobile: 
                - Normal mode: Vertical stack but only show selected day (via MobileDayNavigator)
                - Rearrange mode: Vertical stack showing all days for DnD
              Desktop: Horizontal row, fixed width cards
            */}
            <div
              className={cn(
                "flex flex-col gap-5 pb-3 md:min-w-[2500px] md:flex-row",
                isRearrangeMode ? "min-h-[calc(100vh-200px)]" : "",
              )}
            >
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
                const isSelected = slotIndex === selectedDayIndex;

                // Logic for visibility:
                // 1. Desktop (md:block): Always visible
                // 2. Mobile (!md):
                //    - If Rearrange Mode: Always visible (to allow dragging)
                //    - If Normal Mode: Only visible if selected
                const isVisibleOnMobile = isRearrangeMode || isSelected;

                return (
                  <div
                    key={slotIndex}
                    className={cn(
                      "w-full transition-all duration-300 md:w-auto",
                      !isVisibleOnMobile && "hidden md:block",
                      // In rearrange mode on mobile, scale down slightly to see more context
                      isRearrangeMode &&
                        "origin-top scale-95 md:transform-none",
                    )}
                  >
                    {!dayData ? (
                      <EmptyDaySlot
                        dayName={dayName}
                        slotIndex={slotIndex}
                        onAddDay={(slot, name) => {
                          if (name) {
                            onAddDay(slot, name);
                          } else {
                            onAddDay(slot);
                          }
                        }}
                        isCurrentDay={isCurrentDay}
                      />
                    ) : (
                      <SortableDayCard
                        dayData={dayData}
                        dayName={dayName}
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
                        isCurrentDay={isCurrentDay}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
