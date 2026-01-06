"use client";

import { cn } from "@/lib/utils";
import type { PlanDay } from "../_types";
import { Moon } from "lucide-react";

interface MobileDayNavigatorProps {
  days: (PlanDay | null)[];
  currentDayOfWeek: number;
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_FULL_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function MobileDayNavigator({
  days,
  currentDayOfWeek,
  selectedDayIndex,
  onSelectDay,
}: MobileDayNavigatorProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:hidden">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-foreground text-lg font-bold">
          {DAY_FULL_NAMES[selectedDayIndex]}
        </h3>
        <span className="text-muted-foreground text-xs font-medium">
          {selectedDayIndex === currentDayOfWeek ? "Today" : ""}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {DAY_LABELS.map((label, index) => {
          const day = days[index];
          const isSelected = selectedDayIndex === index;
          const isToday = currentDayOfWeek === index;
          const hasContent = day && (day.items?.length ?? 0) > 0;
          const isRestDay = day?.isRestDay;

          return (
            <button
              key={index}
              onClick={() => onSelectDay(index)}
              className={cn(
                "relative flex h-16 w-full flex-col items-center justify-center rounded-xl border transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent",
                isToday &&
                  !isSelected &&
                  "border-primary/20 bg-primary/5 text-primary",
              )}
            >
              <span className="text-sm font-bold">{label}</span>
              <span className="text-[10px] font-medium opacity-70">
                {isRestDay ? "Rest" : day ? day.title || "Workout" : "Empty"}
              </span>

              {/* Status Indicators */}
              <div className="absolute top-2 right-2 flex gap-1">
                {isRestDay && (
                  <Moon className="text-muted-foreground/50 h-3 w-3" />
                )}
                {hasContent && !isRestDay && (
                  <div className="bg-primary/70 h-1.5 w-1.5 rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
