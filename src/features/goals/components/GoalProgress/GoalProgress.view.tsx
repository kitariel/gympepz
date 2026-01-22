"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { GoalProgressViewModel } from "./GoalProgress.types";

export function GoalProgressView({
  title,
  subtitle,
  progress,
  currentValue,
  targetValue,
  unit,
  trend,
  history,
}: GoalProgressViewModel) {
  const TrendIcon =
    trend === "improving"
      ? TrendingUp
      : trend === "declining"
        ? TrendingDown
        : Minus;
  const trendColor =
    trend === "improving"
      ? "text-green-500"
      : trend === "declining"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-muted-foreground text-xs">
          {currentValue} {unit} / {targetValue} {unit}
        </p>
      </div>

      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className="capitalize text-muted-foreground">{trend}</span>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent progress</h3>
          <ul className="divide-border divide-y rounded-md border text-sm">
            {history.slice(0, 10).map((h, i) => (
              <li
                key={`${h.date}-${h.value}-${i}`}
                className="flex justify-between px-3 py-2"
              >
                <span className="text-muted-foreground">{h.date}</span>
                <span className="font-medium">
                  {h.value} {unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
