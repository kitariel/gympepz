"use client";

import { useCallback, useEffect, useState } from "react";

import {
  trainPrefsRepo,
  type ProgramDayManualIndex,
  type ProgramDayMode,
} from "@/lib/storage/trainPrefsRepo";

export function useTrainPrefs() {
  const [mode, setMode] = useState<ProgramDayMode>("auto");
  const [manualIndex, setManualIndex] = useState<ProgramDayManualIndex>(1);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMode(trainPrefsRepo.getProgramDayMode());
    setManualIndex(trainPrefsRepo.getProgramDayManualIndex());
    setHydrated(true);
  }, []);

  const setSelectedWorkoutDay = useCallback(
    (value: "auto" | ProgramDayManualIndex) => {
      if (value === "auto") {
        trainPrefsRepo.setProgramDayMode("auto");
        setMode("auto");
        return;
      }
      trainPrefsRepo.setProgramDayManualIndex(value);
      setMode("manual");
      setManualIndex(value);
    },
    [],
  );

  const setProgramDayMode = useCallback((next: ProgramDayMode) => {
    trainPrefsRepo.setProgramDayMode(next);
    setMode(next);
  }, []);

  const selectedWorkoutDay = mode === "auto" ? "auto" : manualIndex;

  return {
    hydrated,
    // Back-compat surface for existing components
    selectedWorkoutDay,
    setSelectedWorkoutDay,
    // New explicit API
    programDayMode: mode,
    programDayManualIndex: manualIndex,
    setProgramDayMode,
  } as const;
}

