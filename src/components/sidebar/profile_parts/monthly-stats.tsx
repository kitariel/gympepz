"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dumbbell, TrendingUp, Calendar, Clock } from "lucide-react";

interface MonthlyStatsProps {
  workouts: number;
  volume: number;
  averageDuration?: number;
}

export function MonthlyStats({
  workouts,
  volume,
  averageDuration,
}: MonthlyStatsProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            This Month
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Workouts</span>
          </div>
          <span className="font-semibold">{workouts}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Volume</span>
          </div>
          <span className="font-semibold">
            {volume > 0 ? `${(volume / 1000).toFixed(1)}k kg` : "0 kg"}
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Avg Duration</span>
          </div>
          <span className="font-semibold">
            {averageDuration ? `${averageDuration} min` : "N/A"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
