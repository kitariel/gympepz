"use client";

import { useState, useEffect } from "react";
import { type DragEndEvent } from "@dnd-kit/core";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sortable,
  SortableContent,
  SortableItem,
} from "@/components/ui/sortable";
import { Button } from "@/components/ui/button";
import { RearrangeDayCard } from "./rearrange-day-card";
import type { PlanDay } from "../_types";

interface SortableItemData {
  id: string;
  day: PlanDay | null;
  originalIndex: number;
}

interface RearrangeDaySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: SortableItemData[];
  onDragEnd: (event: DragEndEvent) => Promise<void>;
}

export function RearrangeDaySheet({
  isOpen,
  onOpenChange,
  items,
  onDragEnd,
}: RearrangeDaySheetProps) {
  const [sheetItems, setSheetItems] = useState(items);

  useEffect(() => {
    if (isOpen) {
      setSheetItems(items);
    }
  }, [isOpen, items]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[95vh] w-full flex-col overflow-y-auto p-0 sm:max-h-[92vh] md:max-h-[85vh]"
      >
        <SheetHeader className="p-4 pb-2">
          <SheetTitle>Rearrange Schedule</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Sortable
            value={sheetItems}
            onValueChange={setSheetItems}
            onDragEnd={onDragEnd}
            getItemValue={(item) => item.id}
          >
            <div className="flex flex-col gap-2">
              <SortableContent>
                {sheetItems.map((item, index) => (
                  <SortableItem
                    className="mb-2"
                    key={item.id}
                    value={item.id}
                    asChild
                    asHandle
                  >
                    <RearrangeDayCard
                      item={item}
                      dayName={
                        [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ][index] ?? ""
                      }
                    />
                  </SortableItem>
                ))}
              </SortableContent>
            </div>
          </Sortable>
        </div>
        <div className="border-t p-4">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
