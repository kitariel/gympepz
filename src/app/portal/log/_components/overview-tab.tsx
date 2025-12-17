"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, TrendingUp, Flame, Calendar } from "lucide-react";
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
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.data?.totalWorkouts ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">workouts completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {streak.data?.currentStreak ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analytics.data?.totalVolume ?? 0) / 1000)}k
            </div>
            <p className="text-xs text-muted-foreground">kg lifted this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.data?.avgDuration ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">minutes per workout</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={() => quickStart.mutate({ userId })}
            disabled={quickStart.isPending}
            size="lg"
            className="h-16"
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            {quickStart.isPending
              ? "Starting..."
              : "Continue Active Plan"}
          </Button>
          <Button
            variant="outline"
            onClick={() => createEmpty.mutate({ userId })}
            disabled={createEmpty.isPending}
            size="lg"
            className="h-16"
          >
            {createEmpty.isPending ? "Starting..." : "Start Empty Workout"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.data?.items.map((log) => (
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
                    {format(new Date(log.date), "EEEE, MMM d")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {log.duration ? `${log.duration} mins` : "In Progress"}
                  </p>
                  {log.totalVolume && (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(log.totalVolume)} kg
                    </p>
                  )}
                </div>
              </div>
            ))}

            {recentLogs.data?.items.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No workouts yet. Start your first one!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streak Card */}
      {(streak.data?.currentStreak ?? 0) > 0 && (
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Flame className="h-12 w-12 mx-auto mb-3 text-orange-500" />
              <h3 className="text-2xl font-bold mb-2">
                {streak.data?.currentStreak} Day Streak! 🔥
              </h3>
              <p className="text-muted-foreground">
                Your longest streak: {streak.data?.longestStreak} days
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Keep going! You're on fire 💪
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
