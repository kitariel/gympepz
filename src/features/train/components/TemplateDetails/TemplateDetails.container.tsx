"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useRouteContext } from "@/hooks/useRouteContext";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getCachedTemplate } from "@/lib/storage/templateCache";
import type { ProgramTemplate, TemplateDayNumber } from "@/lib/program-templates/types";
import { getDayNumberForToday } from "@/features/train/domain/workoutSessionState";
import { trainPath } from "@/lib/routes";
import { api } from "@/trpc/react";
import type { TemplateDetailsDayVM, TemplateDetailsViewProps } from "./TemplateDetails.types";
import { TemplateDetailsView } from "./TemplateDetails.view";

const WEEKDAY_LABELS: Record<TemplateDayNumber, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};
const WEEKDAY_ORDER: TemplateDayNumber[] = [1, 2, 3, 4, 5, 6, 7];

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeExerciseName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/^circuit:\s*/g, "")
    .replace(/[-/]/g, " ")
    .replace(/\bor\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function baseExerciseName(value: string): string {
  const withoutParens = value.replace(/\(.*?\)/g, "").trim();
  const splitOnSlash = withoutParens.split(" / ")[0];
  const splitOnOr = splitOnSlash.split(" or ")[0];
  return splitOnOr.replace(/^circuit:\s*/i, "").trim();
}

function getWorkoutDays(plan: ProgramTemplate["plan"]): ProgramTemplate["plan"]["days"] {
  return plan.days
    .slice()
    .filter((d) => !d.isRestDay && d.items.length > 0)
    .sort((a, b) => a.day - b.day);
}

function remapPlanToWeekdays(
  plan: ProgramTemplate["plan"],
  weekdays: TemplateDayNumber[],
): ProgramTemplate["plan"] {
  const workoutDays = getWorkoutDays(plan);
  if (workoutDays.length !== weekdays.length) return plan;

  const mapped = workoutDays.map((day, idx) => ({
    ...day,
    day: weekdays[idx] ?? day.day,
  }));

  return { days: mapped };
}

function orderWeekdaysForStart(
  weekdays: TemplateDayNumber[],
  today: TemplateDayNumber,
): TemplateDayNumber[] {
  const sorted = weekdays.slice().sort((a, b) => a - b);
  if (!sorted.includes(today)) return sorted;
  return [
    today,
    ...sorted.filter((day) => day > today),
    ...sorted.filter((day) => day < today),
  ];
}

export function TemplateDetails({ templateId }: { templateId: string }) {
  const router = useRouter();
  const routeContext = useRouteContext();
  const { selectTemplate, saveActiveProgram } = useActiveProgram();
  const { clearDraft } = useWorkoutDraft();
  const { isOnline } = useOnlineStatus();
  const [cachedTemplate, setCachedTemplate] = useState<Awaited<ReturnType<typeof getCachedTemplate>> | null>(null);
  const [cacheLoading, setCacheLoading] = useState(false);

  const { data: templateData, isLoading } = api.template.getById.useQuery(
    { id: templateId },
    { enabled: isOnline }
  );
  const { data: exercises = [] } = api.exercise.list.useQuery(
    { take: 1000 },
    { enabled: Boolean(templateData) },
  );
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"default" | "custom">("default");
  const [selectedDays, setSelectedDays] = useState<TemplateDayNumber[]>([]);

  useEffect(() => {
    if (isOnline) return;
    let active = true;
    setCacheLoading(true);
    const load = async () => {
      try {
        const cached = await getCachedTemplate(templateId);
        if (!active) return;
        setCachedTemplate(cached);
      } catch (error) {
        console.error("[TemplateDetails] Failed to load cached template:", error);
      } finally {
        if (active) setCacheLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isOnline, templateId]);

  const template = useMemo<ProgramTemplate | null>(() => {
    if (!isOnline && cachedTemplate) {
      return {
        id: cachedTemplate.id,
        name: cachedTemplate.name,
        description: cachedTemplate.description,
        tags: cachedTemplate.tags as ProgramTemplate["tags"],
        daysPerWeek: cachedTemplate.daysPerWeek,
        weeks: cachedTemplate.weeks ?? undefined,
        plan: {
          days: cachedTemplate.days.map((day) => ({
            day: day.day as TemplateDayNumber,
            label: day.label,
            isRestDay: day.isRestDay,
            items: day.items.map((item) => ({
              order: item.order,
              sets: item.sets,
              reps: item.reps,
              weight: item.weight ?? undefined,
              exerciseId: item.exerciseId ?? undefined,
              nameFallback: item.exerciseName ?? item.nameFallback ?? "Exercise",
            })),
          })),
        },
      };
    }
    if (!templateData) return null;
    const exerciseIndex = new Map(
      exercises.map((ex) => [normalizeExerciseName(ex.name), ex]),
    );
    const resolveExerciseId = (fallback?: string | null, exerciseId?: string | null) => {
      if (exerciseId) return exerciseId;
      if (!fallback) return undefined;
      const base = normalizeExerciseName(baseExerciseName(fallback));
      const exact = exerciseIndex.get(base);
      if (exact) return exact.id;
      const startsWith = Array.from(exerciseIndex.entries()).find(([key]) =>
        key.startsWith(base),
      );
      if (startsWith) return startsWith[1].id;
      const includes = Array.from(exerciseIndex.entries()).find(([key]) =>
        key.includes(base),
      );
      if (includes) return includes[1].id;
      return undefined;
    };

    return {
      id: templateData.id,
      name: templateData.name,
      description: templateData.description,
      tags: templateData.tags as ProgramTemplate["tags"],
      daysPerWeek: templateData.daysPerWeek,
      weeks: templateData.weeks ?? undefined,
      plan: {
        days: templateData.days.map((day) => ({
          day: day.day as TemplateDayNumber,
          label: day.label,
          isRestDay: day.isRestDay,
          items: day.items.map((item) => ({
            order: item.order,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight ?? undefined,
            exerciseId: resolveExerciseId(
              item.nameFallback ?? item.exercise?.name ?? undefined,
              item.exerciseId,
            ),
            nameFallback: item.nameFallback ?? item.exercise?.name ?? "Exercise",
          })),
        })),
      },
    };
  }, [templateData, exercises, isOnline, cachedTemplate]);
  const today = useMemo(() => getDayNumberForToday(), []);

  const viewProps: TemplateDetailsViewProps = useMemo(() => {
    if ((isOnline && isLoading) || (!isOnline && cacheLoading)) {
      return { kind: "loading", backHref: trainPath(routeContext, "templates") };
    }

    if (!template) {
      return { kind: "notFound", backHref: trainPath(routeContext, "templates") };
    }

    const workoutDays = getWorkoutDays(template.plan);
    const defaultWeekdays = workoutDays.map((day) => day.day);
    const hasToday = defaultWeekdays.includes(today);
    const daysPerWeek = workoutDays.length;

    const days: TemplateDetailsDayVM[] = template.plan.days
      .slice()
      .sort((a, b) => a.day - b.day)
      .map((day) => ({
        dayIndex: day.day,
        label: day.label,
        items: day.items
          .slice()
          .sort((x, y) => x.order - y.order)
          .map((it) => ({
            name: it.nameFallback ?? "Exercise",
            setsText: `${it.sets}×${it.reps}${it.weight ? ` • ${it.weight}` : ""}`,
          })),
      }));

    const useProgram = (plan: ProgramTemplate["plan"]) => {
      clearDraft();
      selectTemplate(template.id);
      saveActiveProgram({
        templateId: template.id,
        name: template.name,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        plan,
      });
      router.push(trainPath(routeContext, "overview"));
    };

    const handleUse = () => {
      if (hasToday) {
        useProgram(template.plan);
        return;
      }
      setScheduleMode("default");
      setSelectedDays([
        today,
        ...defaultWeekdays.filter((day) => day !== today),
      ].slice(0, daysPerWeek));
      setScheduleOpen(true);
    };

    const schedulePrompt = hasToday
      ? undefined
      : {
          open: scheduleOpen,
          onOpenChange: setScheduleOpen,
          mode: scheduleMode,
          onModeChange: setScheduleMode,
          daysPerWeek,
          todayLabel: WEEKDAY_LABELS[today],
          allDays: WEEKDAY_ORDER.map((day) => ({
            value: day,
            label: WEEKDAY_LABELS[day],
          })),
          defaultDays: defaultWeekdays.map((day) => ({
            value: day,
            label: WEEKDAY_LABELS[day],
          })),
          selectedDays,
          onToggleDay: (value: TemplateDayNumber) => {
            setSelectedDays((prev) => {
              if (prev.includes(value)) {
                return prev.filter((day) => day !== value);
              }
              if (prev.length >= daysPerWeek) return prev;
              return [...prev, value];
            });
          },
          onConfirmDefault: () => {
            setScheduleOpen(false);
            useProgram(template.plan);
          },
          onConfirmCustom: () => {
            if (selectedDays.length !== daysPerWeek || !selectedDays.includes(today)) return;
            setScheduleOpen(false);
            useProgram(remapPlanToWeekdays(template.plan, orderWeekdaysForStart(selectedDays, today)));
          },
          customValid: selectedDays.length === daysPerWeek && selectedDays.includes(today),
        };

    return {
      kind: "ready",
      name: template.name,
      description: template.description,
      daysPerWeek: template.daysPerWeek,
      days,
      template,
      onUse: handleUse,
      schedulePrompt,
      backHref: trainPath(routeContext, "templates"),
      offlineNotice: !isOnline ? "Offline • Using saved template" : undefined,
    };
  }, [
    template,
    isLoading,
    cacheLoading,
    clearDraft,
    selectTemplate,
    saveActiveProgram,
    router,
    routeContext,
    scheduleOpen,
    scheduleMode,
    selectedDays,
    today,
    isOnline,
  ]);

  return <TemplateDetailsView {...viewProps} />;
}
