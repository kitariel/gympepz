"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { pickWorkoutDayForWeekday } from "@/lib/program-templates/pick-workout-day";
import type {
  WorkoutLoggerExerciseVM,
  WorkoutLoggerViewProps,
} from "./WorkoutLogger.types";
import { WorkoutLoggerView } from "./WorkoutLogger.view";

function getDayNumberForToday(): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const d = new Date().getDay();
  if (d === 0) return 7;
  return d as 1 | 2 | 3 | 4 | 5 | 6;
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function WorkoutLogger() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    addSet,
    updateSet,
    finish,
    hydrated: draftHydrated,
  } = useWorkoutDraft();

  const hydrated = programHydrated && draftHydrated && prefsHydrated;

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
    if (selectedWorkoutDay === "auto") {
      return (
        pickWorkoutDayForWeekday(activeProgram.plan.days, today)?.day ?? null
      );
    }
    return (
      activeProgram.plan.days.find((d) => d.day === selectedWorkoutDay) ??
      pickWorkoutDayForWeekday(activeProgram.plan.days, today)?.day ??
      null
    );
  }, [activeProgram, today, selectedWorkoutDay, overrideDay]);

  const createDraftForDay = useCallback(() => {
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
      updatedAt: nowIso(),
    });
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

  const viewProps: WorkoutLoggerViewProps = useMemo(() => {
    if (!hydrated) return { kind: "loading" };

    if (!activeProgram) {
      return {
        kind: "noProgram",
        onBrowseTemplates: () => router.push("/train/templates"),
      };
    }

    if (!draft) {
      const isRestDay = Boolean(
        todaysPlan?.isRestDay ??
          (todaysPlan ? todaysPlan.items.length === 0 : false),
      );
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

        return {
          id: ex.id,
          name: ex.name,
          targetLabel,
          targetText,
          setRows: setsForExercise.map((set) => ({
            id: set.id,
            setNumber: set.setNumber,
            repsValue: set.actualReps,
            repsPlaceholder: set.targetReps ?? "reps / time",
            weightValue: set.actualWeight ?? "",
            weightPlaceholder: set.targetWeight ?? "weight / notes",
            completed: set.completed,
          })),
          canAddExtraSet: targetSets != null && count >= targetSets,
        };
      });

    return {
      kind: "logging",
      programName: draft.programName,
      setsDone,
      setsTotal,
      exercises,
      onAddSet: (exerciseId) => addSet(exerciseId),
      onUpdateSet: (setId, patch) => updateSet(setId, patch),
      onFinish: () => {
        const id = finish();
        router.push(
          id
            ? `/train/summary?logId=${encodeURIComponent(id)}`
            : "/train/history",
        );
      },
      finishDisabled: draft.sets.length === 0,
      onSaveExit: () => router.push("/train"),
    };
  }, [
    hydrated,
    activeProgram,
    draft,
    todaysPlan,
    router,
    createDraftForDay,
    addSet,
    updateSet,
    finish,
  ]);

  return <WorkoutLoggerView {...viewProps} />;
}
