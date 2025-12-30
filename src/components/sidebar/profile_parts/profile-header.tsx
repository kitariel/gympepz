"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Settings, Check, Circle, Moon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayProgress {
  day: string;
  hasWorkout: boolean;
  isPast: boolean;
  isToday: boolean;
  isMissed: boolean;
  date: Date;
  isRestDay?: boolean;
  isInProgress?: boolean;
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
  weekProgress,
  currentStreak,
}: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-background relative overflow-hidden border-b p-4 pb-6">
      {/* Background decoration */}
      <div className="from-primary/10 via-primary/5 absolute top-0 right-0 left-0 -z-10 h-24 bg-gradient-to-br to-transparent" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            className="border-background h-14 w-14 cursor-pointer border-2 shadow-sm transition-transform hover:scale-105"
            onClick={() => router.push("/portal/account")}
          >
            <AvatarImage src={image} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="max-w-[140px] truncate text-lg leading-tight font-bold">
              {name}
            </h3>
            <p className="text-muted-foreground text-xs">
              Member since {memberSince}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={() => router.push("/portal/account")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {/* Weekly Consistency Visual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">This Week</span>
            {currentStreak > 0 && (
              <Badge
                variant="secondary"
                className="h-5 gap-1 border-orange-200 bg-orange-50 px-1.5 text-[10px] font-medium text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400"
              >
                <Flame className="h-3 w-3 fill-orange-500 text-orange-500" />
                {currentStreak} day streak
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between gap-1">
            <TooltipProvider delayDuration={100}>
              {weekProgress.map((day, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div className="group flex cursor-default flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
                          day.isRestDay
                            ? day.isPast || day.isToday
                              ? "bg-primary/80 border-primary/80 text-primary-foreground shadow-sm"
                              : "bg-primary/40 border-primary/60 text-primary/80 shadow-sm"
                            : day.isInProgress
                              ? "bg-amber-500 border-amber-500 text-white shadow-sm animate-pulse"
                              : day.hasWorkout
                                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                : day.isToday
                                  ? "border-primary bg-primary/5 text-primary border-dashed"
                                  : day.isMissed
                                    ? "bg-muted text-muted-foreground/50 border-transparent"
                                    : "bg-muted/50 text-muted-foreground/30 border-transparent",
                        )}
                      >
                        {day.isRestDay ? (
                          <Moon className="h-3.5 w-3.5 fill-current" />
                        ) : day.isInProgress ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : day.hasWorkout ? (
                          <Check className="h-4 w-4" />
                        ) : day.isToday ? (
                          <Circle className="h-3 w-3 fill-current opacity-50" />
                        ) : (
                          <span className="text-[10px] font-medium">
                            {day.day[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p>{day.day}</p>
                    <p className="text-muted-foreground font-normal">
                      {day.isRestDay
                        ? day.isPast || day.isToday
                          ? "Rest Day ✓"
                          : "Rest Day (Scheduled)"
                        : day.isInProgress
                          ? "In Progress"
                          : day.hasWorkout
                            ? "Workout Completed"
                            : day.isToday
                              ? "Today"
                              : day.isPast
                                ? "Missed"
                                : "Upcoming"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
