"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  TrendingUp,
  Flame,
  Calendar,
  Play,
  Plus,
  Target,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { format, startOfWeek, subWeeks, eachWeekOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PortalPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();

  // Data queries
  const streak = api.workoutLog.getStreak.useQuery({ userId }, { enabled: !!userId });
  const weekAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }, []);
  const analytics = api.workoutLog.getAnalytics.useQuery(
    { userId, startDate: weekAgo },
    { enabled: !!userId }
  );
  const recentLogs = api.workoutLog.list.useQuery(
    { userId, limit: 5 },
    { enabled: !!userId }
  );
  const allLogs = api.workoutLog.list.useQuery(
    { userId, limit: 100 },
    { enabled: !!userId }
  );
  const plans = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });
  const prs = api.progress.getPRs.useQuery({ userId }, { enabled: !!userId });

  // Process workout data for chart (last 6 weeks)
  const chartData = useMemo(() => {
    if (!allLogs.data?.items) return [];

    const now = new Date();
    const sixWeeksAgo = subWeeks(now, 6);
    const weeks = eachWeekOfInterval(
      { start: sixWeeksAgo, end: now },
      { weekStartsOn: 1 }
    );

    // Group workouts by week
    const weeklyData = weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekWorkouts = allLogs.data.items.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd && log.completed;
      });

      const volume = weekWorkouts.reduce((sum, log) => {
        // Calculate volume from exercises if totalVolume not available
        const logVolume = (log as any).totalVolume ?? 0;
        return sum + logVolume;
      }, 0);

      return {
        week: format(weekStart, "MMM d"),
        workouts: weekWorkouts.length,
        volume: Math.round(volume / 1000), // Convert to thousands of kg
      };
    });

    return weeklyData;
  }, [allLogs.data]);

  // Mutations
  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const createEmpty = api.workoutLog.create.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const activePlan = plans.data?.find((p) => p.isActive);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back! Here's your fitness overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/portal/ai-planner")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Planner
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
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
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {analytics.data?.averageDuration ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">mins</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={() => {
                    if (activePlan) {
                      quickStart.mutate({ userId });
                    } else {
                      router.push("/portal/log");
                    }
                  }}
                  disabled={quickStart.isPending}
                  className="h-11 bg-gradient-to-br from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {quickStart.isPending
                    ? "Starting..."
                    : activePlan
                      ? "Continue Plan"
                      : "Start Workout"}
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

          {/* Active Plan */}
          {activePlan && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-teal-600" />
                    Active Plan
                  </CardTitle>
                  <Badge variant="secondary" className="text-[9px]">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-base">{activePlan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activePlan.daysCount} workout days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/portal/plans/${activePlan.id}`)}
                    className="h-8 text-xs"
                  >
                    View Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/portal/log?quickStart=${activePlan.id}`)}
                    className="h-8 text-xs"
                  >
                    Start Workout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workout Trends Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  Workout Trends
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => router.push("/portal/log?tab=analytics")}
                >
                  View Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {chartData.length > 0 && chartData.some((d) => d.workouts > 0) ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="week"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="workouts"
                        fill="#10b981"
                        name="Workouts"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Volume (k kg)"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No workout data yet</p>
                  <p className="text-xs mt-1">Complete workouts to see trends!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Workouts</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => router.push("/portal/log")}
                >
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
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
                      {(log as any).totalVolume && (
                        <p className="text-[10px] text-muted-foreground">
                          {Math.round((log as any).totalVolume)} kg
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {recentLogs.data?.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No workouts yet. Start your first one!</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 gap-2"
                      onClick={() => createEmpty.mutate({ userId })}
                    >
                      <Plus className="h-4 w-4" />
                      Start Workout
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Streak Card */}
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

          {/* Recent PRs */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-600" />
                  Recent PRs
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => router.push("/portal/log?tab=analytics")}
                >
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {prs.data && Array.isArray(prs.data) && prs.data.length > 0 ? (
                <div className="space-y-2">
                  {(prs.data as any[]).slice(0, 3).map((pr: any) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {pr.exercise?.name ?? "Unknown Exercise"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pr.prType === "1RM" ? "1RM" : pr.prType}
                        </p>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="text-sm font-bold">{pr.value} kg</p>
                        {pr.reps && (
                          <p className="text-[10px] text-muted-foreground">
                            {pr.reps} reps
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No PRs yet</p>
                  <p className="text-xs mt-1">Complete workouts to set records!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-3">
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-xs"
                onClick={() => router.push("/portal/exercises")}
              >
                <Dumbbell className="h-3.5 w-3.5 mr-2" />
                Exercise Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-xs"
                onClick={() => router.push("/portal/plans")}
              >
                <Target className="h-3.5 w-3.5 mr-2" />
                My Plans
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-xs"
                onClick={() => router.push("/portal/log?tab=analytics")}
              >
                <BarChart3 className="h-3.5 w-3.5 mr-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9 text-xs"
                onClick={() => router.push("/portal/log?tab=progress")}
              >
                <TrendingUp className="h-3.5 w-3.5 mr-2" />
                Progress Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
