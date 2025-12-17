"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Award } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface AnalyticsTabProps {
  userId: string;
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export function AnalyticsTab({ userId }: AnalyticsTabProps) {
  const analytics = api.workoutLog.getAnalytics.useQuery({
    userId,
    period: "month",
  });

  const volumeByMuscle = api.progress.getVolumeByMuscleGroup.useQuery({
    userId,
    period: "month",
  });

  const prs = api.progress.getPRs.useQuery({ userId, limit: 10 });

  const chartData =
    volumeByMuscle.data?.map((item, index) => ({
      name: item.muscle,
      value: item.volume,
      color: COLORS[index % COLORS.length],
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* AI Insights Placeholder */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Coach Insights</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              Coming Soon
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm">
                💪 <strong>Great progress on bench press!</strong> You've
                increased your 1RM by 5kg this month.
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm">
                📊 Your leg volume is down 15% compared to last month.
                Consider adding another leg day.
              </p>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-sm">
                🎯 You're consistent with {analytics.data?.totalWorkouts ?? 0}{" "}
                workouts this month. Keep it up!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.data?.totalWorkouts ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((analytics.data?.totalVolume ?? 0) / 1000)}k
            </div>
            <p className="text-xs text-muted-foreground">kg lifted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.data?.avgDuration ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">mins per workout</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume by Muscle Group */}
      <Card>
        <CardHeader>
          <CardTitle>Volume by Muscle Group (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${Math.round(value)} kg`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data yet. Complete some workouts to see analytics!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <CardTitle>Recent Personal Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prs.data?.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{pr.exercise.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pr.prType === "1RM" ? "Estimated 1RM" : pr.prType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {Math.round(pr.value)} kg
                  </p>
                  {pr.reps && (
                    <p className="text-xs text-muted-foreground">
                      @ {pr.reps} reps
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(pr.date), "MMM d")}
                  </p>
                </div>
              </div>
            ))}

            {(!prs.data || prs.data.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No PRs yet. Keep pushing your limits!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
