"use client";

import { useCallback, useEffect, useState } from "react";

import {
  schedulePrefsRepo,
  type PreferredDays,
  type MissedDayState,
} from "@/lib/storage/schedulePrefsRepo";
import { localDateKey } from "@/features/train/domain/date";

function getYesterday(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

export function useSchedulePrefs() {
  const [preferredDays, setPreferredDaysState] = useState<PreferredDays | null>(
    null
  );
  const [missedDayState, setMissedDayStateLocal] = useState<MissedDayState | null>(
    null
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferredDaysState(schedulePrefsRepo.getPreferredDays());
    const yesterdayKey = localDateKey(getYesterday());
    setMissedDayStateLocal(schedulePrefsRepo.getMissedDayState(yesterdayKey));
    setHydrated(true);
  }, []);

  const setPreferredDays = useCallback((days: PreferredDays) => {
    schedulePrefsRepo.setPreferredDays(days);
    setPreferredDaysState(days);
  }, []);

  const clearPreferredDays = useCallback(() => {
    schedulePrefsRepo.clearPreferredDays();
    setPreferredDaysState(null);
  }, []);

  const setMissedDayState = useCallback((state: MissedDayState) => {
    schedulePrefsRepo.setMissedDayState(state);
    setMissedDayStateLocal(state);
  }, []);

  const acknowledgeMissedDay = useCallback(
    (action: "train" | "rest" | "skip") => {
      const yesterdayKey = localDateKey(getYesterday());
      const state: MissedDayState = {
        date: yesterdayKey,
        action,
        acknowledgedAt: new Date().toISOString(),
      };
      schedulePrefsRepo.setMissedDayState(state);
      setMissedDayStateLocal(state);
    },
    []
  );

  return {
    hydrated,
    preferredDays,
    setPreferredDays,
    clearPreferredDays,
    missedDayState,
    setMissedDayState,
    acknowledgeMissedDay,
  } as const;
}
