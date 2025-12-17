"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutLogList } from "./workout-log-list";
import { ProgressView } from "./progress-view";
import { OverviewTab } from "./_components/overview-tab";
import { AnalyticsTab } from "./_components/analytics-tab";
import { CalendarTab } from "./_components/calendar-tab";
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function LogPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessedQuickStart = useRef(false);

  // Handle quickStart URL parameter - start workout from specific plan
  const quickStartPlanId = searchParams?.get("quickStart");
  const planQuery = api.plan.get.useQuery(
    { id: quickStartPlanId ?? "" },
    { enabled: !!quickStartPlanId && !!userId }
  );
  const createLogFromPlan = api.workoutLog.create.useMutation({
    onSuccess: (log) => {
      router.replace("/portal/log"); // Remove query param
      router.push(`/portal/log/workout/${log.id}`);
    },
  });

  useEffect(() => {
    if (quickStartPlanId && userId && planQuery.data && !hasProcessedQuickStart.current) {
      hasProcessedQuickStart.current = true;
      const plan = planQuery.data;
      if (plan.days && plan.days.length > 0) {
        // Get the first day (or could implement logic to get next day)
        const firstDay = plan.days.sort((a, b) => a.order - b.order)[0];
        if (firstDay) {
          createLogFromPlan.mutate({
            userId,
            planDayId: firstDay.id,
            date: new Date(),
          });
        }
      }
    }
  }, [quickStartPlanId, userId, planQuery.data, createLogFromPlan, router]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your logs.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout Logs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your workouts, progress, and analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto h-9">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="gap-1.5 text-xs sm:text-sm">
            <Dumbbell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5 text-xs sm:text-sm">
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <OverviewTab userId={userId} />
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4 mt-4">
          <WorkoutLogList />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-4">
          <ProgressView />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          <AnalyticsTab userId={userId} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <CalendarTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
