"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useCustomPrograms } from "@/hooks/useCustomPrograms";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useRouteContext } from "@/hooks/useRouteContext";
import { useTrainBuilderDraft } from "@/hooks/useTrainBuilderDraft";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { trainPath } from "@/lib/routes";
import { api } from "@/trpc/react";
import type {
  ProgramTemplateDay,
  ProgramTemplateItem,
  TemplateDayNumber,
} from "@/lib/program-templates/types";
import {
  defaultDays,
  makeId,
  mergeDays,
  nowIso,
  toPlanDays,
  type BuilderDay,
} from "@/features/train/domain/customProgramBuilder";
import type {
  CustomProgramBuilderViewProps,
  ExerciseResultVM,
  PickerTab,
} from "./CustomProgramBuilder.types";
import { CustomProgramBuilderView } from "./CustomProgramBuilder.view";

function toExerciseVm(input: {
  id: string;
  name: string;
  muscleGroup?: string | null;
}): ExerciseResultVM {
  return {
    id: input.id,
    name: input.name,
    muscleGroup: input.muscleGroup ?? null,
  };
}

export function CustomProgramBuilder() {
  const router = useRouter();
  const routeContext = useRouteContext();
  const { isOnline } = useOnlineStatus();
  const { saveActiveProgram, selectTemplate } = useActiveProgram();
  const { clearDraft } = useWorkoutDraft();
  const { get: getCustomProgram, upsert: upsertCustomProgram } =
    useCustomPrograms();
  const {
    hydrated: draftHydrated,
    draft,
    save: saveDraft,
    clear: clearDraftStorage,
  } = useTrainBuilderDraft();

  const [programName, setProgramName] = useState("My 7-day plan");
  const [days, setDays] = useState<BuilderDay[]>(() => defaultDays());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restoredNotice, setRestoredNotice] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState<TemplateDayNumber | null>(null);
  const [pickerTab, setPickerTab] = useState<PickerTab>("manual");
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [manualName, setManualName] = useState("");

  const q = query.trim();
  const mg = muscleGroup.trim();
  const eq = equipment.trim();
  const diff = difficulty.trim();

  const exercisesQuery = api.exercise.list.useQuery(
    {
      q: q.length ? q : undefined,
      muscleGroup: mg.length ? mg : undefined,
      equipment: eq.length ? eq : undefined,
      difficulty: diff.length ? diff : undefined,
      take: 50,
    },
    { enabled: isOnline && pickerOpen && pickerTab === "library" },
  );

  useEffect(() => {
    if (!pickerOpen) return;
    if (!isOnline) {
      setPickerTab("manual");
      return;
    }
    if (pickerTab === "library" && exercisesQuery.isError) {
      setPickerTab("manual");
    }
  }, [pickerOpen, isOnline, pickerTab, exercisesQuery.isError]);

  const openPicker = (day: TemplateDayNumber) => {
    setPickerDay(day);
    setPickerTab(isOnline ? "library" : "manual");
    setQuery("");
    setMuscleGroup("");
    setEquipment("");
    setDifficulty("");
    setManualName("");
    setPickerOpen(true);
  };

  const addItemToDay = (
    day: TemplateDayNumber,
    partial: Pick<ProgramTemplateItem, "nameFallback"> &
      Partial<ProgramTemplateItem>,
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const nextOrder = d.items.length;
        const next: ProgramTemplateItem = {
          order: nextOrder,
          nameFallback: partial.nameFallback,
          exerciseId: partial.exerciseId,
          sets: partial.sets ?? 3,
          reps: partial.reps ?? "10",
          weight: partial.weight,
        };
        return { ...d, items: [...d.items, next] };
      }),
    );
  };

  const removeItem = (day: TemplateDayNumber, order: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const nextItems = d.items
          .filter((it) => it.order !== order)
          .map((it, idx) => ({ ...it, order: idx }));
        return { ...d, items: nextItems };
      }),
    );
  };

  const moveItem = (
    day: TemplateDayNumber,
    fromIndex: number,
    toIndex: number,
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const items = d.items.slice().sort((a, b) => a.order - b.order);
        if (fromIndex < 0 || fromIndex >= items.length) return d;
        if (toIndex < 0 || toIndex >= items.length) return d;
        const next = items.slice();
        const removed = next.splice(fromIndex, 1);
        const moved = removed[0];
        if (!moved) return d;
        next.splice(toIndex, 0, moved);
        const normalized = next.map((it, idx) => ({ ...it, order: idx }));
        return { ...d, items: normalized };
      }),
    );
  };

  const updateItem = (
    day: TemplateDayNumber,
    order: number,
    patch: Partial<
      Pick<ProgramTemplateItem, "sets" | "reps" | "weight" | "nameFallback">
    >,
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const nextItems = d.items.map((it) =>
          it.order === order ? { ...it, ...patch } : it,
        );
        return { ...d, items: nextItems };
      }),
    );
  };

  const totalExercises = useMemo(
    () => days.reduce((sum, d) => sum + d.items.length, 0),
    [days],
  );
  const canSave = totalExercises > 0 && programName.trim().length > 0;

  const saveProgram = () => {
    const planDays: ProgramTemplateDay[] = toPlanDays(days);
    const id = editingId ?? makeId("custom");
    const now = nowIso();

    clearDraft();
    selectTemplate(id);
    saveActiveProgram({
      templateId: id,
      name: programName.trim(),
      createdAt: now,
      updatedAt: now,
      plan: { days: planDays },
    });
    upsertCustomProgram({
      id,
      name: programName.trim(),
      createdAt: now,
      updatedAt: now,
      plan: { days: planDays },
    });

    router.push(trainPath(routeContext, "overview"));
  };

  const { debounced: debouncedSaveDraft } = useDebouncedCallback(
    (next: {
      editingId: string | null;
      programName: string;
      days: BuilderDay[];
    }) => {
      saveDraft({
        editingId: next.editingId,
        programName: next.programName,
        days: next.days,
        updatedAt: nowIso(),
      });
    },
    600,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    const record = getCustomProgram(id);
    if (!record) return;

    setEditingId(record.id);
    setProgramName(record.name);
    setDays(mergeDays(record.plan.days));
  }, [getCustomProgram]);

  useEffect(() => {
    if (!draftHydrated) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) return;
    if (!draft) return;
    if (draft.editingId != null) return;

    setEditingId(null);
    setProgramName(draft.programName);
    setDays(mergeDays(draft.days));
    setRestoredNotice(true);
  }, [draftHydrated, draft]);

  useEffect(() => {
    if (!draftHydrated) return;
    debouncedSaveDraft({ editingId, programName, days });
  }, [draftHydrated, editingId, programName, days, debouncedSaveDraft]);

  const exercisesVm = useMemo(() => {
    const items = (exercisesQuery.data ?? []).map(toExerciseVm);
    if (exercisesQuery.isLoading) return { status: "loading" as const, items };
    if (exercisesQuery.isError) return { status: "error" as const, items };
    return { status: "ready" as const, items };
  }, [exercisesQuery.data, exercisesQuery.isLoading, exercisesQuery.isError]);

  const viewProps: CustomProgramBuilderViewProps = {
    isOnline,
    totalExercises,
    editingId,
    programName,
    onProgramNameChange: (next) => setProgramName(next),
    restoredNotice,
    onClearDraft: () => {
      clearDraftStorage();
      setRestoredNotice(false);
    },
    days,
    onDayLabelChange: (day, next) =>
      setDays((prev) =>
        prev.map((x) => (x.day === day ? { ...x, label: next } : x)),
      ),
    onDayRestChange: (day, checked) =>
      setDays((prev) =>
        prev.map((x) =>
          x.day === day
            ? { ...x, isRestDay: checked, items: checked ? [] : x.items }
            : x,
        ),
      ),
    onMoveItem: moveItem,
    onRemoveItem: removeItem,
    onUpdateItem: updateItem,
    onOpenPicker: openPicker,
    canSave,
    onSave: saveProgram,
    onCancel: () => router.push(trainPath(routeContext)),

    pickerOpen,
    onPickerOpenChange: setPickerOpen,
    pickerDay,

    pickerTab,
    onPickerTabChange: (next) => setPickerTab(next),

    query,
    onQueryChange: setQuery,
    muscleGroup,
    onMuscleGroupChange: setMuscleGroup,
    equipment,
    onEquipmentChange: setEquipment,
    difficulty,
    onDifficultyChange: setDifficulty,
    manualName,
    onManualNameChange: setManualName,

    exercises: exercisesVm,
    onSelectExercise: (exercise) => {
      if (!pickerDay) return;
      addItemToDay(pickerDay, {
        nameFallback: exercise.name,
        exerciseId: exercise.id,
      });
      setPickerOpen(false);
    },
    onAddManual: () => {
      if (!pickerDay) return;
      const name = manualName.trim();
      if (!name.length) return;
      addItemToDay(pickerDay, { nameFallback: name });
      setPickerOpen(false);
    },
  };

  return <CustomProgramBuilderView {...viewProps} />;
}
