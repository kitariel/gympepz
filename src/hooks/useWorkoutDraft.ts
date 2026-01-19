"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  workoutRepo,
  type ActiveWorkoutDraft,
  type WorkoutHistoryItem,
  type WorkoutSetEntry,
} from "@/lib/storage/workoutRepo";

function nowIso(): string {
  return new Date().toISOString();
}

export function useWorkoutDraft() {
  const [draft, setDraft] = useState<ActiveWorkoutDraft | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(workoutRepo.getActiveWorkoutDraft());
    setHistory(workoutRepo.getHistory());
    setHydrated(true);
  }, []);

  const saveDraft = useCallback((next: ActiveWorkoutDraft) => {
    workoutRepo.saveActiveWorkoutDraft(next);
    setDraft(next);
  }, []);

  const clearDraft = useCallback(() => {
    workoutRepo.clearActiveWorkoutDraft();
    setDraft(null);
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(workoutRepo.getHistory());
  }, []);

  const clearHistory = useCallback(() => {
    workoutRepo.clearHistory();
    setHistory([]);
  }, []);

  const addSet = useCallback(
    (exerciseName: string, reps: number, weight: number | null) => {
      if (!draft) return;
      const existingSetsForExercise = draft.sets.filter(
        (s) => s.exerciseName === exerciseName,
      ).length;
      const entry: WorkoutSetEntry = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        exerciseName,
        setNumber: existingSetsForExercise + 1,
        reps,
        weight,
        createdAt: nowIso(),
      };
      const next: ActiveWorkoutDraft = {
        ...draft,
        sets: [...draft.sets, entry],
        updatedAt: nowIso(),
      };
      saveDraft(next);
    },
    [draft, saveDraft],
  );

  const finish = useCallback(() => {
    if (!draft) return;
    const finished: WorkoutHistoryItem = {
      ...draft,
      completed: true,
      endedAt: nowIso(),
      updatedAt: nowIso(),
    };
    workoutRepo.addToHistory(finished);
    workoutRepo.clearActiveWorkoutDraft();
    setDraft(null);
    setHistory(workoutRepo.getHistory());
  }, [draft]);

  const summary = useMemo(() => {
    const total = history.length;
    const completed = history.filter((h) => h.completed).length;
    return { total, completed };
  }, [history]);

  return {
    hydrated,
    draft,
    saveDraft,
    clearDraft,
    addSet,
    finish,
    history,
    refreshHistory,
    clearHistory,
    summary,
  };
}

