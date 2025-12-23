"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutLogList } from "./workout-log-list";
import { ProgressView } from "./progress-view";
import { AnalyticsTab } from "./_components/analytics-tab";
import { CalendarTab } from "./_components/calendar-tab";
import {
  Dumbbell,
  TrendingUp,
  BarChart3,
  Calendar,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";

export default function LogPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [pendingQuickStart, setPendingQuickStart] = useState<{ planId: string; dayId: string } | null>(null);

  // Handle quickStart URL parameter - start workout from specific plan
  const quickStartPlanId = searchParams?.get("quickStart");
  
  // Check if this quickStart has already been processed using sessionStorage
  const getProcessedQuickStart = () => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem("processedQuickStart");
    } catch {
      return null;
    }
  };

  const setProcessedQuickStart = (planId: string) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("processedQuickStart", planId);
    } catch {
      // Ignore sessionStorage errors
    }
  };

  const hasProcessedThisQuickStart = quickStartPlanId === getProcessedQuickStart();
  
  // Remove query param if already processed (e.g., from browser back button)
  useEffect(() => {
    if (quickStartPlanId && hasProcessedThisQuickStart) {
      router.replace("/portal/log", { scroll: false });
    }
  }, [quickStartPlanId, hasProcessedThisQuickStart, router]);

  const planQuery = api.plan.get.useQuery(
    { id: quickStartPlanId ?? "" },
    { enabled: !!quickStartPlanId && !!userId && !hasProcessedThisQuickStart }
  );

  // Check for recent completed workout
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId }
  );

  const createLogFromPlan = api.workoutLog.create.useMutation({
    onSuccess: (log) => {
      // Query param should already be removed, but ensure it's gone
      router.replace("/portal/log"); 
      router.push(`/portal/log/workout/${log.id}`);
      setPendingQuickStart(null);
    },
  });

  const handleCreateFromPlan = (planId: string, dayId: string) => {
    // Check if there's a recent completed workout
    if (recentWorkoutCheck.data?.hasRecentWorkout) {
      setPendingQuickStart({ planId, dayId });
      setShowWarningDialog(true);
      return;
    }

    // No recent workout, create immediately
    createLogFromPlan.mutate({
      userId,
      planDayId: dayId,
      date: new Date(),
    });
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    if (pendingQuickStart) {
      createLogFromPlan.mutate({
        userId,
        planDayId: pendingQuickStart.dayId,
        date: new Date(),
      });
    }
  };

  useEffect(() => {
    // Only process if we haven't processed this specific planId before
    if (
      quickStartPlanId && 
      userId && 
      planQuery.data && 
      !hasProcessedThisQuickStart &&
      recentWorkoutCheck.data !== undefined
    ) {
      // Mark this planId as processed BEFORE creating workout
      setProcessedQuickStart(quickStartPlanId);
      
      // Remove query parameter immediately to prevent re-processing on back navigation
      router.replace("/portal/log", { scroll: false });
      
      const plan = planQuery.data;
      if (plan.days && plan.days.length > 0) {
        // Get the first day (or could implement logic to get next day)
        const firstDay = plan.days.sort((a, b) => a.order - b.order)[0];
        if (firstDay) {
          handleCreateFromPlan(plan.id, firstDay.id);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickStartPlanId, userId, planQuery.data, recentWorkoutCheck.data, hasProcessedThisQuickStart, router]);

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

      <Tabs defaultValue="workouts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto h-9">
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

        <TabsContent value="workouts" className="space-y-4 mt-4">
          <WorkoutLogList />
        </TabsContent>

        {/* Rest Warning Dialog */}
        <WorkoutRestWarning
          open={showWarningDialog}
          onOpenChange={setShowWarningDialog}
          onConfirm={handleConfirmStart}
          onCancel={() => {
            setShowWarningDialog(false);
            setPendingQuickStart(null);
            router.replace("/portal/log"); // Remove query param on cancel
          }}
          recentWorkout={recentWorkoutCheck.data?.workout ?? null}
        />

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
