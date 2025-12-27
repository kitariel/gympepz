"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarSeparator } from "@/components/ui/sidebar";
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
  const userQuery = api.user.getByEmail.useQuery({ email }, { enabled: !!email });
  const plansQuery = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });
  const streakQuery = api.workoutLog.getStreak.useQuery({ userId }, { enabled: !!userId });
  const analyticsQuery = api.workoutLog.getAnalytics.useQuery(
    { userId, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { enabled: !!userId }
  );
  const recentWorkouts = api.workoutLog.list.useQuery({ userId, limit: 3 }, { enabled: !!userId });
  const prsQuery = api.progress.getPRs.useQuery({ userId, limit: 3 }, { enabled: !!userId });
  const latestProgress = api.progress.latest.useQuery({ userId }, { enabled: !!userId });
  const calendarQuery = api.workoutLog.calendar.useQuery(
    {
      userId,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
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
    workouts: analyticsQuery.data?.totalWorkouts ?? 0,
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
      const hasWorkout = workoutDates.some((workoutDate) => isSameDay(workoutDate, date));
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

  const hasWorkouts = recentWorkouts.data?.items && recentWorkouts.data.items.length > 0;

  return (
    <Sidebar
      className="p-0 border-l"
      side="right"
      variant="inset"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader className="p-0 border-b-0">
        <ProfileHeader
          name={name}
          image={image}
          memberSince={memberSince}
          stats={stats}
          weekProgress={thisWeekProgress}
          currentStreak={streakQuery.data?.currentStreak ?? 0}
          longestStreak={streakQuery.data?.longestStreak ?? 0}
          totalVolume={analyticsQuery.data?.totalVolume ?? 0}
          averageDuration={analyticsQuery.data?.averageDuration ?? 0}
        />
      </SidebarHeader>
      
      <SidebarContent className="space-y-4 py-4">
        {/* Actions */}
        <QuickActions activePlanId={activePlan?.id} />
        
        <SidebarSeparator className="mx-4 opacity-50" />

        {/* Stats Overview */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="px-4 space-y-4">
            <MonthlyStats
              workouts={stats.workouts}
              volume={analyticsQuery.data?.totalVolume ?? 0}
              averageDuration={analyticsQuery.data?.averageDuration}
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
               workouts={
                 (recentWorkouts.data?.items ?? [])
                   .map(w => ({
                     ...w,
                     duration: w.duration ?? undefined,
                     planDay: w.planDay ? { title: w.planDay.title } : undefined,
                   }))
               }
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
