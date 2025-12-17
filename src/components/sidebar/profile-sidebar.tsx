"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Award,
  Play,
  BarChart3,
  Target,
  Flame,
  Clock,
  Check,
  X,
} from "lucide-react";
import { format, formatDistanceToNow, startOfWeek, addDays, isSameDay } from "date-fns";

type Props = React.ComponentProps<typeof Sidebar>;

export default function ProfileSidebar(props: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const email = session?.user?.email ?? "";

  // API Queries
  const userQuery = api.user.getByEmail.useQuery(
    { email },
    { enabled: !!email }
  );
  const plansQuery = api.plan.listByUser.useQuery(
    { userId },
    { enabled: !!userId }
  );
  const streakQuery = api.workoutLog.getStreak.useQuery(
    { userId },
    { enabled: !!userId }
  );
  const analyticsQuery = api.workoutLog.getAnalytics.useQuery(
    { userId, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { enabled: !!userId }
  );
  const recentWorkouts = api.workoutLog.list.useQuery(
    { userId, limit: 3 },
    { enabled: !!userId }
  );
  const prsQuery = api.progress.getPRs.useQuery(
    { userId, limit: 3 },
    { enabled: !!userId }
  );
  const latestProgress = api.progress.latest.useQuery(
    { userId },
    { enabled: !!userId }
  );
  
  // Get this week's calendar data
  const calendarQuery = api.workoutLog.calendar.useQuery(
    { 
      userId,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    },
    { enabled: !!userId }
  );

  // Computed values
  const user = userQuery.data;
  const name = user?.name ?? session?.user?.name ?? "Member";
  const image = user?.image ?? session?.user?.image ?? undefined;
  const memberSince = user?.createdAt
    ? format(new Date(user.createdAt), "MMM yyyy")
    : "Recently";

  const stats = {
    plans: plansQuery.data?.length ?? 0,
    streak: streakQuery.data?.currentStreak ?? 0,
    longestStreak: streakQuery.data?.longestStreak ?? 0,
    workouts: analyticsQuery.data?.totalWorkouts ?? 0,
    volume: analyticsQuery.data?.totalVolume ?? 0,
    prs: prsQuery.data?.length ?? 0,
  };

  const activePlan = plansQuery.data?.find((p) => p.isActive);

  // Calculate this week's progress
  const thisWeekProgress = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const workoutDates = calendarQuery.data?.map((w: any) => new Date(w.date)) ?? [];
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const hasWorkout = workoutDates.some(workoutDate => 
        isSameDay(workoutDate, date)
      );
      const isPast = date < today && !isSameDay(date, today);
      const isToday = isSameDay(date, today);
      
      return {
        day: format(date, "EEE"),
        date,
        hasWorkout,
        isPast,
        isToday,
        isMissed: isPast && !hasWorkout,
      };
    });
  }, [calendarQuery.data]);

  const weekCompletedDays = thisWeekProgress.filter(d => d.hasWorkout).length;

  return (
    <Sidebar
      className="p-0"
      side="right"
      variant="inset"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader />
      <SidebarContent className="m-0 p-0 space-y-4">
        {/* Profile Header */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-primary/90 to-primary p-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 ring-4 ring-white/20 cursor-pointer hover:ring-white/40 transition-all" onClick={() => router.push("/portal/account")}>
                <AvatarImage src={image ?? undefined} alt={name ?? "Member"} />
                <AvatarFallback className="bg-primary-foreground/20 text-white text-lg">
                  {(name ?? "M").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl text-white mb-1">{name}</CardTitle>
                <CardDescription className="text-white/80 text-sm">
                  Member since {memberSince}
                </CardDescription>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => router.push("/portal/account")}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary rounded-lg p-3 text-center cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => router.push("/portal/plans")}>
                <div className="text-2xl font-bold text-foreground">
                  {stats.plans}
                </div>
                <div className="text-xs text-muted-foreground">Plans</div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => router.push("/portal/log")}>
                <div className="text-2xl font-bold text-foreground">
                  {stats.workouts}
                </div>
                <div className="text-xs text-muted-foreground">Workouts</div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => router.push("/portal/log")}>
                <div className="text-2xl font-bold text-foreground">
                  {stats.prs}
                </div>
                <div className="text-xs text-muted-foreground">PRs</div>
              </div>
            </div>

            {/* Weekly Streak Progress - Like the image */}
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

              {/* Weekly Calendar */}
              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {thisWeekProgress.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="text-[10px] font-medium text-muted-foreground">
                      {day.day}
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                        day.hasWorkout
                          ? "bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30"
                          : day.isMissed
                            ? "bg-red-500 shadow-lg shadow-red-500/30"
                            : day.isToday
                              ? "bg-secondary border-2 border-teal-500/50"
                              : "bg-secondary/50"
                      }`}
                    >
                      {day.hasWorkout ? (
                        <Check className="h-5 w-5 text-white" strokeWidth={3} />
                      ) : day.isMissed ? (
                        <X className="h-5 w-5 text-white" strokeWidth={3} />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Longest Streak */}
              <div className="text-center pt-3 border-t border-teal-500/20">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stats.longestStreak}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Longest Streak
                </div>
              </div>

              {/* Motivational Message */}
              <div className="text-center mt-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {weekCompletedDays >= 5
                    ? "You are on fire! Keep using the app to gain more streaks!"
                    : weekCompletedDays >= 3
                      ? "Great progress! Keep the momentum going 🔥"
                      : weekCompletedDays > 0
                        ? "Good start! Try to work out at least 3-4 times this week"
                        : "Start your first workout to begin your streak!"}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                size="sm"
                onClick={() => {
                  if (activePlan) {
                    router.push(`/portal/log?quickStart=${activePlan.id}`);
                  } else {
                    router.push("/portal/log");
                  }
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/portal/log")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/portal/plans")}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Plans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month's Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                This Month
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Workouts</span>
              </div>
              <span className="font-semibold">{stats.workouts}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Volume</span>
              </div>
              <span className="font-semibold">
                {stats.volume > 0
                  ? `${(stats.volume / 1000).toFixed(1)}k kg`
                  : "0 kg"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Duration</span>
              </div>
              <span className="font-semibold">
                {analyticsQuery.data?.averageDuration
                  ? `${analyticsQuery.data.averageDuration} min`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent PRs */}
        {prsQuery.data && prsQuery.data.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Recent PRs
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => router.push("/portal/log?tab=analytics")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {prsQuery.data.map((pr: any) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {pr.exercise?.name ?? "Exercise"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pr.prType === "max_weight"
                        ? `${pr.value} kg × ${pr.reps ?? 1}`
                        : `${pr.value} kg`}
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <Award className="h-3 w-3 mr-1" />
                    PR
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {recentWorkouts.data?.items && recentWorkouts.data.items.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => router.push("/portal/log?tab=workouts")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentWorkouts.data.items.map((workout: any) => (
                <div
                  key={workout.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/portal/log/workout/${workout.id}`)}
                >
                  <div className="p-2 rounded-full bg-primary/10 shrink-0">
                    <Dumbbell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {workout.planDay?.title ?? "Workout"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(workout.date), {
                        addSuffix: true,
                      })}
                    </div>
                    {workout._count?.exercises > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {workout._count.exercises} exercises
                        {workout.duration && ` • ${workout.duration} min`}
                      </div>
                    )}
                  </div>
                  {workout.completed && (
                    <Badge variant="success" className="shrink-0">
                      ✓
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Current Weight */}
        {latestProgress.data?.weight && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Body Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weight</span>
                <span className="font-semibold">
                  {latestProgress.data.weight} kg
                </span>
              </div>
              {latestProgress.data.bodyFat && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Body Fat
                    </span>
                    <span className="font-semibold">
                      {latestProgress.data.bodyFat}%
                    </span>
                  </div>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => router.push("/portal/log?tab=progress")}
              >
                Update Progress
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State for no activity */}
        {(!recentWorkouts.data?.items ||
          recentWorkouts.data.items.length === 0) && (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-3">
                <div className="inline-flex p-4 rounded-full bg-primary/10">
                  <Dumbbell className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">No workouts yet</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Start your fitness journey today
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push("/portal/log")}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start First Workout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
