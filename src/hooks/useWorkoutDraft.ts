"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  workoutRepo,
  type ActiveWorkoutDraft,
  type WorkoutHistoryItem,
  type WorkoutSetEntry,
  type RestTimerState,
} from "@/lib/storage/workoutRepo";
import { activityStorage } from "@/lib/storage/activityStorage";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeDraft(raw: ActiveWorkoutDraft | null): ActiveWorkoutDraft | null {
  if (!raw) return null;

  const templateId =
    (raw as unknown as { templateId?: string | null }).templateId ?? undefined;
  const programRef =
    (raw as unknown as { programRef?: { type: "template" | "custom"; id: string } | null })
      .programRef ?? undefined;
  const programDayIndex =
    (raw as unknown as { programDayIndex?: number | null }).programDayIndex ?? undefined;
  const programDayLabel =
    (raw as unknown as { programDayLabel?: string | null }).programDayLabel ?? undefined;

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

  // Normalize restTimer - default to idle if missing
  const rawRestTimer = (raw as { restTimer?: RestTimerState }).restTimer;
  const restTimer: RestTimerState = rawRestTimer ?? { status: "idle" };

  return {
    ...raw,
    templateId,
    programRef,
    programDayIndex: (programDayIndex && programDayIndex >= 1 && programDayIndex <= 7
      ? (programDayIndex as 1 | 2 | 3 | 4 | 5 | 6 | 7)
      : undefined),
    programDayLabel,
    exercises,
    sets,
    restTimer,
  };
}

export type DraftStatus =
  | "none"
  | "active-current"
  | "active-other"
  | "completed-today";

export function useWorkoutDraft() {
  const [draft, setDraft] = useState<ActiveWorkoutDraft | null>(null);
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(normalizeDraft(workoutRepo.getActiveWorkoutDraft()));
    setHistory(workoutRepo.getHistory());
    setHydrated(true);

    // Listen for storage changes from other components/tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Only update if the relevant keys changed
      if (e.key === "gympepz.activeWorkoutDraft" || e.key === "gympepz.history") {
        setDraft(normalizeDraft(workoutRepo.getActiveWorkoutDraft()));
        setHistory(workoutRepo.getHistory());
      }
    };

    // Listen for custom events from same-page updates
    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string }>;
      const key = customEvent.detail?.key;

      // Only update if the relevant keys changed
      if (key === "gympepz.activeWorkoutDraft" || key === "gympepz.history") {
        console.log('[useWorkoutDraft] Storage changed:', key);
        setDraft(normalizeDraft(workoutRepo.getActiveWorkoutDraft()));
        setHistory(workoutRepo.getHistory());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("workout-storage-changed", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("workout-storage-changed", handleCustomStorageChange);
    };
  }, []);

  const saveDraft = useCallback((next: ActiveWorkoutDraft) => {
    workoutRepo.saveActiveWorkoutDraft(next);
    setDraft(next);
  }, []);

  const clearDraft = useCallback(() => {
    workoutRepo.clearActiveWorkoutDraft();
    setDraft(null);
  }, []);

  const discardDraft = useCallback(() => {
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

  const deleteHistoryItem = useCallback((id: string) => {
    workoutRepo.deleteHistoryItem(id);
    setHistory(workoutRepo.getHistory());
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

  const finish = useCallback((): string | null => {
    if (!draft) return null;
    const finished: WorkoutHistoryItem = {
      ...draft,
      completed: true,
      endedAt: nowIso(),
      updatedAt: nowIso(),
    };
    workoutRepo.addToHistory(finished);
    activityStorage.addPending(finished);
    workoutRepo.clearActiveWorkoutDraft();
    setDraft(null);
    setHistory(workoutRepo.getHistory());
    return finished.id;
  }, [draft]);

  const summary = useMemo(() => {
    const total = history.length;
    const completed = history.filter((h) => h.completed).length;
    return { total, completed };
  }, [history]);

  const getDraftStatus = useCallback(
    (programRef: { type: "template" | "custom"; id: string }, dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7): DraftStatus => {
      if (!draft) {
        // Check if already completed today for this program/day
        const todayKey = new Date().toISOString().split("T")[0];
        const completedToday = history.some((h) => {
          if (!h.completed) return false;
          const historyDate = new Date(h.date).toISOString().split("T")[0];
          if (historyDate !== todayKey) return false;
          const historyProgramId = h.programRef?.id ?? h.templateId;
          if (historyProgramId !== programRef.id) return false;
          return h.programDayIndex === dayIndex;
        });

        if (completedToday) return "completed-today";
        return "none";
      }

      // Check if draft matches this program/day
      const draftProgramId = draft.programRef?.id ?? draft.templateId;
      const matchesProgram = draftProgramId === programRef.id;
      const matchesDay = draft.programDayIndex === dayIndex;

      if (matchesProgram && matchesDay) return "active-current";
      return "active-other";
    },
    [draft, history],
  );

  const isCompletedToday = useCallback(
    (programRef: { type: "template" | "custom"; id: string }, dayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7): boolean => {
      const todayKey = new Date().toISOString().split("T")[0];
      return history.some((h) => {
        if (!h.completed) return false;
        const historyDate = new Date(h.date).toISOString().split("T")[0];
        if (historyDate !== todayKey) return false;
        const historyProgramId = h.programRef?.id ?? h.templateId;
        if (historyProgramId !== programRef.id) return false;
        return h.programDayIndex === dayIndex;
      });
    },
    [history],
  );

  const startRestTimer = useCallback(
    (durationMs: number) => {
      if (!draft) return;
      const restTimer: RestTimerState = {
        status: "running",
        startedAt: Date.now(),
        durationMs,
      };
      saveDraft({ ...draft, restTimer, updatedAt: nowIso() });
    },
    [draft, saveDraft],
  );

  const stopRestTimer = useCallback(() => {
    if (!draft) return;
    const restTimer: RestTimerState = { status: "idle" };
    saveDraft({ ...draft, restTimer, updatedAt: nowIso() });
  }, [draft, saveDraft]);

  const addRestTime = useCallback(
    (extraMs: number) => {
      if (!draft) return;
      if (draft.restTimer.status !== "running") return;
      const restTimer: RestTimerState = {
        status: "running",
        startedAt: draft.restTimer.startedAt,
        durationMs: draft.restTimer.durationMs + extraMs,
      };
      saveDraft({ ...draft, restTimer, updatedAt: nowIso() });
    },
    [draft, saveDraft]
  );

  return {
    hydrated,
    draft,
    saveDraft,
    clearDraft,
    discardDraft,
    addSet,
    updateSet,
    finish,
    history,
    refreshHistory,
    clearHistory,
    deleteHistoryItem,
    summary,
    getDraftStatus,
    isCompletedToday,
    startRestTimer,
    stopRestTimer,
    addRestTime,
  };
}
