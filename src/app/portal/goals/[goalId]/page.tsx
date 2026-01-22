"use client";

import { use } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGoal } from "@/hooks/useGoals";
import { GoalProgress } from "@/features/goals/components/GoalProgress";

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = use(params);
  const { goal, isLoading } = useGoal(goalId);

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto max-w-md space-y-6 p-6">
        <p className="text-muted-foreground">Goal not found.</p>
        <Button asChild>
          <Link href="/portal/goals">Back to Goals</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/goals">← Goals</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <GoalProgress goalId={goalId} />
        </CardContent>
      </Card>
    </div>
  );
}
