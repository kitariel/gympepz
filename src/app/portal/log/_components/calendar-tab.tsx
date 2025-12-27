"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  // Add empty cells for days before month starts
  const calendarDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...daysInMonth,
  ];

  const getWorkoutForDay = (day: Date) => {
    return calendar.data?.find((log) =>
      isSameDay(new Date(log.date), day)
    );
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation - Compact */}
      <Card className="border-0 shadow-sm ring-1 ring-border bg-card">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" onClick={previousMonth}>
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
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" onClick={nextMonth}>
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
                className="text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70 py-1.5"
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
                  onClick={() => workout && router.push(`/portal/log/workout/${workout.id}`)}
                  className={cn(
                    "aspect-square p-1.5 rounded-lg ring-1 ring-border/50 transition-all relative text-xs flex flex-col items-center justify-center",
                    !isCurrentMonth && "text-muted-foreground/30 ring-border/30",
                    isToday && "ring-2 ring-primary bg-primary/5 font-semibold text-primary",
                    workout && "bg-primary/10 ring-primary/30 hover:bg-primary/20 hover:ring-primary/50",
                    !workout && !isToday && isCurrentMonth && "hover:bg-muted hover:ring-border",
                    !isCurrentMonth && "cursor-default hover:bg-transparent"
                  )}
                  disabled={!workout && !isToday}
                >
                  <span className={cn(
                    "text-xs",
                    isToday && "font-bold"
                  )}>
                    {format(day, "d")}
                  </span>
                  {workout && (
                    <div className="absolute inset-x-0 bottom-1 flex justify-center">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend - Compact */}
          <div className="flex items-center justify-end gap-4 mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-primary bg-primary/5" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary/20" />
              <span>Workout</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workouts this month - Compact */}
      <Card className="border-0 shadow-sm ring-1 ring-border bg-card">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base font-bold">Workouts This Month</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {calendar.data?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg ring-1 ring-border bg-card cursor-pointer hover:shadow-md hover:ring-primary/20 transition-all group"
                onClick={() => router.push(`/portal/log/workout/${log.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {log.planDay?.title ?? "Untitled Workout"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-1 font-medium">
                    {format(new Date(log.date), "EEEE, MMM d")}
                  </p>
                </div>
                <div className="text-right ml-4 shrink-0 flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span>{log.duration ? `${log.duration}` : "--"}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">MINS</span>
                  </div>
                  {log.totalVolume && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                       <span>{Math.round(log.totalVolume).toLocaleString()}</span>
                       <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">KG</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(!calendar.data || calendar.data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground/50">
                <Dumbbell className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No workouts this month</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
