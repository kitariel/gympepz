"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  Award,
  Dumbbell,
  Calendar,
  Clock,
} from "lucide-react";
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
  const analytics = api.workoutLog.getAnalytics.useQuery(
    {
      userId,
      period: "month",
    },
    { 
      refetchInterval: 20000, // Refetch every 20 seconds
      refetchOnWindowFocus: false, // Prevent refetch on window focus
    },
  );

  const prs = api.progress.getPRs.useQuery({ userId, limit: 10 });

  const chartData = (() => {
    if (!analytics.data?.volumeByMuscleGroup) return [];

    return Object.entries(analytics.data.volumeByMuscleGroup).map(
      ([muscle, volume], index) => ({
        name: muscle,
        value: volume,
        color: COLORS[index % COLORS.length],
      }),
    );
  })();

  return (
    <div className="space-y-4">
      {/* AI Insights - Compact */}
      <Card className="ring-border border-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 shadow-sm ring-1 dark:from-purple-950/10 dark:to-blue-950/10">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Brain className="text-primary h-4 w-4" />
            <CardTitle className="text-base font-bold">
              AI Coach Insights
            </CardTitle>
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] font-semibold tracking-wider uppercase"
            >
              Coming Soon
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            <div className="bg-background/60 ring-border/50 rounded-lg p-3 ring-1 backdrop-blur-sm">
              <p className="text-xs">
                💪 <strong>Great progress on bench press!</strong> You&apos;ve
                increased your 1RM by 5kg this month.
              </p>
            </div>
            <div className="bg-background/60 ring-border/50 rounded-lg p-3 ring-1 backdrop-blur-sm">
              <p className="text-xs">
                📊 Your leg volume is down 15% compared to last month. Consider
                adding another leg day.
              </p>
            </div>
            <div className="bg-background/60 ring-border/50 rounded-lg p-3 ring-1 backdrop-blur-sm">
              <p className="text-xs">
                🎯 You&apos;re consistent with{" "}
                {analytics.data?.totalWorkouts ?? 0} workouts this month. Keep
                it up!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats - Compact */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="ring-border bg-card border-0 shadow-sm ring-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-muted-foreground/70 text-xs font-semibold tracking-wider uppercase">
              Workouts
            </CardTitle>
            <Dumbbell className="text-muted-foreground/50 h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">
              {analytics.data?.totalWorkouts ?? 0}
            </div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium">
              this month
            </p>
          </CardContent>
        </Card>

        <Card className="ring-border bg-card border-0 shadow-sm ring-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-muted-foreground/70 text-xs font-semibold tracking-wider uppercase">
              Volume
            </CardTitle>
            <TrendingUp className="text-muted-foreground/50 h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">
              {Math.round((analytics.data?.totalVolume ?? 0) / 1000)}k
            </div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium">
              kg lifted
            </p>
          </CardContent>
        </Card>

        <Card className="ring-border bg-card border-0 shadow-sm ring-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
            <CardTitle className="text-muted-foreground/70 text-xs font-semibold tracking-wider uppercase">
              Avg Duration
            </CardTitle>
            <Clock className="text-muted-foreground/50 h-4 w-4" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">
              {analytics.data?.avgDuration ?? 0}
            </div>
            <p className="text-muted-foreground mt-1 text-[10px] font-medium">
              mins / workout
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume by Muscle Group - Compact */}
      <Card className="ring-border bg-card border-0 shadow-sm ring-1">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base font-bold">
            Volume by Muscle Group
          </CardTitle>
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
                    label={(props: { name?: string; percent?: number }) =>
                      `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`
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
                    formatter={(value: unknown) =>
                      `${Math.round(value as number)} kg`
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-muted-foreground/50 py-12 text-center">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 opacity-30" />
              <p className="text-sm font-medium">
                No data yet. Complete some workouts to see analytics!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Records - Compact */}
      <Card className="ring-border bg-card border-0 shadow-sm ring-1">
        <CardHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Award className="text-primary h-4 w-4" />
            <CardTitle className="text-base font-bold">
              Recent Personal Records
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-2">
            {prs.data?.map(
              (pr: {
                id: string;
                exercise: { name: string };
                prType: string;
                value: number;
                reps?: number;
                date: string;
              }) => (
                <div
                  key={(pr as { id: string }).id}
                  className="ring-border bg-card hover:ring-primary/20 flex items-center justify-between rounded-lg p-3 ring-1 transition-all hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {pr.exercise.name}
                    </p>
                    <p className="text-muted-foreground/70 mt-1 text-[10px] font-medium tracking-wider uppercase">
                      {pr.prType === "1RM" ? "Estimated 1RM" : pr.prType}
                    </p>
                  </div>
                  <div className="ml-4 flex shrink-0 flex-col items-end gap-0.5 text-right">
                    <p className="text-sm font-bold">
                      {Math.round(pr.value)}{" "}
                      <span className="text-muted-foreground text-[10px] font-normal uppercase">
                        KG
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      {pr.reps && (
                        <p className="text-muted-foreground text-[10px] font-medium">
                          {pr.reps} REPS
                        </p>
                      )}
                      <p className="text-muted-foreground/50 text-[10px]">
                        {format(new Date(pr.date), "MMM d")}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}

            {(!prs.data || prs.data.length === 0) && (
              <div className="text-muted-foreground/50 py-8 text-center">
                <Award className="mx-auto mb-3 h-8 w-8 opacity-30" />
                <p className="text-sm font-medium">
                  No PRs yet. Keep pushing your limits!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
