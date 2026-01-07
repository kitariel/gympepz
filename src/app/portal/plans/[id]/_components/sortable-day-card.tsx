"use client";

import { GripVertical } from "lucide-react";
import { SortableItemHandle } from "@/components/ui/sortable";
import { DayCardContent } from "./day-card-content";
import type { PlanDay } from "../_types";

interface SortableDayCardProps {
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
}

export function SortableDayCard({
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
}: SortableDayCardProps) {
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
      dragHandle={
        <SortableItemHandle
          data-drag-handle
          className="hover:bg-muted cursor-grab touch-none rounded-md p-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="text-muted-foreground h-4 w-4" />
        </SortableItemHandle>
      }
    />
  );
}
