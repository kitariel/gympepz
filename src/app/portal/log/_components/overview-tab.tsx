"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, TrendingUp, Flame, Calendar, Play, Plus } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface OverviewTabProps {
  userId: string;
}

export function OverviewTab({ userId }: OverviewTabProps) {
  const router = useRouter();

  const streak = api.workoutLog.getStreak.useQuery({ userId });
  const analytics = api.workoutLog.getAnalytics.useQuery({
    userId,
    period: "week",
  });
  const recentLogs = api.workoutLog.list.useQuery({ userId, limit: 5 });

  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const createEmpty = api.workoutLog.create.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  return (
    <div className="space-y-4">
      {/* Compact Quick Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">This Week</CardTitle>
            <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {analytics.data?.totalWorkouts ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">workouts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Streak</CardTitle>
            <Flame className="h-3.5 w-3.5 text-orange-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {streak.data?.currentStreak ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">days</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Volume</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {Math.round((analytics.data?.totalVolume ?? 0) / 1000)}k
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">kg</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Avg Time</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {analytics.data?.avgDuration ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">mins</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Compact */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              onClick={() => quickStart.mutate({ userId })}
              disabled={quickStart.isPending}
              className="h-11 bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              {quickStart.isPending ? "Starting..." : "Continue Plan"}
            </Button>
            <Button
              variant="outline"
              onClick={() => createEmpty.mutate({ userId })}
              disabled={createEmpty.isPending}
              className="h-11"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createEmpty.isPending ? "Starting..." : "Empty Workout"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - Compact */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base">Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {recentLogs.data?.items.map((log) => (
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
                    {log.duration ? `${log.duration}m` : "In Progress"}
                  </p>
                  {log.totalVolume && (
                    <p className="text-[10px] text-muted-foreground">
                      {Math.round(log.totalVolume)} kg
                    </p>
                  )}
                </div>
              </div>
            ))}

            {recentLogs.data?.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No workouts yet. Start your first one!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streak Card - Compact */}
      {(streak.data?.currentStreak ?? 0) > 0 && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">
                  {streak.data?.currentStreak} Day Streak! 🔥
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Longest: {streak.data?.longestStreak} days • Keep going! 💪
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
