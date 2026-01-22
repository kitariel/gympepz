"use client";

import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Minus,
  Pencil,
  Repeat,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GoalCardViewModel } from "./GoalCard.types";

const GOAL_TYPE_CONFIG = {
  strength: {
    icon: Dumbbell,
    label: "Strength",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    iconColor: "text-blue-500",
  },
  reps: {
    icon: Repeat,
    label: "Reps",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
    iconColor: "text-emerald-500",
  },
  consistency: {
    icon: Calendar,
    label: "Consistency",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-600",
    iconColor: "text-violet-500",
  },
  bodyweight: {
    icon: Scale,
    label: "Bodyweight",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    iconColor: "text-amber-500",
  },
} as const;

function getProgressColor(progress: number, status: string) {
  if (status === "completed") return "bg-emerald-500";
  if (status === "abandoned") return "bg-muted-foreground/30";
  if (progress >= 75) return "bg-emerald-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-amber-500";
  return "bg-rose-500";
}

export function GoalCardView({
  title,
  subtitle,
  goalType,
  progress,
  deadline,
  status,
  trend,
  onView,
  onEdit,
  onDelete,
}: GoalCardViewModel) {
  const TrendIcon =
    trend === "improving"
      ? TrendingUp
      : trend === "declining"
        ? TrendingDown
        : Minus;

  const trendColor =
    trend === "improving"
      ? "text-emerald-500"
      : trend === "declining"
        ? "text-rose-500"
        : "text-muted-foreground";

  const trendLabel =
    trend === "improving"
      ? "On track"
      : trend === "declining"
        ? "Needs attention"
        : "Stable";

  const typeConfig = GOAL_TYPE_CONFIG[goalType] ?? GOAL_TYPE_CONFIG.strength;
  const TypeIcon = typeConfig.icon;

  const isOverdue = deadline && status === "active" && isPast(new Date(deadline));
  const progressColor = getProgressColor(progress, status);
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-0.5",
        "border-border/50 hover:border-border",
        status === "completed" && "bg-emerald-500/5 border-emerald-500/20",
        status === "abandoned" && "opacity-60",
      )}
    >
      {/* Status indicator strip */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
          status === "completed" && "bg-emerald-500",
          status === "abandoned" && "bg-muted-foreground/30",
          status === "active" && progressColor,
        )}
      />

      <CardContent className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                typeConfig.bgColor,
              )}
            >
              <TypeIcon className={cn("h-5 w-5", typeConfig.iconColor)} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate">{title}</h3>
                {status === "completed" && (
                  <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            </div>
          </div>

          {/* Type badge */}
          <span
            className={cn(
              "shrink-0 text-xs font-medium px-2 py-1 rounded-md",
              typeConfig.bgColor,
              typeConfig.textColor,
            )}
          >
            {typeConfig.label}
          </span>
        </div>

        {/* Progress section */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Progress
            </span>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              status === "completed" && "text-emerald-600",
            )}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressColor,
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          {/* Status badge */}
          {status === "completed" && (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
          {status === "abandoned" && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <XCircle className="h-3.5 w-3.5" />
              <span className="font-medium">Abandoned</span>
            </div>
          )}

          {/* Trend indicator */}
          {trend && status === "active" && (
            <div className={cn("flex items-center gap-1.5", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span className="font-medium">{trendLabel}</span>
            </div>
          )}

          {/* Deadline */}
          {deadline && status === "active" && (
            <div
              className={cn(
                "flex items-center gap-1.5",
                isOverdue ? "text-rose-500" : "text-muted-foreground",
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">
                {isOverdue
                  ? `Overdue by ${formatDistanceToNow(new Date(deadline))}`
                  : format(new Date(deadline), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            onClick={onView}
            variant="ghost"
            size="sm"
            className="flex-1 h-9 gap-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary"
          >
            View Details
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          {onEdit && status === "active" && (
            <Button
              onClick={onEdit}
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted"
              aria-label="Edit goal"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete goal"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
