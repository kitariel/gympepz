"use client";

import Link from "next/link";
import { Plus, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGoals, useGoalMutations } from "@/hooks/useGoals";
import { GoalCard } from "@/features/goals/components/GoalCard";

export default function GoalsPage() {
  const { activeGoals, completedGoals, isLoading, userId } = useGoals();
  const { delete: deleteGoal } = useGoalMutations();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteGoal({ id });
    } catch (e) {
      console.error("Failed to delete goal:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-muted-foreground">Loading goals…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/train/log">
              <Play className="mr-2 h-4 w-4" />
              Start workout
            </Link>
          </Button>
          {userId && (
            <Button asChild>
              <Link href="/portal/goals/new">
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Link>
            </Button>
          )}
        </div>
      </div>

      {!userId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Sign in to create and track goals.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No goals yet. Create your first goal to track your progress.
            </p>
            <Button asChild>
              <Link href="/portal/goals/new">Create Goal</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Active Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}

          {completedGoals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Completed Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
