"use client";

import { type DragEndEvent } from "@dnd-kit/core";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { MobileDayNavigator } from "./mobile-day-navigator";
import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sortable,
  SortableContent,
  SortableItem,
} from "@/components/ui/sortable";
import type { PlanDay, Plan } from "../_types";
import { SortableDayCard } from "./sortable-day-card";
import { EmptyDaySlot } from "./empty-day-slot";
import { RearrangeDaySheet } from "./rearrange-day-sheet";

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
  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDayOfWeek);
  const [isRearrangeDialogOpen, setIsRearrangeDialogOpen] = useState(false);

  const sortableItems = useMemo(
    () =>
      localDays.map((day, index) => ({
        id: day?.id ?? index.toString(),
        day,
        originalIndex: index,
      })),
    [localDays],
  );

  return (
    <div className="relative w-full">
      <div className="mb-4 flex justify-end px-1 md:hidden">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs"
          onClick={() => setIsRearrangeDialogOpen(true)}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          Re-arrange Workout
        </Button>
      </div>

      <MobileDayNavigator
        days={localDays}
        currentDayOfWeek={currentDayOfWeek}
        selectedDayIndex={selectedDayIndex}
        onSelectDay={setSelectedDayIndex}
      />
      <div className="from-background via-background/80 pointer-events-none absolute top-0 left-0 z-10 hidden h-full w-12 bg-linear-to-r to-transparent md:block" />
      <div className="from-background via-background/80 pointer-events-none absolute top-0 right-0 z-10 hidden h-full w-12 bg-linear-to-l to-transparent md:block" />

      <div className="md:scrollbar-thin md:scrollbar-thumb-muted-foreground/30 md:scrollbar-track-transparent md:hover:scrollbar-thumb-muted-foreground/50 pb-5 md:overflow-x-auto md:overflow-y-visible md:px-6">
        <Sortable
          value={sortableItems}
          onDragEnd={onDragEnd}
          getItemValue={(item) => item.id}
          orientation="horizontal"
        >
          <SortableContent strategy={rectSortingStrategy}>
            <div className="flex flex-col gap-5 pb-3 md:min-w-[2500px] md:flex-row">
              {sortableItems.map((item, index) => {
                const dayName =
                  [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ][index] ?? "";
                const isCurrentDay = index === currentDayOfWeek;
                const isSelected = index === selectedDayIndex;
                const isVisibleOnMobile = isSelected;

                return (
                  <SortableItem
                    key={item.id}
                    value={item.id}
                    className={cn(
                      "w-full transition-all duration-300 md:w-auto",
                      !isVisibleOnMobile && "hidden md:block",
                    )}
                  >
                    {item.day ? (
                      <SortableDayCard
                        dayData={item.day}
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
                    ) : (
                      <EmptyDaySlot
                        dayName={dayName}
                        slotIndex={index}
                        onAddDay={onAddDay}
                        isCurrentDay={isCurrentDay}
                      />
                    )}
                  </SortableItem>
                );
              })}
            </div>
          </SortableContent>
        </Sortable>
      </div>

      <RearrangeDaySheet
        isOpen={isRearrangeDialogOpen}
        onOpenChange={setIsRearrangeDialogOpen}
        items={sortableItems}
        onDragEnd={onDragEnd}
      />
    </div>
  );
}
