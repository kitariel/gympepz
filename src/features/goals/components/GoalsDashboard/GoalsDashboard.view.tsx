"use client";

import Link from "next/link";
import {
  ChevronDown,
  Plus,
  Play,
  Target,
  Dumbbell,
  Flame,
  Scale,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoalCard } from "@/features/goals/components/GoalCard";
import { GoalTemplateCard } from "@/features/goals/components/GoalTemplateCard";
import { useState } from "react";
import type {
  GoalsDashboardViewModel,
  GoalsHeaderProps,
  GoalsEmptyStateProps,
  GoalsTemplateGridProps,
  GoalsListProps,
} from "./GoalsDashboard.types";

// ─────────────────────────────────────────────────────────────────────────────
// Icon Mapping
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  scale: Scale,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton (Loading State)
// ─────────────────────────────────────────────────────────────────────────────

export function GoalsDashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-4 pb-20 md:p-6 md:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="bg-muted h-8 w-40 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-muted h-52 animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

function GoalsHeader({
  isAuthenticated,
  hasGoals,
  activeCount,
  completedCount,
  onAddGoalClick,
  startWorkoutPath,
}: GoalsHeaderProps) {
  const subtitle = !isAuthenticated
    ? "Sign in to set and track your fitness goals."
    : !hasGoals
      ? "Pick a template or create your own."
      : `${activeCount} active · ${completedCount} completed`;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Goals</h1>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href={startWorkoutPath}>
            <Play className="h-4 w-4" />
            Start workout
          </Link>
        </Button>
        {isAuthenticated && (
          <Button size="sm" className="gap-2" onClick={onAddGoalClick}>
            <Plus className="h-4 w-4" />
            Add goal
          </Button>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Unauthenticated Empty State
// ─────────────────────────────────────────────────────────────────────────────

function GoalsEmptyState({ loginPath }: GoalsEmptyStateProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-muted/60 to-muted/30 shadow-sm">
      <CardContent className="flex flex-col items-center gap-6 py-12 text-center sm:py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
          <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Track what matters
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Set strength, reps, consistency, or bodyweight goals. Log progress
            and crush them.
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link href={loginPath}>
            Sign in to get started
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Error State
// ─────────────────────────────────────────────────────────────────────────────

function GoalsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-destructive/50 bg-destructive/10">
      <CardContent className="flex flex-col gap-4 py-8 text-center sm:py-10">
        <div className="mx-auto max-w-sm space-y-2">
          <h2 className="text-base font-semibold">Something went wrong</h2>
          <p className="text-destructive text-sm">{message}</p>
        </div>
        <div className="flex items-center justify-center">
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template Grid (for new users)
// ─────────────────────────────────────────────────────────────────────────────

function GoalsTemplateGrid({
  categories,
  onTemplateSelect,
  createCustomGoalPath,
  showIntro = true,
}: GoalsTemplateGridProps) {
  return (
    <div className="space-y-10">
      {showIntro && (
        <div className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-6 text-center sm:px-6 sm:py-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="mb-1 text-lg font-semibold tracking-tight">
            Choose your first goal
          </h2>
          <p className="text-muted-foreground text-sm">
            Tap a template to customize and start, or create one from scratch.
          </p>
        </div>
      )}

      {/* Category sections */}
      <div className="space-y-8">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.icon];
          return (
            <section key={cat.id}>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold tracking-tight">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                {cat.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cat.templates.map((t) => (
                  <GoalTemplateCard
                    key={t.id}
                    template={t}
                    onSelect={onTemplateSelect}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Custom goal CTA */}
      <Card className="group relative overflow-hidden border-dashed border-border/60 bg-gradient-to-br from-muted/30 to-transparent hover:border-primary/30 hover:bg-muted/20 transition-all duration-300">
        <Link href={createCustomGoalPath} className="block">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">Create custom goal</h3>
              <p className="text-sm text-muted-foreground">
                Build your own goal from scratch
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Goals List (Active + Completed)
// ─────────────────────────────────────────────────────────────────────────────

function GoalsList({ activeGoals, completedGoals, onDelete }: GoalsListProps) {
  return (
    <div className="space-y-10">
      {activeGoals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Active</h2>
            <span className="text-muted-foreground text-sm">
              {activeGoals.length} goal{activeGoals.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={() => onDelete(goal)}
              />
            ))}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Completed</h2>
            <span className="text-muted-foreground text-sm">
              {completedGoals.length} goal
              {completedGoals.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────────────────────────────

export function GoalsDashboardView({
  isLoading,
  isAuthenticated,
  hasGoals,
  errorMessage,
  activeGoals,
  completedGoals,
  templateCategories,
  activeCount,
  completedCount,
  onAddGoalClick,
  onTemplateSelect,
  onGoalDelete,
  onRetry,
  paths,
}: GoalsDashboardViewModel) {
  const [templatesOpen, setTemplatesOpen] = useState(false);

  if (isLoading) {
    return <GoalsDashboardSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 p-4 pb-24 md:p-6 md:pb-8">
      <GoalsHeader
        isAuthenticated={isAuthenticated}
        hasGoals={hasGoals}
        activeCount={activeCount}
        completedCount={completedCount}
        onAddGoalClick={onAddGoalClick}
        startWorkoutPath={paths.startWorkout}
      />

      {errorMessage ? (
        <GoalsErrorState message={errorMessage} onRetry={onRetry} />
      ) : !isAuthenticated ? (
        <GoalsEmptyState loginPath={paths.login} />
      ) : (
        <>
          {hasGoals ? (
            <GoalsList
              activeGoals={activeGoals}
              completedGoals={completedGoals}
              onDelete={onGoalDelete}
            />
          ) : null}

          {hasGoals ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setTemplatesOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div>
                  <p className="text-base font-semibold">Add another goal</p>
                  <p className="text-muted-foreground text-sm">
                    Pick from templates or create your own
                  </p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${templatesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {templatesOpen && (
                <GoalsTemplateGrid
                  categories={templateCategories}
                  onTemplateSelect={onTemplateSelect}
                  createCustomGoalPath={paths.createCustomGoal}
                  showIntro={false}
                />
              )}
            </div>
          ) : (
            <GoalsTemplateGrid
              categories={templateCategories}
              onTemplateSelect={onTemplateSelect}
              createCustomGoalPath={paths.createCustomGoal}
              showIntro
            />
          )}
        </>
      )}
    </div>
  );
}
