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
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-teal-600" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={nextMonth}>
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
                className="text-center text-[10px] font-medium text-muted-foreground py-1.5"
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
                    "aspect-square p-1.5 rounded-lg border transition-colors relative text-xs",
                    !isCurrentMonth && "text-muted-foreground opacity-50",
                    isToday && "border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/50 dark:bg-teal-950/20",
                    workout && "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800",
                    !workout && !isToday && "hover:bg-accent/50",
                    !isCurrentMonth && "cursor-default"
                  )}
                  disabled={!workout && !isToday}
                >
                  <div className="text-xs font-medium">
                    {format(day, "d")}
                  </div>
                  {workout && (
                    <div className="absolute inset-x-0 bottom-0.5 flex justify-center">
                      <Dumbbell className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend - Compact */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border-2 border-teal-500" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-50 border-green-200 dark:bg-green-950/20 flex items-center justify-center">
                <Dumbbell className="h-2 w-2 text-green-600 dark:text-green-400" />
              </div>
              <span>Workout</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workouts this month - Compact */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm">Workouts This Month</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {calendar.data?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 cursor-pointer hover:bg-accent/50 hover:border-accent transition-all group"
                onClick={() => router.push(`/portal/log/workout/${log.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {log.planDay?.title ?? "Untitled Workout"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(log.date), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="text-xs font-medium">
                    {log.duration ? `${log.duration}m` : "Completed"}
                  </p>
                  {log.totalVolume && (
                    <p className="text-[10px] text-muted-foreground">
                      {Math.round(log.totalVolume)} kg
                    </p>
                  )}
                </div>
              </div>
            ))}

            {(!calendar.data || calendar.data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No workouts this month yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
