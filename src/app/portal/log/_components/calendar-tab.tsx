"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CalendarTabProps {
  userId: string;
}

export function CalendarTab({ userId }: CalendarTabProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendar = api.workoutLog.calendar.useQuery({
    userId,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  // Add empty cells for days before month starts
  const calendarDays = [
    ...(Array.from({ length: firstDayOfWeek }).fill(null) as null[]),
    ...daysInMonth,
  ];

  const getWorkoutForDay = (day: Date) => {
    return calendar.data?.find((log) => isSameDay(new Date(log.date), day));
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation - Compact */}
      <Card className="ring-border bg-card border-0 shadow-sm ring-1">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <CalendarIcon className="text-primary h-4 w-4" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted h-8 w-8 p-0"
                onClick={previousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-muted h-8 w-8 p-0"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-muted-foreground/70 py-1.5 text-center text-[10px] font-semibold tracking-wider uppercase"
              >
                {day.slice(0, 1)}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const workout = getWorkoutForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() =>
                    workout && router.push(`/portal/log/workout/${workout.id}`)
                  }
                  className={cn(
                    "ring-border/50 relative flex aspect-square flex-col items-center justify-center rounded-lg p-1.5 text-xs ring-1 transition-all",
                    !isCurrentMonth &&
                      "text-muted-foreground/30 ring-border/30",
                    isToday &&
                      "ring-primary bg-primary/5 text-primary font-semibold ring-2",
                    workout &&
                      "bg-primary/10 ring-primary/30 hover:bg-primary/20 hover:ring-primary/50",
                    !workout &&
                      !isToday &&
                      isCurrentMonth &&
                      "hover:bg-muted hover:ring-border",
                    !isCurrentMonth && "cursor-default hover:bg-transparent",
                  )}
                  disabled={!workout && !isToday}
                >
                  <span className={cn("text-xs", isToday && "font-bold")}>
                    {format(day, "d")}
                  </span>
                  {workout && (
                    <div className="absolute inset-x-0 bottom-1 flex justify-center">
                      <div className="bg-primary h-1 w-1 rounded-full" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend - Compact */}
          <div className="border-border/50 text-muted-foreground mt-4 flex items-center justify-end gap-4 border-t pt-3 text-[10px] font-medium tracking-wider uppercase">
            <div className="flex items-center gap-1.5">
              <div className="border-primary bg-primary/5 h-2 w-2 rounded-full border" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="bg-primary/20 h-2 w-2 rounded-full" />
              <span>Workout</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workouts this month - Compact */}
      <Card className="ring-border bg-card border-0 shadow-sm ring-1">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base font-bold">
            Workouts This Month
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {calendar.data?.map((log) => (
              <div
                key={log.id}
                className="ring-border bg-card hover:ring-primary/20 group flex cursor-pointer items-center justify-between rounded-lg p-3 ring-1 transition-all hover:shadow-md"
                onClick={() => router.push(`/portal/log/workout/${log.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {log.planDay?.title ?? "Untitled Workout"}
                  </p>
                  <p className="text-muted-foreground/70 mt-1 text-[10px] font-medium tracking-wider uppercase">
                    {format(new Date(log.date), "EEEE, MMM d")}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 flex-col items-end gap-0.5 text-right">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <span>{log.duration ? `${log.duration}` : "--"}</span>
                    <span className="text-muted-foreground/60 text-[10px] tracking-wider uppercase">
                      MINS
                    </span>
                  </div>
                  {log.totalVolume && (
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                      <span>
                        {Math.round(log.totalVolume).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground/60 text-[10px] tracking-wider uppercase">
                        KG
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(!calendar.data || calendar.data.length === 0) && (
              <div className="text-muted-foreground/50 py-8 text-center">
                <Dumbbell className="mx-auto mb-3 h-8 w-8 opacity-30" />
                <p className="text-sm font-medium">No workouts this month</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
