"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight, Check, X, Dumbbell, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkoutDay {
  date: Date;
  completed: boolean;
}

interface ScheduledDay {
  dayOfWeek: number;
  isRestDay: boolean;
}

interface MonthlyCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  workoutDays: WorkoutDay[];
  scheduledDays: ScheduledDay[];
  hasActiveWorkout?: boolean;
  hasDraft?: boolean;
}

export function MonthlyCalendar({
  currentMonth,
  onMonthChange,
  workoutDays,
  scheduledDays,
  hasActiveWorkout,
  hasDraft,
}: MonthlyCalendarProps) {
  const today = new Date();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const scheduledDayMap = useMemo(() => {
    const map = new Map<number, ScheduledDay>();
    scheduledDays.forEach((sd) => {
      map.set(sd.dayOfWeek, sd);
    });
    return map;
  }, [scheduledDays]);

  const workoutDaySet = useMemo(() => {
    const set = new Map<string, boolean>();
    workoutDays.forEach((wd) => {
      const key = format(wd.date, "yyyy-MM-dd");
      set.set(key, wd.completed);
    });
    return set;
  }, [workoutDays]);

  const getDayStatus = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();
    const scheduled = scheduledDayMap.get(dayOfWeek);
    const workoutCompleted = workoutDaySet.get(dateKey);
    const isPast = isBefore(date, today) && !isToday(date);
    const isTodayDate = isToday(date);
    const isInProgress = isTodayDate && (hasActiveWorkout || hasDraft);

    if (workoutCompleted === true) {
      return "completed";
    }
    if (isInProgress) {
      return "in-progress";
    }
    if (scheduled?.isRestDay) {
      return "rest";
    }
    if (scheduled && isPast && !workoutCompleted) {
      return "missed";
    }
    if (scheduled && !isPast) {
      return "scheduled";
    }
    if (isTodayDate) {
      return "today";
    }
    return "empty";
  };

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const monthStats = useMemo(() => {
    let completed = 0;
    let missed = 0;
    let scheduled = 0;

    calendarDays.forEach((date) => {
      if (!isSameMonth(date, currentMonth)) return;
      const status = getDayStatus(date);
      if (status === "completed") completed++;
      if (status === "missed") missed++;
      if (status === "scheduled") scheduled++;
    });

    return { completed, missed, scheduled };
  }, [calendarDays, currentMonth, getDayStatus]);

  return (
    <div className="space-y-3">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-bold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold text-muted-foreground uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <TooltipProvider delayDuration={100}>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            const status = getDayStatus(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayDate = isToday(date);

            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex h-8 w-full items-center justify-center rounded-md text-xs font-medium transition-all cursor-default",
                      !isCurrentMonth && "opacity-30",
                      isTodayDate && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                      // Status-based styling - simplified colors
                      status === "completed" &&
                        "bg-green-500 text-white",
                      status === "in-progress" &&
                        "bg-primary text-primary-foreground animate-pulse",
                      status === "missed" &&
                        "bg-destructive/80 text-destructive-foreground",
                      status === "scheduled" &&
                        "bg-primary/20 text-primary border border-primary/30",
                      status === "rest" &&
                        "bg-muted text-muted-foreground",
                      status === "today" &&
                        "bg-muted text-foreground",
                      status === "empty" &&
                        "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {status === "completed" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : status === "in-progress" ? (
                      <Dumbbell className="h-3.5 w-3.5" />
                    ) : status === "missed" ? (
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    ) : status === "rest" ? (
                      <Moon className="h-3 w-3" />
                    ) : status === "scheduled" ? (
                      <Dumbbell className="h-3 w-3" />
                    ) : (
                      <span>{format(date, "d")}</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{format(date, "EEE, MMM d")}</p>
                  <p className="text-muted-foreground">
                    {status === "completed" && "Workout Completed"}
                    {status === "in-progress" && "In Progress"}
                    {status === "missed" && "Missed Workout"}
                    {status === "scheduled" && "Workout Scheduled"}
                    {status === "rest" && "Rest Day"}
                    {status === "today" && "Today"}
                    {status === "empty" && "No workout scheduled"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
          <span className="text-[9px] text-muted-foreground">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/30 border border-primary/50" />
          <span className="text-[9px] text-muted-foreground">Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-destructive/80" />
          <span className="text-[9px] text-muted-foreground">Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-muted" />
          <span className="text-[9px] text-muted-foreground">Rest</span>
        </div>
      </div>

      {/* Month Summary */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {monthStats.completed}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            Completed
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-primary">
            {monthStats.scheduled}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            Upcoming
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-destructive">
            {monthStats.missed}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
            Missed
          </div>
        </div>
      </div>
    </div>
  );
}
