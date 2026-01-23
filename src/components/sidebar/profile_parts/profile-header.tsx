"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Flame, Settings, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  name: string;
  image?: string;
  memberSince: string;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
}

export function ProfileHeader({
  name,
  image,
  memberSince,
  currentStreak,
  longestStreak,
  totalWorkouts,
}: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

      <div className="relative p-4 pb-5">
        {/* User Info Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentStreak > 0 && (
                <div className="absolute -inset-1 rounded-full bg-primary/40 animate-pulse" />
              )}
              <Avatar
                className={cn(
                  "relative h-14 w-14 cursor-pointer border-2 shadow-lg transition-transform hover:scale-105",
                  currentStreak > 0 ? "border-primary" : "border-background"
                )}
                onClick={() => router.push("/portal/account")}
              >
                <AvatarImage src={image} alt={name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="max-w-[130px] truncate text-lg font-bold leading-tight text-foreground">
                {name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Since {memberSince}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => router.push("/portal/account")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Streak & Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Current Streak */}
          <div
            className={cn(
              "relative overflow-hidden rounded-xl p-3 text-center transition-all",
              currentStreak > 0
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-foreground"
            )}
          >
            {currentStreak > 0 && (
              <div className="absolute top-1 right-1">
                <Flame className="h-4 w-4 text-primary-foreground/70" />
              </div>
            )}
            <div className="text-2xl font-black tracking-tight">
              {currentStreak}
            </div>
            <div
              className={cn(
                "text-[9px] font-semibold uppercase tracking-wider",
                currentStreak > 0 ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              Day Streak
            </div>
          </div>

          {/* Longest Streak */}
          <div className="rounded-xl bg-muted/50 p-3 text-center hover:bg-muted/70 transition-colors">
            <div className="flex items-center justify-center">
              <Trophy className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-xl font-bold text-foreground mt-0.5">
              {longestStreak}
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Best Streak
            </div>
          </div>

          {/* Total Workouts */}
          <div className="rounded-xl bg-muted/50 p-3 text-center hover:bg-muted/70 transition-colors">
            <div className="flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-xl font-bold text-foreground mt-0.5">
              {totalWorkouts}
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workouts
            </div>
          </div>
        </div>

        {/* Motivational Banner */}
        {currentStreak >= 7 && (
          <div className="mt-3 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-center">
            <p className="text-xs font-semibold text-primary">
              {currentStreak >= 30
                ? "Legendary! 30+ day streak!"
                : currentStreak >= 14
                  ? "On fire! 2 weeks strong!"
                  : "Amazing! 1 week streak!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
