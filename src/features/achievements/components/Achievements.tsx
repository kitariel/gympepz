"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { Award, CalendarCheck, Lock, Target, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/useGoals";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

type Tier = {
  id: string;
  title: string;
  label: string;
  threshold: number;
  unitLabel: string;
  tone: "emerald" | "sky" | "amber";
};

const WORKOUT_DAY_TIERS: Tier[] = [
  { id: "days-30", title: "Rookie", label: "Level 1", threshold: 30, unitLabel: "days", tone: "emerald" },
  { id: "days-60", title: "Committed", label: "Level 2", threshold: 60, unitLabel: "days", tone: "sky" },
  { id: "days-120", title: "Elite", label: "Level 3", threshold: 120, unitLabel: "days", tone: "amber" },
];

const GOAL_TIERS: Tier[] = [
  { id: "goals-30", title: "Goal Seeker", label: "Level 1", threshold: 30, unitLabel: "goals", tone: "emerald" },
  { id: "goals-60", title: "Goal Crusher", label: "Level 2", threshold: 60, unitLabel: "goals", tone: "sky" },
  { id: "goals-120", title: "Goal Master", label: "Level 3", threshold: 120, unitLabel: "goals", tone: "amber" },
];

const TONE_STYLES: Record<Tier["tone"], string> = {
  emerald: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20 dark:text-emerald-400",
  sky: "text-sky-600 bg-sky-500/10 ring-sky-500/20 dark:text-sky-400",
  amber: "text-amber-600 bg-amber-500/10 ring-amber-500/20 dark:text-amber-400",
};

function uniqueWorkoutDays(history: Array<{ date?: string; endedAt?: string; completed?: boolean }>): number {
  const days = new Set<string>();
  for (const item of history) {
    if (!item.completed) continue;
    const iso = (item.date ?? item.endedAt ?? "").slice(0, 10);
    if (iso) days.add(iso);
  }
  return days.size;
}

function TierCard({ tier, value }: { tier: Tier; value: number }) {
  const progress = Math.max(0, Math.min(100, Math.round((value / tier.threshold) * 100)));
  const unlocked = value >= tier.threshold;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {tier.label}
            </p>
            <h3 className="text-sm font-semibold">{tier.title}</h3>
            <p className="text-xs text-muted-foreground">
              {tier.threshold} {tier.unitLabel}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
              TONE_STYLES[tier.tone],
            )}
          >
            {unlocked ? <Trophy className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {value}/{tier.threshold}
            </span>
            <span className="text-foreground/80">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              className={cn(
                "h-full transition-all duration-500",
                tier.tone === "emerald" && "bg-emerald-500",
                tier.tone === "sky" && "bg-sky-500",
                tier.tone === "amber" && "bg-amber-500",
              )}
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalsAchievements() {
  const { data: session } = useSession();
  const { completedGoals, isLoading: goalsLoading } = useGoals();
  const { history, hydrated: historyHydrated } = useWorkoutDraft();

  const workoutDays = useMemo(() => {
    if (!historyHydrated) return 0;
    return uniqueWorkoutDays(history);
  }, [history, historyHydrated]);

  const goalsCompleted = completedGoals.length;
  const isLoading = goalsLoading || !historyHydrated;

  if (!session?.user?.id) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground text-sm">
            Unlock badges as you train and hit goals.
          </p>
        </header>

        <Card className="border-dashed border-border/70 bg-muted/20">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Award className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Sign in to view achievements</h2>
              <p className="text-muted-foreground text-sm">
                Achievements are tied to your account and saved in the portal.
              </p>
            </div>
            <Button asChild className="h-10">
              <Link href="/login">Log in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground text-sm">
            Collect badges for consistency and goal completions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{workoutDays} workout days</Badge>
          <Badge variant="outline">{goalsCompleted} goals completed</Badge>
        </div>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Workout days</h2>
              <p className="text-muted-foreground text-xs">
                Unique days with completed workouts.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WORKOUT_DAY_TIERS.map((tier) => (
              <TierCard key={tier.id} tier={tier} value={workoutDays} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Goal achiever</h2>
              <p className="text-muted-foreground text-xs">
                Completed goals across all categories.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GOAL_TIERS.map((tier) => (
              <TierCard key={tier.id} tier={tier} value={goalsCompleted} />
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-10 flex-1">
            <Link href="/portal/train">Start workout</Link>
          </Button>
          <Button asChild variant="outline" className="h-10 flex-1">
            <Link href="/portal/goals">Manage goals</Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-xs">
            Loading progress...
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            More achievement tiers coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
