"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import {
  getDayNumberForToday,
  getEffectivePlanDay,
} from "@/features/train/domain/workoutSessionState";
import {
  getPreviousPerformance,
  formatRelativeDate,
} from "@/features/train/domain/previousPerformance";
import { trainToast } from "@/features/train/utils/toast";
import type {
  WorkoutLoggerExerciseVM,
  WorkoutLoggerViewProps,
} from "./WorkoutLogger.types";
import { WorkoutLoggerView } from "./WorkoutLogger.view";

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function WorkoutLogger() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null,
  );

  const {
    activeProgram,
    currentProgramRef,
    hydrated: programHydrated,
  } = useActiveProgram();
  const { hydrated: prefsHydrated, selectedWorkoutDay } = useTrainPrefs();
  const {
    draft,
    saveDraft,
    clearDraft,
    discardDraft,
    addSet,
    updateSet,
    finish,
    history: workoutHistory,
    hydrated: draftHydrated,
    getDraftStatus,
    isCompletedToday,
    startRestTimer,
    stopRestTimer,
  } = useWorkoutDraft();

  const hydrated = programHydrated && draftHydrated && prefsHydrated;

  // Clear error on successful hydration
  useEffect(() => {
    if (hydrated && error) {
      setError(null);
    }
  }, [hydrated, error]);

  const overrideDay = useMemo(() => {
    const raw = searchParams.get("day");
    if (!raw) return null;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 1 && n <= 7)
      return n as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    return null;
  }, [searchParams]);

  const autoStart = useMemo(
    () => searchParams.get("autostart") === "1",
    [searchParams],
  );
  const autoStartedRef = useRef(false);

  const today = useMemo(() => getDayNumberForToday(), []);
  const todaysPlan = useMemo(() => {
    if (!activeProgram) return null;
    if (overrideDay != null) {
      return activeProgram.plan.days.find((d) => d.day === overrideDay) ?? null;
    }

    return getEffectivePlanDay({
      days: activeProgram.plan.days,
      selectedWorkoutDay,
      today,
    });
  }, [activeProgram, today, selectedWorkoutDay, overrideDay]);

  const createDraftForDay = useCallback(() => {
    try {
      if (!hydrated) return;
      if (!activeProgram) return;
      if (draft) return;
      if (!todaysPlan) return;
      if (todaysPlan.isRestDay || todaysPlan.items.length === 0) return;

      const exercises = todaysPlan.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((it) => ({
          id: makeId("ex"),
          name: it.nameFallback ?? "Exercise",
          order: it.order,
          targetSets: it.sets ?? null,
          targetReps: it.reps ?? null,
          targetWeight: it.weight ?? null,
        }));

      const sets = exercises.flatMap((ex) => {
        const target = ex.targetSets ?? 0;
        if (!target || target <= 0) return [];
        return Array.from({ length: target }, (_, idx) => ({
          id: makeId("set"),
          exerciseId: ex.id,
          exerciseName: ex.name,
          setNumber: idx + 1,
          targetReps: ex.targetReps ?? null,
          actualReps: ex.targetReps ?? "",
          targetWeight: ex.targetWeight ?? null,
          actualWeight: ex.targetWeight ?? null,
          completed: false,
          createdAt: nowIso(),
        }));
      });

      autoStartedRef.current = true;
      saveDraft({
        id: makeId("workout"),
        templateId: activeProgram.templateId,
        programRef: currentProgramRef ?? undefined,
        programDayIndex: todaysPlan.day,
        programDayLabel: todaysPlan.label,
        programName: activeProgram.name,
        date: nowIso(),
        startedAt: nowIso(),
        completed: false,
        exercises,
        sets,
        notes: null,
        restTimer: { status: "idle" },
        updatedAt: nowIso(),
      });

      trainToast.workoutStarted();
    } catch (err) {
      console.error("Failed to create workout draft:", err);
      setError({
        title: "Failed to start workout",
        message: "Something went wrong. Please try again.",
      });
      trainToast.error("Failed to start workout");
    }
  }, [
    hydrated,
    activeProgram,
    currentProgramRef,
    draft,
    todaysPlan,
    saveDraft,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    if (!activeProgram) return;
    if (!draft) return;
    const draftProgramId = draft.programRef?.id ?? draft.templateId;
    if (!draftProgramId) return;
    if (draftProgramId === activeProgram.templateId) return;
    clearDraft();
  }, [hydrated, activeProgram, draft, clearDraft]);

  useEffect(() => {
    if (!autoStart) return;
    if (autoStartedRef.current) return;
    if (draft) return;
    createDraftForDay();
  }, [autoStart, draft, createDraftForDay]);

  const copyPrevious = useCallback(
    (exerciseId: string, setId: string) => {
      if (!draft) return;
      const exercise = draft.exercises.find((e) => e.id === exerciseId);
      if (!exercise) return;

      const currentProgramId = currentProgramRef?.id ?? activeProgram?.templateId;
      const previous = getPreviousPerformance({
        exerciseName: exercise.name,
        history: workoutHistory,
        currentProgramId,
      });

      if (!previous) return;

      const nextSets = draft.sets.map((s) =>
        s.id === setId
          ? {
              ...s,
              actualReps: previous.reps,
              actualWeight: previous.weight,
            }
          : s,
      );
      saveDraft({ ...draft, sets: nextSets, updatedAt: nowIso() });
    },
    [draft, currentProgramRef, activeProgram, workoutHistory, saveDraft],
  );

  const copyLastSet = useCallback(
    (exerciseId: string, setId: string) => {
      if (!draft) return;

      // Find all completed sets for this exercise in current session
      const completedSets = draft.sets
        .filter((s) => s.exerciseId === exerciseId && s.completed)
        .sort((a, b) => b.setNumber - a.setNumber); // Sort descending to get last one first

      const lastCompletedSet = completedSets[0];
      if (!lastCompletedSet) return;

      const nextSets = draft.sets.map((s) =>
        s.id === setId
          ? {
              ...s,
              actualReps: lastCompletedSet.actualReps,
              actualWeight: lastCompletedSet.actualWeight,
            }
          : s,
      );
      saveDraft({ ...draft, sets: nextSets, updatedAt: nowIso() });
    },
    [draft, saveDraft],
  );

  const viewProps: WorkoutLoggerViewProps = useMemo(() => {
    if (!hydrated) return { kind: "loading" };

    if (error) {
      return {
        kind: "error",
        title: error.title,
        message: error.message,
        onRetry: () => {
          setError(null);
          createDraftForDay();
        },
        onGoBack: () => router.push("/train"),
      };
    }

    if (!activeProgram) {
      return {
        kind: "noProgram",
        onBrowseTemplates: () => router.push("/train/templates"),
      };
    }

    // Check for draft conflicts before showing other states
    if (currentProgramRef && todaysPlan?.day) {
      const status = getDraftStatus(currentProgramRef, todaysPlan.day);

      if (status === "active-other" && draft) {
        return {
          kind: "draftConflict",
          activeDraftProgram: draft.programName,
          activeDraftDay: draft.programDayLabel ?? null,
          requestedProgram: activeProgram.name,
          requestedDay: todaysPlan.label ?? null,
          onResume: () => router.push("/train/log"),
          onDiscard: () => {
            discardDraft();
            createDraftForDay();
          },
          onCancel: () => router.push("/train/overview"),
        };
      }
    }

    if (!draft) {
      const isRestDay = Boolean(
        todaysPlan?.isRestDay ??
          (todaysPlan ? todaysPlan.items.length === 0 : false),
      );

      const completedTodayCheck =
        !isRestDay &&
        todaysPlan?.day != null &&
        currentProgramRef != null &&
        isCompletedToday(currentProgramRef, todaysPlan.day);

      if (completedTodayCheck) {
        return {
          kind: "completedToday",
          programName: activeProgram.name,
          dayLabel: todaysPlan?.label ?? null,
          onTakeRestDay: () => router.push("/train/overview"),
          onRepeat: createDraftForDay,
          onBackToOverview: () => router.push("/train/overview"),
        };
      }

      return {
        kind: "noDraft",
        programName: activeProgram.name,
        dayLabel: todaysPlan?.label ?? null,
        isRestDay,
        startDisabled: !todaysPlan || isRestDay,
        onStart: createDraftForDay,
        onBackToOverview: () => router.push("/train/overview"),
        onUseAutoDay: () => router.push("/train/log"),
      };
    }

    const setsDone = draft.sets.filter((s) => s.completed).length;
    const setsTotal = draft.sets.length;

    const setsByExercise = draft.sets.reduce<Record<string, number>>(
      (acc, s) => {
        acc[s.exerciseId] = (acc[s.exerciseId] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const exercises: WorkoutLoggerExerciseVM[] = draft.exercises
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((ex) => {
        const setsForExercise = draft.sets
          .filter((s) => s.exerciseId === ex.id)
          .slice()
          .sort((a, b) => a.setNumber - b.setNumber);

        const count = setsByExercise[ex.id] ?? 0;
        const completed = setsForExercise.filter((s) => s.completed).length;
        const targetSets = ex.targetSets ?? null;
        const targetLabel =
          targetSets != null
            ? `${completed}/${targetSets} sets`
            : `${completed} sets`;

        const targetText =
          ex.targetReps || ex.targetWeight || ex.targetSets
            ? `Target:${ex.targetSets != null ? ` ${ex.targetSets} sets` : ""}${ex.targetReps ? ` • ${ex.targetReps}` : ""}${ex.targetWeight ? ` • ${ex.targetWeight}` : ""}`
            : null;

        const currentProgramId = currentProgramRef?.id ?? activeProgram.templateId;
        const previousPerformance = getPreviousPerformance({
          exerciseName: ex.name,
          history: workoutHistory,
          currentProgramId,
        });

        return {
          id: ex.id,
          name: ex.name,
          targetLabel,
          targetText,
          previousPerformance: previousPerformance
            ? {
                weight: previousPerformance.weight,
                reps: previousPerformance.reps,
                relativeDate: formatRelativeDate(previousPerformance.date),
                programName: previousPerformance.programName,
                isSameProgram: previousPerformance.isSameProgram,
              }
            : null,
          setRows: setsForExercise.map((set, setIndex) => {
            // Can copy last set if there's at least one completed set before this one
            const completedSetsBefore = setsForExercise
              .slice(0, setIndex)
              .filter((s) => s.completed);

            return {
              id: set.id,
              setNumber: set.setNumber,
              repsValue: set.actualReps,
              repsPlaceholder: set.targetReps ?? "reps / time",
              weightValue: set.actualWeight ?? "",
              weightPlaceholder: set.targetWeight ?? "weight / notes",
              completed: set.completed,
              canCopyLastSet: completedSetsBefore.length > 0,
            };
          }),
          canAddExtraSet: targetSets != null && count >= targetSets,
        };
      });

    return {
      kind: "logging",
      programName: draft.programName,
      setsDone,
      setsTotal,
      exercises,
      restTimer: draft.restTimer,
      onAddSet: (exerciseId) => addSet(exerciseId),
      onUpdateSet: (setId, patch) => updateSet(setId, patch),
      onCopyPrevious: (exerciseId, setId) => copyPrevious(exerciseId, setId),
      onCopyLastSet: (exerciseId, setId) => copyLastSet(exerciseId, setId),
      onStartRestTimer: (durationMs) => startRestTimer(durationMs),
      onStopRestTimer: () => stopRestTimer(),
      onFinish: () => {
        try {
          const id = finish();
          trainToast.workoutFinished();
          router.push(
            id
              ? `/train/summary?logId=${encodeURIComponent(id)}`
              : "/train/history",
          );
        } catch (err) {
          console.error("Failed to finish workout:", err);
          trainToast.saveFailed();
        }
      },
      onDiscardWorkout: () => {
        discardDraft();
        trainToast.workoutDiscarded();
        router.push("/train");
      },
      finishDisabled: draft.sets.length === 0,
      onSaveExit: () => router.push("/train"),
    };
  }, [
    hydrated,
    error,
    activeProgram,
    currentProgramRef,
    workoutHistory,
    draft,
    todaysPlan,
    router,
    createDraftForDay,
    discardDraft,
    getDraftStatus,
    isCompletedToday,
    addSet,
    updateSet,
    copyPrevious,
    copyLastSet,
    startRestTimer,
    stopRestTimer,
    finish,
  ]);

  return <WorkoutLoggerView {...viewProps} />;
}
