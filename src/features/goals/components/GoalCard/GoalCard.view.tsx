"use client";

import {
  Calendar,
  Dumbbell,
  Minus,
  Pencil,
  Repeat,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { GoalCardViewModel } from "./GoalCard.types";

const GOAL_TYPE_CONFIG = {
  strength: { icon: Dumbbell, label: "Strength", color: "bg-blue-500" },
  reps: { icon: Repeat, label: "Reps", color: "bg-green-500" },
  consistency: { icon: Calendar, label: "Consistency", color: "bg-purple-500" },
  bodyweight: { icon: Scale, label: "Bodyweight", color: "bg-orange-500" },
} as const;

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
      ? "text-green-500"
      : trend === "declining"
        ? "text-red-500"
        : "text-muted-foreground";

  const typeConfig = GOAL_TYPE_CONFIG[goalType] ?? GOAL_TYPE_CONFIG.strength;
  const TypeIcon = typeConfig.icon;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${typeConfig.color} text-white text-xs`}>
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeConfig.label}
              </Badge>
              {status === "completed" && (
                <Trophy className="h-4 w-4 shrink-0 text-yellow-500" />
              )}
            </div>
            <CardTitle className="truncate text-lg">{title}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {trend && (
          <div className="flex items-center gap-2 text-sm">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className="capitalize text-muted-foreground">{trend}</span>
          </div>
        )}

        {deadline && status === "active" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {format(new Date(deadline), "MMM d, yyyy")}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onView} className="flex-1">
            View Details
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="icon"
              aria-label="Edit goal"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="outline"
              size="icon"
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
