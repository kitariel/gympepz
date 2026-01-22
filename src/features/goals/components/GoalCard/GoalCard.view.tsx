"use client";

import {
  Calendar,
  Minus,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GoalCardViewModel } from "./GoalCard.types";

export function GoalCardView({
  title,
  subtitle,
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

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg">{title}</CardTitle>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {subtitle}
            </p>
          </div>
          {status === "completed" && (
            <Trophy className="ml-2 h-5 w-5 shrink-0 text-yellow-500" />
          )}
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
