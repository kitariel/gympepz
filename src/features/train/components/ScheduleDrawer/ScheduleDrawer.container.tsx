"use client";

import { useMemo } from "react";

import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useSchedulePrefs } from "@/hooks/useSchedulePrefs";
import { useMissedDayPrompt } from "@/hooks/useMissedDayPrompt";
import { getNextSessionInfo } from "@/features/train/domain/nextSession";
import { formatRelativeDate } from "@/features/train/domain/previousPerformance";

import { ScheduleDrawerView } from "./ScheduleDrawer.view";
import type {
  ScheduleDrawerLastCompleted,
  ScheduleDrawerMissedDay,
  ScheduleDrawerNextSession,
} from "./ScheduleDrawer.types";

type ScheduleDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditPreferredDays?: () => void;
};

export function ScheduleDrawer({
  open,
  onOpenChange,
  onEditPreferredDays,
}: ScheduleDrawerProps) {
  const { activeProgram, currentProgramRef, hydrated: programHydrated } = useActiveProgram();
  const { history, hydrated: draftHydrated } = useWorkoutDraft();
  const { preferredDays, hydrated: scheduleHydrated } = useSchedulePrefs();
  const {
    shouldShowPrompt,
    onTrainToday,
    onRestToday,
    onSkipSession,
  } = useMissedDayPrompt();

  const hydrated = programHydrated && draftHydrated && scheduleHydrated;

  const sessionInfo = useMemo(() => {
    if (!hydrated || !activeProgram || !currentProgramRef) return null;
    return getNextSessionInfo(
      activeProgram.plan.days,
      history,
      currentProgramRef.id
    );
  }, [hydrated, activeProgram, history, currentProgramRef]);

  const nextSession: ScheduleDrawerNextSession | null = useMemo(() => {
    if (!sessionInfo?.nextSession) return null;
    return {
      label: sessionInfo.nextSession.label,
      dayNumber: sessionInfo.nextSession.order,
    };
  }, [sessionInfo]);

  const lastCompletedSession: ScheduleDrawerLastCompleted | null = useMemo(() => {
    if (!sessionInfo?.lastCompletedSession || !currentProgramRef) return null;

    // Find the actual history item to get the date
    const lastHistoryItem = history.find((h) => {
      if (!h.completed) return false;
      const id = h.programRef?.id ?? h.templateId;
      return (
        id === currentProgramRef.id &&
        h.programDayIndex === sessionInfo.lastCompletedSession?.dayIndex
      );
    });

    if (!lastHistoryItem) return null;

    return {
      label: sessionInfo.lastCompletedSession.label,
      relativeDate: formatRelativeDate(lastHistoryItem.date),
    };
  }, [sessionInfo, history, currentProgramRef]);

  const missedDay: ScheduleDrawerMissedDay | null = useMemo(() => {
    if (!shouldShowPrompt) return null;
    return {
      show: true,
      dateText: "yesterday",
      onTrainToday: () => {
        onTrainToday();
        onOpenChange(false);
      },
      onRestToday: () => {
        onRestToday();
        onOpenChange(false);
      },
      onSkipSession: () => {
        onSkipSession();
        onOpenChange(false);
      },
    };
  }, [shouldShowPrompt, onTrainToday, onRestToday, onSkipSession, onOpenChange]);

  if (!hydrated) return null;

  return (
    <ScheduleDrawerView
      open={open}
      onOpenChange={onOpenChange}
      nextSession={nextSession}
      lastCompletedSession={lastCompletedSession}
      missedDay={missedDay}
      preferredDays={preferredDays}
      onEditPreferredDays={onEditPreferredDays}
    />
  );
}
