import type { NextAction } from "@/lib/program-templates/getNextAction";
import type { WorkoutHistoryItem } from "@/lib/storage/workoutRepo";

export type SummaryMetrics = {
  completedSets: number;
  totalSets: number;
  durationMs: number;
  volume: number;
  exerciseCount: number;
  completionPercent: number;
};

export type SummaryViewProps =
  | { state: "loading" }
  | {
      state: "missing";
      historyHref: string;
      overviewHref: string;
    }
  | {
      state: "ready";
      item: WorkoutHistoryItem;
      metrics: SummaryMetrics;
      dayLabel: string;
      finishedAtIso: string;
      isFullCompletion: boolean;
      nextAction: NextAction | null;
      onStartNext?: () => void;
      onSkipRest?: () => void;
      onRepeat?: () => void;
      homeHref: string;
      historyHref: string;
    };
