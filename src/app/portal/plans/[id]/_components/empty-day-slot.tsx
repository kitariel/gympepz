"use client";

import { useSortableItemContext } from "@/components/ui/sortable";
import { EmptyDaySlotContent } from "./empty-day-slot-content";

interface EmptyDaySlotProps {
  dayName: string;
  slotIndex: number;
  onAddDay: (slot: number, dayName?: string) => void;
  isCurrentDay?: boolean;
}

export function EmptyDaySlot({
  dayName,
  slotIndex,
  onAddDay,
  isCurrentDay = false,
}: EmptyDaySlotProps) {
  const { isOver } = useSortableItemContext("EmptyDaySlot");

  return (
    <EmptyDaySlotContent
      dayName={dayName}
      onAddDay={() => onAddDay(slotIndex, dayName)}
      isCurrentDay={isCurrentDay}
      isOver={isOver}
    />
  );
}
