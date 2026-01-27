"use client";

import { useCallback, useMemo } from "react";

import { useSchedulePrefs } from "./useSchedulePrefs";
import { useWorkoutDraft } from "./useWorkoutDraft";
import { useActiveProgram } from "./useActiveProgram";
import { checkMissedDay, type MissedDayCheckResult } from "@/features/train/domain/missedDayDetection";

export type UseMissedDayPromptResult = {
  hydrated: boolean;
  shouldShowPrompt: boolean;
  missedDate: string | null;
  reason: MissedDayCheckResult["reason"];
  onTrainToday: () => void;
  onRestToday: () => void;
  onSkipSession: () => void;
};

export function useMissedDayPrompt(): UseMissedDayPromptResult {
  const {
    hydrated: scheduleHydrated,
    preferredDays,
    missedDayState,
    acknowledgeMissedDay,
  } = useSchedulePrefs();

  const { history, hydrated: draftHydrated } = useWorkoutDraft();
  const { currentProgramRef, hydrated: programHydrated } = useActiveProgram();

  const hydrated = scheduleHydrated && draftHydrated && programHydrated;

  const checkResult = useMemo(() => {
    if (!hydrated || !currentProgramRef) {
      return {
        shouldShowPrompt: false,
        missedDate: null,
        reason: null,
      } as MissedDayCheckResult;
    }

    return checkMissedDay({
      preferredDays,
      history,
      missedDayState,
      programId: currentProgramRef.id,
    });
  }, [hydrated, preferredDays, history, missedDayState, currentProgramRef]);

  const onTrainToday = useCallback(() => {
    acknowledgeMissedDay("train");
  }, [acknowledgeMissedDay]);

  const onRestToday = useCallback(() => {
    acknowledgeMissedDay("rest");
  }, [acknowledgeMissedDay]);

  const onSkipSession = useCallback(() => {
    acknowledgeMissedDay("skip");
  }, [acknowledgeMissedDay]);

  return {
    hydrated,
    shouldShowPrompt: checkResult.shouldShowPrompt,
    missedDate: checkResult.missedDate,
    reason: checkResult.reason,
    onTrainToday,
    onRestToday,
    onSkipSession,
  };
}
