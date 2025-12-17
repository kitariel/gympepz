"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
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
    <div className="space-y-6">
      {/* Month Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
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
                    "aspect-square p-2 rounded-lg border transition-colors relative",
                    !isCurrentMonth && "text-muted-foreground opacity-50",
                    isToday && "border-primary ring-2 ring-primary/20",
                    workout && "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-800",
                    !workout && "hover:bg-accent",
                    !isCurrentMonth && "cursor-default"
                  )}
                  disabled={!workout}
                >
                  <div className="text-sm font-medium">
                    {format(day, "d")}
                  </div>
                  {workout && (
                    <div className="absolute inset-x-0 bottom-1 flex justify-center">
                      <Dumbbell className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-primary" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border-green-200 dark:bg-green-950/20 flex items-center justify-center">
                <Dumbbell className="h-2.5 w-2.5 text-green-600 dark:text-green-400" />
              </div>
              <span>Workout completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workouts this month */}
      <Card>
        <CardHeader>
          <CardTitle>Workouts This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {calendar.data?.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => router.push(`/portal/log/workout/${log.id}`)}
              >
                <div>
                  <p className="font-medium">
                    {log.planDay?.title ?? "Untitled Workout"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(log.date), "EEEE, MMMM d")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {log.duration ? `${log.duration} mins` : "Completed"}
                  </p>
                  {log.totalVolume && (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(log.totalVolume)} kg
                    </p>
                  )}
                </div>
              </div>
            ))}

            {(!calendar.data || calendar.data.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workouts this month yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
