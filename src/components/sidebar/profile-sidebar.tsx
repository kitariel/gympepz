"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import {
  ProfileHeader,
  QuickActions,
  RecentPRs,
  RecentActivity,
  BodyStats,
  MonthlyStats,
  EmptyState,
} from "./profile_parts";

type Props = React.ComponentProps<typeof Sidebar>;

export default function ProfileSidebar(props: Props) {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const email = session?.user?.email ?? "";

  // API Queries
  const userQuery = api.user.getByEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const plansQuery = api.plan.listByUser.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const streakQuery = api.workoutLog.getStreak.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const analyticsQuery = api.workoutLog.getAnalytics.useQuery(
    { userId, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { enabled: !!userId },
  );
  const recentWorkouts = api.workoutLog.list.useQuery(
    { userId, limit: 3 },
    { enabled: !!userId },
  );
  const prsQuery = api.progress.getPRs.useQuery(
    { userId, limit: 3 },
    { enabled: !!userId },
  );
  const latestProgress = api.progress.latest.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const calendarQuery = api.workoutLog.calendar.useQuery(
    {
      userId,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
    { enabled: !!userId },
  );
  const activeWorkout = api.workoutLog.getActiveWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId },
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
    workouts: analyticsQuery.data?.totalWorkouts ?? 0,
    prs: prsQuery.data?.length ?? 0,
  };

  const activePlan = plansQuery.data?.find((p) => p.isActive);

  // Calculate this week's progress - aligned with active plan
  const thisWeekProgress = useMemo(() => {
    const today = new Date();
    // Start week on Sunday (0) to match plan day orders (0-6)
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday = 0
    const workoutDates = calendarQuery.data?.map((w) => ({
      date: new Date(w.date),
      completed: w.completed ?? true,
      planDayId: w.planDayId,
    })) ?? [];
    
    // Get active plan days - order 0-6 maps to Sunday-Saturday
    const activePlanDays = activePlan?.days ?? [];
    
    // Create a map of order -> planDay for quick lookup
    const planDayByOrder = new Map(activePlanDays.map(d => [d.order, d]));
    
    // Get today's plan day from the API
    const todayPlanDay = todaysWorkout.data?.todayWorkout;
    
    // Check if there's an active workout
    const hasActiveWorkout = !!activeWorkout.data && !activeWorkout.data.completed;
    const activeWorkoutPlanDayId = activeWorkout.data?.planDayId;

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Find the plan day for this day of week (order matches dayOfWeek: 0-6)
      const planDayForThisDay = planDayByOrder.get(dayOfWeek);
      const isRestDay = planDayForThisDay?.isRestDay ?? false;
      
      // Find matching workout for this date
      const workoutForDate = workoutDates.find((w) => isSameDay(w.date, date));
      const hasWorkout = !!workoutForDate && workoutForDate.completed;
      
      // Check if this is today and has an active workout for today's plan day
      const isToday = isSameDay(date, today);
      const isInProgress = isToday && 
                          hasActiveWorkout && 
                          todayPlanDay &&
                          planDayForThisDay?.id === todayPlanDay.id &&
                          activeWorkoutPlanDayId === todayPlanDay.id;
      
      const isPast = date < today && !isToday;

      return {
        day: format(date, "EEE"),
        date,
        hasWorkout,
        isPast,
        isToday,
        // Only show missed if past, no workout, not rest day, and has a plan day assigned
        isMissed: isPast && !hasWorkout && !isRestDay && !!planDayForThisDay,
        // Show rest day if it's a rest day in the plan (past, today, or future)
        isRestDay: isRestDay && !hasWorkout && !isInProgress,
        isInProgress: !!isInProgress,
      };
    });
  }, [calendarQuery.data, activePlan?.days, activeWorkout.data, todaysWorkout.data]);

  const hasWorkouts =
    recentWorkouts.data?.items && recentWorkouts.data.items.length > 0;

  return (
    <Sidebar
      className="border-l p-0"
      side="right"
      variant="inset"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader className="border-b-0 p-0">
        <ProfileHeader
          name={name}
          image={image}
          memberSince={memberSince}
          stats={stats}
          weekProgress={thisWeekProgress}
          currentStreak={streakQuery.data?.currentStreak ?? 0}
          longestStreak={streakQuery.data?.longestStreak ?? 0}
          totalVolume={analyticsQuery.data?.totalVolume ?? 0}
          averageDuration={analyticsQuery.data?.avgDuration ?? 0}
        />
      </SidebarHeader>

      <SidebarContent className="space-y-4 py-4">
        {/* Actions */}
        <QuickActions activePlanId={activePlan?.id} />

        <SidebarSeparator className="mx-4 opacity-50" />

        {/* Stats Overview */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="space-y-4 px-4">
            <MonthlyStats
              workouts={stats.workouts}
              volume={analyticsQuery.data?.totalVolume ?? 0}
              averageDuration={analyticsQuery.data?.avgDuration}
            />

            <BodyStats
              weight={latestProgress.data?.weight ?? undefined}
              bodyFat={latestProgress.data?.bodyFat ?? undefined}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 opacity-50" />

        {/* Recent Activity */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="px-4">
            <RecentActivity
              workouts={(recentWorkouts.data?.items ?? []).map((w) => ({
                ...w,
                duration: w.duration ?? undefined,
                planDay: w.planDay ? { title: w.planDay.title } : undefined,
              }))}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PRs */}
        {stats.prs > 0 && (
          <SidebarGroup className="p-0">
            <SidebarGroupContent className="px-4">
              <RecentPRs prs={prsQuery.data ?? []} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Empty State */}
        {!hasWorkouts && (
          <div className="px-4">
            <EmptyState />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
