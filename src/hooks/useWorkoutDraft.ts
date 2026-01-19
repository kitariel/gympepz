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

function normalizeDraft(raw: ActiveWorkoutDraft | null): ActiveWorkoutDraft | null {
  if (!raw) return null;

  const templateId =
    (raw as unknown as { templateId?: string | null }).templateId ?? undefined;

  const exercises =
    raw.exercises?.map((ex) => ({
      ...ex,
      targetSets: (ex as { targetSets?: number | null }).targetSets ?? null,
      targetReps: (ex as { targetReps?: string | null }).targetReps ?? null,
      targetWeight: (ex as { targetWeight?: string | null }).targetWeight ?? null,
    })) ?? [];

  const sets =
    raw.sets?.map((s) => {
      // Back-compat: old sets were { reps:number, weight:number|null } with no exerciseId/completed.
      const legacy = s as unknown as {
        id: string;
        exerciseName: string;
        setNumber: number;
        reps?: number;
        weight?: number | null;
        createdAt: string;
      };

      const exerciseId =
        (s as { exerciseId?: string }).exerciseId ??
        // best-effort fallback if upgrading an existing draft
        `legacy_${legacy.exerciseName}`;

      const targetReps = (s as { targetReps?: string | null }).targetReps ?? null;
      const targetWeight = (s as { targetWeight?: string | null }).targetWeight ?? null;

      const actualReps =
        (s as { actualReps?: string }).actualReps ??
        (legacy.reps != null ? String(legacy.reps) : "");

      const actualWeight =
        (s as { actualWeight?: string | null }).actualWeight ??
        (legacy.weight != null ? String(legacy.weight) : null);

      const completed = (s as { completed?: boolean }).completed ?? false;

      const normalized: WorkoutSetEntry = {
        id: legacy.id,
        exerciseId,
        exerciseName: legacy.exerciseName,
        setNumber: legacy.setNumber,
        targetReps,
        actualReps,
        targetWeight,
        actualWeight,
        completed,
        createdAt: legacy.createdAt,
      };

      return normalized;
    }) ?? [];

  return {
    ...raw,
    templateId,
    exercises,
    sets,
  };
}

export function useWorkoutDraft() {
  const [draft, setDraft] = useState<ActiveWorkoutDraft | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(normalizeDraft(workoutRepo.getActiveWorkoutDraft()));
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
    (exerciseId: string) => {
      if (!draft) return;
      const ex = draft.exercises.find((e) => e.id === exerciseId);
      if (!ex) return;

      const setsForExercise = draft.sets.filter((s) => s.exerciseId === exerciseId);
      const entry: WorkoutSetEntry = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        exerciseId,
        exerciseName: ex.name,
        setNumber: setsForExercise.length + 1,
        targetReps: ex.targetReps ?? null,
        actualReps: ex.targetReps ?? "",
        targetWeight: ex.targetWeight ?? null,
        actualWeight: ex.targetWeight ?? null,
        completed: false,
        createdAt: nowIso(),
      };

      saveDraft({
        ...draft,
        sets: [...draft.sets, entry],
        updatedAt: nowIso(),
      });
    },
    [draft, saveDraft],
  );

  const updateSet = useCallback(
    (setId: string, patch: Partial<Pick<WorkoutSetEntry, "actualReps" | "actualWeight" | "completed">>) => {
      if (!draft) return;
      const nextSets = draft.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s));
      saveDraft({ ...draft, sets: nextSets, updatedAt: nowIso() });
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
    updateSet,
    finish,
    history,
    refreshHistory,
    clearHistory,
    summary,
  };
}

