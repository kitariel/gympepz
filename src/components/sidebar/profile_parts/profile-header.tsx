"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Check, X, Target, Dumbbell, Award, TrendingUp, Clock } from "lucide-react";
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
  currentStreak: number;
  longestStreak: number;
  totalVolume: number;
  averageDuration: number;
}

export function ProfileHeader({
  name,
  image,
  memberSince,
  stats,
  weekProgress,
  currentStreak,
  longestStreak,
  totalVolume,
  averageDuration,
}: ProfileHeaderProps) {
  const router = useRouter();
  const weekCompletedDays = weekProgress.filter((d) => d.hasWorkout).length;

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700">
      {/* Header Section with Avatar and Info */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar
            className="size-16 ring-3 ring-white/40 cursor-pointer hover:ring-white/60 hover:scale-105 transition-all flex-shrink-0 shadow-lg"
            onClick={() => router.push("/portal/account")}
          >
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-white/25 text-white text-base font-bold">
              {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white truncate">{name}</h3>
              {currentStreak > 0 && (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] px-1.5 py-0.5 h-5 border-0">
                  <Flame className="h-2.5 w-2.5 mr-1" />
                  {currentStreak}
                </Badge>
              )}
            </div>
            <p className="text-xs text-white/90 mt-0.5 font-medium">
              Member since {memberSince}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-6 text-[10px] px-2.5 bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => router.push("/portal/account")}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Current Streak - Prominent Display */}
        {currentStreak > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Flame className="h-5 w-5 text-orange-300" />
                </div>
                <div>
                  <p className="text-xs text-white/90 font-medium">Current Streak</p>
                  <p className="text-lg font-bold text-white">{currentStreak} {currentStreak === 1 ? 'day' : 'days'} 🔥</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/80">Best: {longestStreak} days</p>
                <p className="text-[10px] text-white/70 mt-0.5">
                  {currentStreak >= longestStreak ? 'New record!' : `${longestStreak - currentStreak} to beat`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Stats Section */}
      <div className="px-4 pb-3 bg-white/10 backdrop-blur-sm">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => router.push("/portal/plans")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-all group"
          >
            <Target className="h-4 w-4 text-white/90 group-hover:scale-110 transition-transform" />
            <span className="text-base font-bold text-white">{stats.plans}</span>
            <span className="text-[9px] text-white/80 font-medium">Plans</span>
          </button>
          
          <button
            onClick={() => router.push("/portal/log")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-all group"
          >
            <Dumbbell className="h-4 w-4 text-white/90 group-hover:scale-110 transition-transform" />
            <span className="text-base font-bold text-white">{stats.workouts}</span>
            <span className="text-[9px] text-white/80 font-medium">Workouts</span>
          </button>
          
          <button
            onClick={() => router.push("/portal/log")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-all group"
          >
            <TrendingUp className="h-4 w-4 text-white/90 group-hover:scale-110 transition-transform" />
            <span className="text-base font-bold text-white">
              {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : '0'}
            </span>
            <span className="text-[9px] text-white/80 font-medium">kg</span>
          </button>
          
          <button
            onClick={() => router.push("/portal/log")}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-all group"
          >
            <Award className="h-4 w-4 text-white/90 group-hover:scale-110 transition-transform" />
            <span className="text-base font-bold text-white">{stats.prs}</span>
            <span className="text-[9px] text-white/80 font-medium">PRs</span>
          </button>
        </div>
        
        {averageDuration > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-center gap-1.5">
            <Clock className="h-3 w-3 text-white/80" />
            <span className="text-[10px] text-white/90 font-medium">
              Avg: {averageDuration} min/workout
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3 bg-background">
        {/* Weekly Calendar - Enhanced */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              This Week
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {weekCompletedDays}/7
              </span>
              <span className="text-[10px] text-muted-foreground">days</span>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekProgress.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                {/* Day Label */}
                <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {day.day.slice(0, 1)}
                </div>
                
                {/* Day Circle - Enhanced */}
                <div
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
                    day.hasWorkout
                      ? "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/40 ring-2 ring-teal-400/30"
                      : day.isMissed
                        ? "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/40 ring-2 ring-red-400/30"
                        : day.isToday
                          ? "bg-background border-2 border-teal-500 shadow-md ring-2 ring-teal-500/20"
                          : "bg-muted/60 border border-border/50"
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
                    <Check className="h-4.5 w-4.5 text-white" strokeWidth={3.5} />
                  ) : day.isMissed ? (
                    <X className="h-4 w-4 text-white" strokeWidth={3.5} />
                  ) : day.isToday ? (
                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${(weekCompletedDays / 7) * 100}%` }}
              />
            </div>
            {/* Motivational Message */}
            <p className="text-[11px] text-muted-foreground text-center font-medium">
              {weekCompletedDays >= 5
                ? "🔥 Amazing week! You're crushing it!"
                : weekCompletedDays >= 3
                  ? "Great progress! Keep the momentum going 💪"
                  : weekCompletedDays > 0
                    ? "Good start! Aim for 3-4 workouts this week"
                    : "Start your first workout to begin your journey! 🚀"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
