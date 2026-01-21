"use client";

import { useMemo } from "react";

import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import type { HistoryListTimeGroupVM, HistoryListItemVM, HistoryListViewProps } from "./HistoryList.types";
import { HistoryListView } from "./HistoryList.view";

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
}

function getTimeGroup(dateStr: string): "Today" | "Yesterday" | "This Week" | "Earlier" {
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

  if (date >= startOfToday) return "Today";
  if (date >= startOfYesterday) return "Yesterday";
  if (date >= startOfWeek) return "This Week";
  return "Earlier";
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

    // Group by time
    const groupedByTime = {
      Today: [] as HistoryListItemVM[],
      Yesterday: [] as HistoryListItemVM[],
      "This Week": [] as HistoryListItemVM[],
      Earlier: [] as HistoryListItemVM[],
    };

    for (const h of history) {
      const dateStr = h.endedAt ?? h.date;
      const group = getTimeGroup(dateStr);
      const exercisesCount = new Set(h.sets.map((s) => s.exerciseName)).size;
      const dayLabel = h.programDayLabel ?? (h.programDayIndex ? `Day ${h.programDayIndex}` : null);

      groupedByTime[group].push({
        id: h.id,
        dateText: formatTime(dateStr),
        dayLabel,
        programName: h.programName,
        statusText: h.completed ? "Completed" : "Saved",
        exercisesCount,
        setsCount: h.sets.length,
      });
    }

    const timeGroups: HistoryListTimeGroupVM[] = (
      ["Today", "Yesterday", "This Week", "Earlier"] as const
    )
      .filter((label) => groupedByTime[label].length > 0)
      .map((label) => ({
        label,
        items: groupedByTime[label],
      }));

    return {
      kind: "ready",
      sessionsText,
      onClear: () => clearHistory(),
      onDeleteItem: () => {
        // Delete functionality not available yet
      },
      clearDisabled,
      timeGroups,
      backHref: "/train",
    };
  }, [hydrated, history, clearHistory, summary.total]);

  return <HistoryListView {...viewProps} />;
}
