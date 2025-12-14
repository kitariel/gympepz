"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Flame,
  Target,
  Award,
  Dumbbell,
  Apple,
  Heart,
  Zap,
} from "lucide-react";

function WeekStatus() {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
  const [done, setDone] = useState<boolean[]>([
    true,
    true,
    false,
    true,
    false,
    false,
    false,
  ]);
  const pct = Math.round((done.filter(Boolean).length / 7) * 100);
  const streak = done.reduce(
    (acc, v, i) => (v && i < new Date().getDay() ? acc + 1 : acc),
    0,
  );

  return (
    <Card className="group break-inside-avoid bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 text-neutral-100 transition-all hover:shadow-xl hover:shadow-green-500/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-green-500/10 p-2">
            <Flame className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <div className="font-semibold">This Week</div>
            <div className="text-xs text-neutral-400">{streak} day streak</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-500">{pct}%</div>
          <div className="text-xs text-neutral-400">complete</div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {labels.map((d, i) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
            }}
            className={`group/day relative overflow-hidden rounded-lg px-2 py-5 text-center text-xs font-medium transition-all ${
              done[i]
                ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20"
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
          >
            <div className={done[i] ? "text-white" : "text-neutral-300"}>
              {d}
            </div>
            {done[i] && (
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover/day:opacity-100" />
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

function GoalsCard() {
  const pool = [
    {
      title: "Strength",
      detail: "3x5 compounds, focus on load",
      icon: Dumbbell,
      color: "from-orange-500 to-red-600",
    },
    {
      title: "Hypertrophy",
      detail: "3x10 volume, mind-muscle",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Endurance",
      detail: "Circuits, low rest, 20 min",
      icon: Zap,
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Mobility",
      detail: "Full-body flow, 15 min",
      icon: Heart,
      color: "from-green-500 to-teal-600",
    },
  ];
  const [idx, setIdx] = useState(0);
  const g = pool[idx % pool.length]!;
  const Icon = g.icon;

  return (
    <Card className="group break-inside-avoid bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 text-neutral-100 transition-all hover:shadow-xl hover:shadow-purple-500/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-semibold">Goal Spotlight</div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIdx((v) => v + 1)}
          className="border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
        >
          Shuffle
        </Button>
      </div>
      <div className={`rounded-xl bg-gradient-to-br ${g.color} p-6 shadow-lg`}>
        <Icon className="mb-3 h-8 w-8 text-white" />
        <div className="text-2xl font-bold text-white">{g.title}</div>
        <div className="mt-2 text-sm text-white/90">{g.detail}</div>
      </div>
    </Card>
  );
}

function ActivityChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <Card className="group break-inside-avoid bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 text-neutral-100 transition-all hover:shadow-xl hover:shadow-blue-500/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="font-semibold">Weekly Activity</div>
            <div className="text-xs text-neutral-400">
              {total} workouts total
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        {values.map((v, i) => {
          const height = Math.round((v / max) * 100);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-cyan-400"
                  style={{
                    height: `${height}px`,
                    minHeight: v > 0 ? "20px" : "4px",
                  }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-neutral-300">
                  {v}
                </div>
                <div className="text-[10px] text-neutral-500">{labels[i]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function NutritionChart() {
  const targetCalories = 2200;
  const consumedCalories = 1750;
  const calPct = Math.min(
    100,
    Math.round((consumedCalories / targetCalories) * 100),
  );
  const macros = [
    {
      label: "Protein",
      consumed: 140,
      target: 180,
      color: "from-green-500 to-emerald-600",
      icon: "🥩",
    },
    {
      label: "Carbs",
      consumed: 190,
      target: 250,
      color: "from-amber-500 to-orange-600",
      icon: "🍞",
    },
    {
      label: "Fat",
      consumed: 55,
      target: 70,
      color: "from-rose-500 to-pink-600",
      icon: "🥑",
    },
  ];

  return (
    <Card className="group break-inside-avoid bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 text-neutral-100 transition-all hover:shadow-xl hover:shadow-amber-500/10">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-amber-500/10 p-2">
          <Apple className="h-5 w-5 text-amber-500" />
        </div>
        <div className="font-semibold">Nutrition Goals</div>
      </div>

      <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between text-sm">
          <div className="font-medium text-white/90">Daily Calories</div>
          <div className="text-lg font-bold text-white">
            {consumedCalories} / {targetCalories}
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-white to-cyan-200 shadow-lg transition-all"
            style={{ width: `${calPct}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {macros.map((m) => {
          const pct = Math.min(100, Math.round((m.consumed / m.target) * 100));
          return (
            <div key={m.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{m.icon}</span>
                  <span className="font-medium text-neutral-300">
                    {m.label}
                  </span>
                </div>
                <div className="font-semibold">
                  {m.consumed} / {m.target}g
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={`h-2.5 rounded-full bg-gradient-to-r ${m.color} shadow-lg transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function StatsCard() {
  const stats = [
    {
      label: "Total Plans",
      value: 12,
      icon: Target,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Active",
      value: 3,
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Completed",
      value: 45,
      icon: Award,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <Card className="break-inside-avoid bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 text-neutral-100 transition-all hover:shadow-xl hover:shadow-neutral-500/10">
      <div className="mb-4 font-semibold">Quick Stats</div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-neutral-800/50 p-4 text-center transition-all hover:bg-neutral-800"
            >
              <div className={`mx-auto mb-2 w-fit rounded-lg ${stat.bg} p-2`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-neutral-400">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PersonalRecords() {
  const records = [
    { exercise: "Bench Press", weight: "225 lbs", date: "Dec 10" },
    { exercise: "Deadlift", weight: "405 lbs", date: "Dec 8" },
    { exercise: "Squat", weight: "315 lbs", date: "Dec 5" },
  ];

  return (
    <Card className="group break-inside-avoid bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 text-neutral-100 transition-all hover:shadow-xl hover:shadow-yellow-500/10">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-yellow-500/10 p-2">
          <Award className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="font-semibold">Personal Records</div>
      </div>
      <div className="space-y-3">
        {records.map((record, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-neutral-800/50 p-3 transition-all hover:bg-neutral-800"
          >
            <div>
              <div className="font-medium">{record.exercise}</div>
              <div className="text-xs text-neutral-400">{record.date}</div>
            </div>
            <div className="text-xl font-bold text-yellow-500">
              {record.weight}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function UpcomingWorkouts() {
  const workouts = [
    { name: "Upper Body Power", time: "Tomorrow, 7:00 AM", exercises: 8 },
    { name: "HIIT Cardio", time: "Wed, 6:00 PM", exercises: 12 },
    { name: "Leg Day", time: "Thu, 7:00 AM", exercises: 10 },
  ];

  return (
    <Card className="group break-inside-avoid bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 text-neutral-100 transition-all hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-500/10 p-2">
          <Dumbbell className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="font-semibold">Upcoming Workouts</div>
      </div>
      <div className="space-y-3">
        {workouts.map((workout, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-800 bg-neutral-800/30 p-4 transition-all hover:border-indigo-500/50 hover:bg-neutral-800/50"
          >
            <div className="mb-1 font-medium">{workout.name}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-400">{workout.time}</div>
              <div className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-400">
                {workout.exercises} exercises
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Page() {
  const activity = [2, 3, 1, 4, 2, 0, 3];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Fitness Dashboard
          </h1>
          <p className="text-neutral-400">
            Track your progress and achieve your goals
          </p>
        </div>

        <div className="columns-1 gap-6 md:columns-2 xl:columns-3">
          <StatsCard />
          <WeekStatus />
          <GoalsCard />
          <ActivityChart values={activity} />
          <NutritionChart />
          <PersonalRecords />
          <UpcomingWorkouts />
        </div>
      </div>
    </div>
  );
}
