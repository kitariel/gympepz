"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Flame, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DayProgress {
  day: string;
  hasWorkout: boolean;
  isPast: boolean;
  isToday: boolean;
  isMissed: boolean;
}

interface ProfileHeaderProps {
  name: string;
  image?: string;
  memberSince: string;
  stats: {
    plans: number;
    workouts: number;
    prs: number;
  };
  weekProgress: DayProgress[];
  longestStreak: number;
}

export function ProfileHeader({
  name,
  image,
  memberSince,
  stats,
  weekProgress,
  longestStreak,
}: ProfileHeaderProps) {
  const router = useRouter();
  const weekCompletedDays = weekProgress.filter((d) => d.hasWorkout).length;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header Section with Avatar and Info */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-4">
        <div className="flex items-start gap-3">
          <Avatar
            className="size-14 ring-2 ring-white/30 cursor-pointer hover:ring-white/50 transition-all flex-shrink-0"
            onClick={() => router.push("/portal/account")}
          >
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">{name}</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Member since {memberSince}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 h-6 text-[10px] px-2"
              onClick={() => router.push("/portal/account")}
            >
              Edit
            </Button>
          </div>

          {/* Streak Badge */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative">
              <Flame className="h-8 w-8 text-white/90" />
              <div className="absolute -top-1 -right-1 bg-white rounded-full px-1.5 py-0.5">
                <span className="text-[10px] font-bold text-teal-700">
                  {weekCompletedDays}
                </span>
              </div>
            </div>
            <span className="text-[9px] text-white/80 font-medium">
              {longestStreak} max
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Quick Stats - Compact Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => router.push("/portal/plans")}
            className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-lg p-2.5 text-center hover:shadow-md transition-all group"
          >
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform">
              {stats.plans}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Plans
            </div>
          </button>
          <button
            onClick={() => router.push("/portal/log")}
            className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-lg p-2.5 text-center hover:shadow-md transition-all group"
          >
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform">
              {stats.workouts}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              Workouts
            </div>
          </button>
          <button
            onClick={() => router.push("/portal/log")}
            className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-lg p-2.5 text-center hover:shadow-md transition-all group"
          >
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-400 group-hover:scale-110 transition-transform">
              {stats.prs}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
              PRs
            </div>
          </button>
        </div>

        {/* Weekly Calendar - Compact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground">
              This Week
            </h4>
            <span className="text-[10px] text-muted-foreground">
              {weekCompletedDays}/7 days
            </span>
          </div>
          
          <div className="grid grid-cols-7 gap-1.5">
            {weekProgress.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                {/* Day Label */}
                <div className="text-[9px] font-medium text-muted-foreground uppercase">
                  {day.day.slice(0, 1)}
                </div>
                
                {/* Day Circle */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    day.hasWorkout
                      ? "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/30"
                      : day.isMissed
                        ? "bg-red-500 shadow-md shadow-red-500/30"
                        : day.isToday
                          ? "bg-white dark:bg-secondary border-2 border-teal-500 shadow-sm"
                          : "bg-gray-200 dark:bg-secondary/50"
                  }`}
                  title={
                    day.hasWorkout
                      ? `${day.day}: Workout completed ✓`
                      : day.isMissed
                        ? `${day.day}: Missed workout`
                        : day.isToday
                          ? `${day.day}: Today`
                          : `${day.day}: Upcoming`
                  }
                >
                  {day.hasWorkout ? (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  ) : day.isMissed ? (
                    <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Motivational Message */}
          {weekCompletedDays < 5 && (
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              {weekCompletedDays >= 3
                ? "Great progress! Keep it up 🔥"
                : weekCompletedDays > 0
                  ? "Good start! Aim for 3-4 workouts this week"
                  : "Start your first workout to begin your streak!"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
