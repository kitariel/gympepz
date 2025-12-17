"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flame, Check, X, Coffee } from "lucide-react";

interface DayProgress {
  day: string;
  hasWorkout: boolean;
  isPast: boolean;
  isToday: boolean;
  isMissed: boolean;
  isRestDay?: boolean; // Future: can be marked as planned rest
}

interface WeeklyStreakCardProps {
  weekProgress: DayProgress[];
  longestStreak: number;
}

/**
 * Day States:
 * ✓ Green = Workout completed
 * ✗ Red = Missed workout (past day, no activity)
 * ☕ Blue = Rest day (planned recovery)
 * ⭕ Bordered = Today (current day)
 * ⚪ Gray = Future day (not yet reached)
 */

export function WeeklyStreakCard({
  weekProgress,
  longestStreak,
}: WeeklyStreakCardProps) {
  const weekCompletedDays = weekProgress.filter((d) => d.hasWorkout).length;

  const getMotivationalMessage = () => {
    if (weekCompletedDays >= 5) {
      return "You are on fire! Keep using the app to gain more streaks!";
    } else if (weekCompletedDays >= 3) {
      return "Great progress! Keep the momentum going 🔥";
    } else if (weekCompletedDays > 0) {
      return "Good start! Try to work out at least 3-4 times this week";
    }
    return "Start your first workout to begin your streak!";
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-xl p-5 border border-teal-500/20">
          {/* Flame Icon with Count */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full blur-xl opacity-30 scale-110" />
                <div className="relative bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full p-4 shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {weekCompletedDays}
                    </span>
                  </div>
                  <Flame className="h-16 w-16 text-white opacity-30" />
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-foreground mb-1">
              day streak this week!
            </div>
          </div>

          {/* Weekly Calendar - 7 Days (Mon-Sun) */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekProgress.map((day, idx) => {
              // Determine day state
              const isRestDay = day.isRestDay; // Future: can mark days as planned rest
              const isFutureDay = !day.isPast && !day.isToday;
              
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  {/* Day Label */}
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                    {day.day.slice(0, 3)}
                  </div>
                  
                  {/* Day Circle Indicator */}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all cursor-pointer ${
                      day.hasWorkout
                        ? // ✓ Workout Completed (Green)
                          "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/40 scale-105 hover:scale-110"
                        : isRestDay
                          ? // ☕ Rest Day (Blue) - Future feature
                            "bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/40"
                          : day.isMissed
                            ? // ✗ Missed Workout (Red)
                              "bg-red-500 shadow-lg shadow-red-500/40 hover:scale-105"
                            : day.isToday
                              ? // ⭕ Today (White/Bordered)
                                "bg-white dark:bg-secondary border-2 border-teal-500/70 shadow-md hover:border-teal-500"
                              : // ⚪ Future Day (Gray)
                                "bg-gray-200 dark:bg-secondary/50"
                    }`}
                    title={
                      day.hasWorkout
                        ? `${day.day}: Workout completed ✓`
                        : isRestDay
                          ? `${day.day}: Rest day`
                          : day.isMissed
                            ? `${day.day}: Missed workout`
                            : day.isToday
                              ? `${day.day}: Today`
                              : `${day.day}: Upcoming`
                    }
                  >
                    {/* Icons based on state */}
                    {day.hasWorkout ? (
                      <Check className="h-6 w-6 text-white" strokeWidth={3} />
                    ) : isRestDay ? (
                      <Coffee className="h-5 w-5 text-white" strokeWidth={2.5} />
                    ) : day.isMissed ? (
                      <X className="h-5 w-5 text-white" strokeWidth={3} />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600" />
              <span className="text-muted-foreground">Workout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full border-2 border-teal-500" />
              <span className="text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-secondary" />
              <span className="text-muted-foreground">Future</span>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="text-center pt-3 border-t border-teal-500/20">
            <div className="text-3xl font-bold text-foreground mb-1">
              {longestStreak}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Longest Streak
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center mt-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
