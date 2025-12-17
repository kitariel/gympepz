"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Award, Dumbbell, Calendar, Clock } from "lucide-react";
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

  // Convert volumeByMuscle data to array format
  // It can be either an array or an object (Record<string, number>)
  const chartData = (() => {
    if (!volumeByMuscle.data) return [];
    
    // If it's already an array, use it
    if (Array.isArray(volumeByMuscle.data)) {
      return volumeByMuscle.data.map((item, index) => ({
        name: item.muscle,
        value: item.volume,
        color: COLORS[index % COLORS.length],
      }));
    }
    
    // If it's an object (Record<string, number>), convert to array
    if (typeof volumeByMuscle.data === 'object') {
      return Object.entries(volumeByMuscle.data).map(([muscle, volume], index) => ({
        name: muscle,
        value: volume,
        color: COLORS[index % COLORS.length],
      }));
    }
    
    return [];
  })();

  return (
    <div className="space-y-4">
      {/* AI Insights - Compact */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <CardTitle className="text-sm">AI Coach Insights</CardTitle>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              Coming Soon
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            <div className="p-2.5 bg-background rounded-lg">
              <p className="text-xs">
                💪 <strong>Great progress on bench press!</strong> You've increased your 1RM by 5kg this month.
              </p>
            </div>
            <div className="p-2.5 bg-background rounded-lg">
              <p className="text-xs">
                📊 Your leg volume is down 15% compared to last month. Consider adding another leg day.
              </p>
            </div>
            <div className="p-2.5 bg-background rounded-lg">
              <p className="text-xs">
                🎯 You're consistent with {analytics.data?.totalWorkouts ?? 0} workouts this month. Keep it up!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats - Compact */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Workouts</CardTitle>
            <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {analytics.data?.totalWorkouts ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">this month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Volume</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {Math.round((analytics.data?.totalVolume ?? 0) / 1000)}k
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">kg lifted</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
            <CardTitle className="text-xs font-medium">Avg Duration</CardTitle>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold">
              {analytics.data?.avgDuration ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">mins per workout</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume by Muscle Group - Compact */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm">Volume by Muscle Group</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {chartData.length > 0 ? (
            <div className="h-[300px]">
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
                    outerRadius={100}
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
              <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No data yet. Complete some workouts to see analytics!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Records - Compact */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <CardTitle className="text-sm">Recent Personal Records</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {prs.data?.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{pr.exercise.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {pr.prType === "1RM" ? "Estimated 1RM" : pr.prType}
                  </p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="text-sm font-bold">
                    {Math.round(pr.value)} kg
                  </p>
                  {pr.reps && (
                    <p className="text-[10px] text-muted-foreground">
                      @ {pr.reps} reps
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(pr.date), "MMM d")}
                  </p>
                </div>
              </div>
            ))}

            {(!prs.data || prs.data.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No PRs yet. Keep pushing your limits!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
