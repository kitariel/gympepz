"use client";

import { useSession } from "next-auth/react";
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

export default function LogPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your logs.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workout Logs</h2>
          <p className="text-muted-foreground">
            Track your workouts, progress, and analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="workouts" className="gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workouts</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab userId={userId} />
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <WorkoutLogList />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <ProgressView />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab userId={userId} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarTab userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
