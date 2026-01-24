"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useTrainMode } from "@/features/train/context/TrainModeContext";
import { getDayNumberForToday } from "@/features/train/domain/workoutSessionState";
import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";
import type {
  TrainEntryScreenViewProps,
  TrainEntryStartCard,
  RecentWorkoutItem,
} from "../TrainEntryScreen/TrainEntryScreen.types";
import { PortalTrainEntryScreenView } from "./PortalTrainEntryScreen.view";

function formatRelativeDate(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PortalTrainEntryScreen() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { isOnline, isOffline, isSyncing } = useTrainMode();

  // Offline mode hooks (localStorage)
  const { profile, hydrated: profileHydrated } = useTrainingProfile();
  const { activeProgram, hydrated: programHydrated } = useActiveProgram();
  const { draft, hydrated: workoutHydrated, summary, history } = useWorkoutDraft();
  const { selectedWorkoutDay, hydrated: prefsHydrated } = useTrainPrefs();

  // Online mode queries (database)
  const {
    data: dbWorkouts,
    isLoading: isLoadingWorkouts,
    isError: isWorkoutsError,
    refetch: refetchWorkouts,
  } = api.workoutLog.list.useQuery(
    { userId: userId ?? "", limit: 10 },
    { enabled: isOnline && Boolean(userId) }
  );

  const {
    data: activeWorkout,
    isLoading: isLoadingActive,
    isError: isActiveWorkoutError,
    refetch: refetchActiveWorkout,
  } = api.workoutLog.getActiveWorkout.useQuery(
    { userId: userId ?? "" },
    { enabled: isOnline && Boolean(userId) }
  );

  const {
    data: streakData,
    isError: isStreakError,
    refetch: refetchStreak,
  } = api.workoutLog.getStreak.useQuery(
    { userId: userId ?? "" },
    { enabled: isOnline && Boolean(userId) }
  );

  // Determine hydration state
  const offlineHydrated = profileHydrated && programHydrated && workoutHydrated && prefsHydrated;
  const onlineHydrated = !isLoadingWorkouts && !isLoadingActive;
  const hydrated = isOffline ? offlineHydrated : onlineHydrated;

  // Offline state
  const hasProfile = Boolean(profile);
  const hasProgram = Boolean(activeProgram);
  const hasDraft = Boolean(draft);

  const today = useMemo(() => getDayNumberForToday(), []);
  const autoPick = useMemo(() => {
    if (!activeProgram || selectedWorkoutDay !== "auto") return null;
    return pickWorkoutDayForWeekday(activeProgram.plan.days, today);
  }, [activeProgram, selectedWorkoutDay, today]);

  const todaysPlan = useMemo(() => {
    if (!activeProgram) return null;
    if (selectedWorkoutDay === "auto") return autoPick?.day ?? null;
    return activeProgram.plan.days.find((d) => d.day === selectedWorkoutDay) ?? null;
  }, [activeProgram, selectedWorkoutDay, autoPick]);

  const isScheduleMatch = selectedWorkoutDay === "auto" ? Boolean(autoPick?.isExactMatch) : true;

  const handleSyncRetry = useCallback(() => {
    if (!isOnline || !userId) return;
    void refetchWorkouts();
    void refetchActiveWorkout();
    void refetchStreak();
  }, [isOnline, userId, refetchWorkouts, refetchActiveWorkout, refetchStreak]);

  const syncError = useMemo(() => {
    if (!isOnline || !userId) return undefined;
    if (isWorkoutsError || isActiveWorkoutError || isStreakError) {
      return {
        title: "Sync issue",
        message: "We couldn't load your latest training data. Check your connection and try again.",
        actionLabel: "Retry",
        onAction: handleSyncRetry,
      };
    }
    return undefined;
  }, [isOnline, userId, isWorkoutsError, isActiveWorkoutError, isStreakError, handleSyncRetry]);

  // Build status text
  const statusText = useMemo(() => {
    if (isSyncing) return "Syncing...";
    if (!hydrated) return "Loading...";

    if (isOnline) {
      if (activeWorkout) return "Workout in progress";
      return "Online - synced";
    } else {
      if (hasDraft) return "Workout in progress";
      if (hasProgram) return "Offline - program ready";
      if (hasProfile) return "Offline - profile saved";
      return "Offline mode";
    }
  }, [hydrated, isSyncing, isOnline, activeWorkout, hasDraft, hasProgram, hasProfile]);

  // Build sessions text
  const sessionsText = useMemo(() => {
    if (isOnline && streakData) {
      return `${streakData.currentStreak} day streak`;
    }
    return `${summary.total} sessions`;
  }, [isOnline, streakData, summary.total]);

  // Build start card
  const startCard: TrainEntryStartCard = useMemo(() => {
    if (!hydrated) return { kind: "loading" };

    // Online mode - check for active DB workout
    if (isOnline) {
      if (activeWorkout) {
        return {
          kind: "draft",
          cta: { label: "Resume workout", href: "/portal/train/log", variant: "default" },
          programName: "Workout",
          dayLabel: null,
        };
      }

      // Has program - show start today's workout
      if (hasProgram && activeProgram) {
        const dayLabel = todaysPlan?.label ?? null;
        const exerciseCount = todaysPlan?.items.length ?? 0;
        const setsProgress = exerciseCount > 0 ? `${exerciseCount} exercises` : null;

        const primary = isScheduleMatch
          ? { label: "Start today's workout", href: "/portal/train/log", variant: "default" }
          : { label: "View next workout", href: "/portal/train/overview", variant: "default" };
        const secondary = isScheduleMatch
          ? { label: "View overview", href: "/portal/train/overview", variant: "outline" }
          : { label: "Change program", href: "/portal/train/templates", variant: "outline" };
        const nextLabel = !isScheduleMatch && dayLabel ? `Next workout: ${dayLabel}` : dayLabel;

        return {
          kind: "program",
          primary,
          secondary,
          programName: activeProgram.name,
          dayLabel: nextLabel,
          setsProgress,
        };
      }
    }

    // Offline mode or no program - fall back to localStorage state
    if (hasDraft && draft) {
      return {
        kind: "draft",
        cta: { label: "Resume workout", href: "/portal/train/log", variant: "default" },
        programName: draft.programName,
        dayLabel: draft.programDayLabel ?? null,
      };
    }

    if (hasProgram && activeProgram) {
      const dayLabel = todaysPlan?.label ?? null;
      const exerciseCount = todaysPlan?.items.length ?? 0;
      const setsProgress = exerciseCount > 0 ? `${exerciseCount} exercises` : null;

      const primary = isScheduleMatch
        ? { label: "Start today's workout", href: "/portal/train/log", variant: "default" }
        : { label: "View next workout", href: "/portal/train/overview", variant: "default" };
      const secondary = isScheduleMatch
        ? { label: "View overview", href: "/portal/train/overview", variant: "outline" }
        : { label: "Change program", href: "/portal/train/templates", variant: "outline" };
      const nextLabel = !isScheduleMatch && dayLabel ? `Next workout: ${dayLabel}` : dayLabel;

      return {
        kind: "program",
        primary,
        secondary,
        programName: activeProgram.name,
        dayLabel: nextLabel,
        setsProgress,
      };
    }

    if (hasProfile) {
      return {
        kind: "profile",
        cta: { label: "See recommended templates", href: "/portal/train/templates", variant: "default" },
      };
    }

    return {
      kind: "new",
      primary: { label: "Quick onboarding", href: "/portal/train/onboarding", variant: "default" },
      secondary: { label: "Browse templates", href: "/portal/train/templates", variant: "outline" },
    };
  }, [
    hydrated,
    isOnline,
    activeWorkout,
    hasDraft,
    draft,
    hasProgram,
    activeProgram,
    hasProfile,
    todaysPlan,
    isScheduleMatch,
  ]);

  // Build recent workouts list
  const recentWorkouts: RecentWorkoutItem[] = useMemo(() => {
    if (!hydrated) return [];

    // Online mode - use DB data
    if (isOnline && dbWorkouts?.items) {
      return dbWorkouts.items.slice(0, 3).map((w) => ({
        id: w.id,
        dateText: formatRelativeDate(w.date),
        dayLabel: null,
        setsCount: w._count.exercises,
      }));
    }

    // Offline mode - use localStorage
    return history.slice(0, 3).map((h) => ({
      id: h.id,
      dateText: formatRelativeDate(h.date),
      dayLabel: h.programDayLabel ?? null,
      setsCount: h.sets.length,
    }));
  }, [hydrated, isOnline, dbWorkouts?.items, history]);

  const viewProps: TrainEntryScreenViewProps = {
    statusText,
    sessionsText,
    startCard,
    recentWorkouts,
    historyHref: "/portal/train/history",
    templatesHref: "/portal/train/templates",
    buildHref: "/portal/train/build",
    plansHref: "/portal/train/plans",
    syncError,
  };

  return <PortalTrainEntryScreenView {...viewProps} />;
}
