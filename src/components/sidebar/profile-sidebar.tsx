"use client";

import { useMemo, useState, createContext, useContext } from "react";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import {
  ProfileHeader,
  QuickActions,
  RecentPRs,
  RecentActivity,
  MonthlyStats,
  MonthlyCalendar,
  EmptyState,
} from "./profile_parts";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import type { ProgramTemplateDay } from "@/lib/program-templates/types";

type Props = React.ComponentProps<typeof Sidebar>;

// Context for profile sidebar state (mobile)
const ProfileSidebarContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function useProfileSidebar() {
  const context = useContext(ProfileSidebarContext);
  if (!context) {
    // Return a no-op if context is not available
    return {
      open: false,
      setOpen: () => {
        /* empty */
      },
    };
  }
  return context;
}

export function ProfileSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <ProfileSidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </ProfileSidebarContext.Provider>
  );
}

export default function ProfileSidebar(props: Props) {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const email = session?.user?.email ?? "";
  const isMobile = useIsMobile();
  const profileSidebarContext = useContext(ProfileSidebarContext);
  const openMobile = profileSidebarContext?.open ?? false;
  const setOpenMobile =
    profileSidebarContext?.setOpen ??
    (() => {
      /* empty */
    });

  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Local workout draft state (source of truth for active workout)
  const { draft, hydrated: draftHydrated } = useWorkoutDraft();
  const { activeProgram } = useActiveProgram();

  // API Queries with refetch intervals to stay in sync
  const userQuery = api.user.getByEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const streakQuery = api.workoutLog.getStreak.useQuery(
    { userId },
    {
      enabled: !!userId,
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    },
  );
  const thirtyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);

  const analyticsQuery = api.workoutLog.getAnalytics.useQuery(
    { userId, startDate: thirtyDaysAgo },
    {
      enabled: !!userId,
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    },
  );
  const recentWorkouts = api.workoutLog.list.useQuery(
    { userId, limit: 3 },
    {
      enabled: !!userId,
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    },
  );
  const prsQuery = api.progress.getPRs.useQuery(
    { userId, limit: 3 },
    {
      enabled: !!userId,
      refetchInterval: 60000, // PRs change less frequently
      refetchOnWindowFocus: true,
    },
  );

  // Calendar data for the selected month
  const calendarQuery = api.workoutLog.calendar.useQuery(
    {
      userId,
      year: calendarMonth.getFullYear(),
      month: calendarMonth.getMonth() + 1,
    },
    {
      enabled: !!userId,
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    },
  );

  // Computed values
  const user = userQuery.data;
  const name = user?.name ?? session?.user?.name ?? "Member";
  const image = user?.image ?? session?.user?.image ?? undefined;
  const memberSince = user?.createdAt
    ? format(new Date(user.createdAt), "MMM yyyy")
    : "Recently";

  // Prepare calendar data
  const workoutDays = useMemo(() => {
    return (
      calendarQuery.data?.map((w) => ({
        date: new Date(w.date),
        completed: w.completed ?? true,
      })) ?? []
    );
  }, [calendarQuery.data]);

  const scheduledDays = useMemo(() => {
    const planDays = activeProgram?.plan.days ?? [];
    return planDays.map((day: ProgramTemplateDay) => ({
      dayOfWeek: day.day === 7 ? 0 : day.day, // Convert Sunday from 7 to 0
      isRestDay: Boolean(day.isRestDay || day.items.length === 0),
    }));
  }, [activeProgram?.plan.days]);

  // Use local draft state for accurate active workout detection
  const hasActiveWorkout = draftHydrated && !!draft && !draft.completed;

  const hasWorkouts =
    recentWorkouts.data?.items && recentWorkouts.data.items.length > 0;

  // Content component to be reused in both Sheet and Sidebar
  const sidebarContent = (
    <>
      <SidebarHeader className="border-b border-border/50 p-0">
        <ProfileHeader
          name={name}
          image={image}
          memberSince={memberSince}
          currentStreak={streakQuery.data?.currentStreak ?? 0}
          longestStreak={streakQuery.data?.longestStreak ?? 0}
          totalWorkouts={analyticsQuery.data?.totalWorkouts ?? 0}
        />
      </SidebarHeader>

      <SidebarContent className="space-y-4 py-4">
        {/* Quick Actions */}
        <QuickActions />

        <SidebarSeparator className="mx-4 opacity-50" />

        {/* Monthly Calendar */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="px-4">
            <MonthlyCalendar
              currentMonth={calendarMonth}
              onMonthChange={setCalendarMonth}
              workoutDays={workoutDays}
              scheduledDays={scheduledDays}
              hasActiveWorkout={hasActiveWorkout}
              hasDraft={hasActiveWorkout}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 opacity-50" />

        {/* 30-Day Stats */}
        <SidebarGroup className="p-0">
          <SidebarGroupContent className="px-4">
            <MonthlyStats
              workouts={analyticsQuery.data?.totalWorkouts ?? 0}
              volume={analyticsQuery.data?.totalVolume ?? 0}
              averageDuration={analyticsQuery.data?.avgDuration}
              prs={prsQuery.data?.length ?? 0}
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
              }))}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PRs */}
        {(prsQuery.data?.length ?? 0) > 0 && (
          <>
            <SidebarSeparator className="mx-4 opacity-50" />
            <SidebarGroup className="p-0">
              <SidebarGroupContent className="px-4">
                <RecentPRs prs={prsQuery.data ?? []} />
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Empty State */}
        {!hasWorkouts && (
          <div className="px-4">
            <EmptyState />
          </div>
        )}
      </SidebarContent>
    </>
  );

  // On mobile, use Sheet; on desktop, use Sidebar
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="right" className="w-[20rem] p-0 sm:w-[20rem]">
          <div className="bg-sidebar text-sidebar-foreground flex h-full w-full flex-col overflow-y-auto">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sidebar
      className="border-l border-border/50 p-0"
      side="right"
      variant="inset"
      collapsible="offcanvas"
      {...props}
    >
      {sidebarContent}
    </Sidebar>
  );
}
