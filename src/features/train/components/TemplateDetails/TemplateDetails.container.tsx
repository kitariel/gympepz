"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getTemplateById } from "@/lib/program-templates/templates";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useRouteContext } from "@/hooks/useRouteContext";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import type { ProgramTemplate, TemplateDayNumber } from "@/lib/program-templates/types";
import { getDayNumberForToday } from "@/features/train/domain/workoutSessionState";
import { trainPath } from "@/lib/routes";
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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"default" | "custom">("default");
  const [selectedDays, setSelectedDays] = useState<TemplateDayNumber[]>([]);

  const template = useMemo(() => getTemplateById(templateId), [templateId]);
  const today = useMemo(() => getDayNumberForToday(), []);

  const viewProps: TemplateDetailsViewProps = useMemo(() => {
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
    };
  }, [
    template,
    clearDraft,
    selectTemplate,
    saveActiveProgram,
    router,
    routeContext,
    scheduleOpen,
    scheduleMode,
    selectedDays,
    today,
  ]);

  return <TemplateDetailsView {...viewProps} />;
}
