"use client";

import { useMemo, useState } from "react";
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgramTemplate } from "@/lib/program-templates/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TemplateDayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Convert JavaScript Date.getDay() (0=Sunday, 1=Monday, ..., 6=Saturday)
 * to TemplateDayNumber (1=Monday, 2=Tuesday, ..., 7=Sunday)
 */
function getTemplateDayNumber(date: Date): TemplateDayNumber {
  const dayOfWeek = getDay(date); // 0-6
  if (dayOfWeek === 0) return 7; // Sunday
  return dayOfWeek as TemplateDayNumber;
}

interface CalendarDayInfo {
  date: Date;
  isWorkoutDay: boolean;
  isRestDay: boolean;
  label: string | undefined;
  exerciseCount: number;
  dayIndex: number | undefined;
}

function projectTemplateToMonth(template: ProgramTemplate, month: Date): Map<string, CalendarDayInfo> {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const dayMap = new Map<string, CalendarDayInfo>();
  const templateDays = template.plan.days;

  daysInMonth.forEach((date) => {
    const templateDayNumber = getTemplateDayNumber(date);
    const templateDay = templateDays.find((d) => d.day === templateDayNumber);
    
    const dateKey = date.toISOString().split("T")[0]!;
    
    dayMap.set(dateKey, {
      date,
      isWorkoutDay: !!templateDay && !templateDay.isRestDay && templateDay.items.length > 0,
      isRestDay: templateDay?.isRestDay ?? false,
      label: templateDay?.label,
      exerciseCount: templateDay?.items.length ?? 0,
      dayIndex: templateDay?.day,
    });
  });

  return dayMap;
}

interface TemplateCalendarPreviewProps {
  template: ProgramTemplate;
}

export function TemplateCalendarPreview({ template }: TemplateCalendarPreviewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const dayInfoMap = useMemo(
    () => projectTemplateToMonth(template, currentMonth),
    [template, currentMonth]
  );

  // Get workout and rest day dates for modifiers
  const workoutDays = useMemo(() => {
    const dates: Date[] = [];
    dayInfoMap.forEach((info, dateKey) => {
      if (info.isWorkoutDay) {
        dates.push(info.date);
      }
    });
    return dates;
  }, [dayInfoMap]);

  const restDays = useMemo(() => {
    const dates: Date[] = [];
    dayInfoMap.forEach((info) => {
      if (info.isRestDay && !info.isWorkoutDay) {
        dates.push(info.date);
      }
    });
    return dates;
  }, [dayInfoMap]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setCurrentMonth(startOfMonth(date));
    }
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  // Adjust to Monday (if Sunday, go back 6 days; otherwise go back to Monday)
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToMonday);
  
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((date, idx) => {
            const dateKey = date.toISOString().split("T")[0]!;
            const dayInfo = dayInfoMap.get(dateKey);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isWorkoutDay = dayInfo?.isWorkoutDay ?? false;
            const isRestDay = dayInfo?.isRestDay ?? false;
            const dayIsToday = isToday(date);
            const dayNumber = date.getDate();

            return (
              <Tooltip key={idx}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex items-center justify-center h-12 text-sm transition-colors",
                      !isCurrentMonth && "text-muted-foreground/40"
                    )}
                  >
                    {dayIsToday ? (
                      <span
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-full font-semibold",
                          isWorkoutDay
                            ? "bg-primary text-primary-foreground"
                            : isRestDay
                              ? "bg-muted text-muted-foreground"
                              : "bg-accent text-accent-foreground"
                        )}
                      >
                        {dayNumber}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-full",
                          isWorkoutDay
                            ? "bg-primary text-primary-foreground font-medium"
                            : isRestDay
                              ? "bg-muted/50 text-muted-foreground"
                              : "text-foreground"
                        )}
                      >
                        {dayNumber}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                {dayInfo && (isWorkoutDay || isRestDay) && (
                  <TooltipContent>
                    <div className="space-y-1">
                      {dayInfo.label && <p className="font-medium">{dayInfo.label}</p>}
                      {isWorkoutDay && (
                        <p className="text-xs text-muted-foreground">
                          {dayInfo.exerciseCount} {dayInfo.exerciseCount === 1 ? "exercise" : "exercises"}
                        </p>
                      )}
                      {isRestDay && <p className="text-xs text-muted-foreground">Rest day</p>}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-medium">
            1
          </span>
          <span>Workout day</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground text-[10px]">
            1
          </span>
          <span>Rest day</span>
        </div>
      </div>
    </div>
  );
}
