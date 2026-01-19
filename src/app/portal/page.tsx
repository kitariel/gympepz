"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, react/no-unescaped-entities */

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";
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
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { GuestDashboard } from "@/app/portal/_guest/guest-dashboard";

export default function PortalPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "quickStart" | "empty" | null
  >(null);

  // Data queries
  const streak = api.workoutLog.getStreak.useQuery(
    { userId },
    { enabled: !!userId },
  );

  // Check for recent completed workout
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );
  const weekAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }, []);
  const analytics = api.workoutLog.getAnalytics.useQuery(
    { userId, startDate: weekAgo },
    { 
      enabled: !!userId, 
      refetchInterval: 20000, // Refetch every 20 seconds
      refetchOnWindowFocus: false, // Prevent refetch on window focus
    },
  );
  const recentLogs = api.workoutLog.list.useQuery(
    { userId, limit: 5 },
    { enabled: !!userId },
  );
  const allLogs = api.workoutLog.list.useQuery(
    { userId, limit: 100 },
    { enabled: !!userId },
  );
  const plans = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });
  const prs = api.progress.getPRs.useQuery({ userId }, { enabled: !!userId });
  
  const activePlan = plans.data?.find((p) => p.isActive);
  
  // Get today's workout to check if it has exercises
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId && !!activePlan },
  );
  
  const toggleRestDay = api.plan.toggleRestDay.useMutation();

  const chartData = useMemo(() => {
    if (!allLogs.data?.items?.length) return [];

    const now = new Date();
    const sixWeeksAgo = subWeeks(now, 6);
    const weeks = eachWeekOfInterval(
      { start: sixWeeksAgo, end: now },
      { weekStartsOn: 1 },
    );

    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekWorkouts = allLogs.data.items.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd && log.completed;
      });

      const volume = weekWorkouts.reduce(
        (sum, log) => sum + ((log as any).totalVolume ?? 0),
        0,
      );

      return {
        week: format(weekStart, "MMM d"),
        workouts: weekWorkouts.length,
        volume: Math.round(volume / 1000),
      };
    });
  }, [allLogs.data]);

  // Mutations
  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const createEmpty = api.workoutLog.create.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const handleQuickStart = () => {
    if (!userId) return;

    // If has active plan, check if today's workout has exercises first
    if (activePlan) {
      // Check if today's workout has exercises first
      const hasExercises = todaysWorkout.data?.todayWorkout?.exercises && 
                          todaysWorkout.data.todayWorkout.exercises.length > 0;
      
      // If there are exercises, allow starting (exercises take priority over isRestDay flag)
      if (hasExercises) {
        // Check if there's a recent completed workout
        if (recentWorkoutCheck.data?.hasRecentWorkout) {
          setPendingAction("quickStart");
          setShowWarningDialog(true);
          return;
        }
        quickStart.mutate({ userId });
        return;
      }
      
      // No exercises - check if it's marked as rest day or show dialog
      if (todaysWorkout.data?.todayWorkout) {
        setShowRestDayDialog(true);
        return;
      }
      
      // No workout scheduled for today - redirect to log page
      router.push("/portal/log");
    } else {
      router.push("/portal/log");
    }
  };

  const handleRestDayChoice = async (action: 'skip' | 'add' | 'mark') => {
    setShowRestDayDialog(false);
    
    if (action === 'skip') {
      // User confirms it's a rest day - just close the dialog
      return;
    } else if (action === 'mark') {
      // User wants to mark today as rest day
      if (todaysWorkout.data?.todayWorkout?.id) {
        await toggleRestDay.mutateAsync({ id: todaysWorkout.data.todayWorkout.id });
        await todaysWorkout.refetch();
      }
      return;
    } else {
      // User wants to add exercises - redirect to plan editor
      if (activePlan) {
        router.push(`/portal/plans/${activePlan.id}`);
      }
    }
  };

  const handleCreateEmpty = () => {
    if (!userId) return;

    // Check if there's a recent completed workout
    if (recentWorkoutCheck.data?.hasRecentWorkout) {
      setPendingAction("empty");
      setShowWarningDialog(true);
      return;
    }

    createEmpty.mutate({ userId });
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    if (!userId) return;

    if (pendingAction === "quickStart") {
      if (activePlan) {
        quickStart.mutate({ userId });
      } else {
        router.push("/portal/log");
      }
    } else if (pendingAction === "empty") {
      createEmpty.mutate({ userId });
    }
    setPendingAction(null);
  };

  if (!userId) {
    return <GuestDashboard />;
  }

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium">
              This Week
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="text-muted-foreground h-3 w-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of completed workouts this week</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <Dumbbell className="text-muted-foreground h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {analytics.data?.totalWorkouts ?? 0}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">workouts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium">
              Streak
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="text-muted-foreground h-3 w-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Consecutive days with at least one completed workout</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <Flame className="h-3.5 w-3.5 text-orange-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {streak.data?.currentStreak ?? 0}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">days</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium">
              Volume
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="text-muted-foreground h-3 w-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total weight lifted this week (sets × reps × weight)</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {Math.round((analytics.data?.totalVolume ?? 0) / 1000)}k
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">kg</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium">
              Avg Time
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="text-muted-foreground h-3 w-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average workout duration this week</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <Clock className="text-muted-foreground h-3.5 w-3.5" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {analytics.data?.avgDuration ?? 0}
            </div>
            <p className="text-muted-foreground mt-0.5 text-[10px]">mins</p>
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
                  onClick={handleQuickStart}
                  disabled={quickStart.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {quickStart.isPending
                    ? "Starting..."
                    : activePlan
                      ? "Continue Plan"
                      : "Start Workout"}
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleCreateEmpty}
                      disabled={createEmpty.isPending}
                      className="h-11"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {createEmpty.isPending
                        ? "Starting..."
                        : "Create Freeform Workout"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Start a workout without a plan - add exercises on the fly
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Active Plan */}
          {activePlan && (
            <Card className="bg-primary/5 border-primary/20 border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="text-primary h-4 w-4" />
                    Active Plan
                  </CardTitle>
                  <Badge variant="secondary" className="text-[9px]">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <div>
                  <h3 className="text-base font-semibold">{activePlan.name}</h3>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {activePlan.daysCount} workout days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(`/portal/plans/${activePlan.id}`)
                    }
                    className="h-8 text-xs"
                  >
                    View Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/portal/log?quickStart=${activePlan.id}`)
                    }
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
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="text-primary h-4 w-4" />
                  Workout Trends
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => router.push("/portal/log?tab=analytics")}
                >
                  View Details
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {chartData.length > 0 && chartData.some((d) => d.workouts > 0) ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted))"
                      />
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
                      <RechartsTooltip
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
                        fill="hsl(var(--primary))"
                        name="Workouts"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(var(--foreground))"
                        strokeWidth={2}
                        name="Volume (k kg)"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-muted-foreground py-12 text-center">
                  <BarChart3 className="mx-auto mb-3 h-10 w-10 opacity-50" />
                  <p className="text-sm">No workout data yet</p>
                  <p className="mt-1 text-xs">
                    Complete workouts to see trends!
                  </p>
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
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {recentLogs.data?.items.map((log) => {
                  const logVolume = (log as any).totalVolume;
                  return (
                    <div
                      key={log.id}
                      className="border-border/50 hover:bg-accent/50 hover:border-accent flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all"
                      onClick={() =>
                        router.push(`/portal/log/workout/${log.id}`)
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {log.planDay?.title ?? "Untitled Workout"}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {format(new Date(log.date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0 text-right">
                        <p className="text-xs font-medium">
                          {log.duration ? `${log.duration}m` : "In Progress"}
                        </p>
                        {logVolume && (
                          <p className="text-muted-foreground text-[10px]">
                            {Math.round(logVolume)} kg
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {recentLogs.data?.items.length === 0 && (
                  <div className="text-muted-foreground py-10 text-center">
                    <div className="bg-muted mb-3 inline-flex rounded-full p-3">
                      <Dumbbell className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="mb-1 text-sm font-medium">No workouts yet</p>
                    <p className="mb-4 text-xs">
                      Start your first workout to begin tracking
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={handleCreateEmpty}
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
            <Card className="border-0 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-sm dark:from-orange-950/20 dark:to-yellow-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">
                      {streak.data?.currentStreak} Day Streak! 🔥
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Longest: {streak.data?.longestStreak} days • Keep going!
                      💪
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
                <CardTitle className="flex items-center gap-2 text-sm">
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
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {prs.data && Array.isArray(prs.data) && prs.data.length > 0 ? (
                <div className="space-y-2">
                  {(prs.data as any[]).slice(0, 3).map((pr: any) => (
                    <div
                      key={pr.id}
                      className="border-border/50 bg-muted/30 flex items-center justify-between rounded-lg border p-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {pr.exercise?.name ?? "Unknown Exercise"}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {pr.prType === "1RM" ? "1RM" : pr.prType}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0 text-right">
                        <p className="text-sm font-bold">{pr.value} kg</p>
                        {pr.reps && (
                          <p className="text-muted-foreground text-[10px]">
                            {pr.reps} reps
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  <Award className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No PRs yet</p>
                  <p className="mt-1 text-xs">
                    Complete workouts to set records!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-3">
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full justify-start text-xs"
                onClick={() => router.push("/portal/exercises")}
              >
                <Dumbbell className="mr-2 h-3.5 w-3.5" />
                Exercise Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full justify-start text-xs"
                onClick={() => router.push("/portal/plans")}
              >
                <Target className="mr-2 h-3.5 w-3.5" />
                My Plans
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full justify-start text-xs"
                onClick={() => router.push("/portal/log?tab=analytics")}
              >
                <BarChart3 className="mr-2 h-3.5 w-3.5" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-full justify-start text-xs"
                onClick={() => router.push("/portal/log?tab=progress")}
              >
                <TrendingUp className="mr-2 h-3.5 w-3.5" />
                Progress Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rest Day / No Exercises Dialog */}
      <Dialog open={showRestDayDialog} onOpenChange={setShowRestDayDialog}>
        <DialogContent>
          <DialogHeader>
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <>
                <DialogTitle>It&apos;s Your Rest Day Today</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data.todayWorkout.title
                    ? `Today is scheduled as a rest day for "${todaysWorkout.data.todayWorkout.title}". Take time to recover and let your muscles heal.`
                    : "Today is scheduled as a rest day. Take time to recover and let your muscles heal."}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>No Exercises for Today&apos;s Workout</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data?.todayWorkout?.title
                    ? `Today's workout "${todaysWorkout.data.todayWorkout.title}" doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?`
                    : "Today's workout doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?"}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 mt-4">
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <Button
                variant="default"
                onClick={() => handleRestDayChoice('skip')}
                className="w-full"
              >
                Got It
              </Button>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => handleRestDayChoice('skip')}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={() => handleRestDayChoice('add')}
                    className="flex-1"
                  >
                    Add Exercises
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRestDayChoice('mark')}
                  className="w-full"
                >
                  Mark Today as Rest Day
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rest Warning Dialog */}
      <WorkoutRestWarning
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleConfirmStart}
        onCancel={() => {
          setShowWarningDialog(false);
          setPendingAction(null);
        }}
        recentWorkout={recentWorkoutCheck.data?.workout ?? null}
      />
    </div>
  );
}
