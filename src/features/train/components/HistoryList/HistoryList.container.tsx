"use client";

import { useMemo } from "react";

import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { groupHistoryByProgram } from "@/features/train/domain/groupHistoryByProgram";
import type { HistoryListGroupVM, HistoryListItemVM, HistoryListViewProps } from "./HistoryList.types";
import { HistoryListView } from "./HistoryList.view";

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
    return `${date} • ${time}`;
  } catch {
    return iso;
  }
}

export function HistoryList() {
  const { history, hydrated, clearHistory, summary } = useWorkoutDraft();

  const viewProps: HistoryListViewProps = useMemo(() => {
    if (!hydrated) return { kind: "loading" };

    const sessionsText = `${summary.total} sessions`;
    const clearDisabled = history.length === 0;

    if (history.length === 0) {
      return {
        kind: "empty",
        sessionsText,
        onClear: () => clearHistory(),
        clearDisabled,
        backHref: "/train",
        goToTrainHref: "/train",
      };
    }

    const grouped = groupHistoryByProgram(history);
    const groups: HistoryListGroupVM[] = Object.entries(grouped).map(([programName, items]) => {
      const mapped: HistoryListItemVM[] = items.map((h) => {
        const exercisesCount = new Set(h.sets.map((s) => s.exerciseName)).size;
        const dayLabel = h.programDayLabel ?? (h.programDayIndex ? `Day ${h.programDayIndex}` : null);
        return {
          id: h.id,
          dateText: formatDateTime(h.endedAt ?? h.date),
          dayLabel,
          statusText: h.completed ? "Completed" : "Saved",
          exercisesCount,
          setsCount: h.sets.length,
        };
      });
      return { programName, sessionsCount: items.length, items: mapped };
    });

    return {
      kind: "ready",
      sessionsText,
      onClear: () => clearHistory(),
      clearDisabled,
      groups,
      backHref: "/train",
    };
  }, [hydrated, history, clearHistory, summary.total]);

  return <HistoryListView {...viewProps} />;
}
