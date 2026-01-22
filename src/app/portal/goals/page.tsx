"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Play, Dumbbell, Flame, Target, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  getTemplatesByCategory,
  GOAL_TEMPLATE_CATEGORIES,
  type GoalTemplate,
  type GoalTemplateCategory,
} from "@/lib/goal-templates";
import { useGoals, useGoalMutations } from "@/hooks/useGoals";
import { GoalCard } from "@/features/goals/components/GoalCard";
import { GoalTemplateCard } from "@/features/goals/components/GoalTemplateCard";
import { GoalTemplatePicker } from "@/features/goals/components/GoalTemplatePicker";
import { GoalTemplateConfirm } from "@/features/goals/components/GoalTemplateConfirm";
import type { Goal } from "@/types/goal.types";

const CATEGORY_ORDER: GoalTemplateCategory[] = [
  "strength",
  "reps",
  "consistency",
  "bodyweight",
];

const CATEGORY_ICONS = {
  strength: Dumbbell,
  reps: Flame,
  consistency: Target,
  bodyweight: Scale,
} as const;

export default function GoalsPage() {
  const router = useRouter();
  const { activeGoals, completedGoals, isLoading, userId, refetch } = useGoals();
  const { delete: deleteGoal } = useGoalMutations();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState<GoalTemplate | null>(null);

  const templateCategories = useMemo(() => {
    const byCat = getTemplatesByCategory();
    return CATEGORY_ORDER.map((id) => ({
      id,
      label: GOAL_TEMPLATE_CATEGORIES[id].label,
      templates: byCat[id],
    })).filter((c) => c.templates.length > 0);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteGoal({ id });
    } catch (e) {
      console.error("Failed to delete goal:", e);
    }
  };

  const handleSelectTemplateFromGrid = (template: GoalTemplate) => {
    setConfirmTemplate(template);
    setConfirmOpen(true);
  };

  const handleConfirmSuccess = (goalId: string) => {
    setConfirmOpen(false);
    setConfirmTemplate(null);
    void refetch();
    router.push(`/portal/goals/${goalId}`);
  };

  const hasGoals = activeGoals.length > 0 || completedGoals.length > 0;

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
            <Button
              onClick={() => setPickerOpen(true)}
              asChild={false}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
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
      ) : !hasGoals ? (
        <>
          <p className="text-muted-foreground">
            Choose a goal to get started, or create your own.
          </p>
          <div className="space-y-8">
            {templateCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              return (
                <section key={cat.id}>
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    {Icon && <Icon className="h-5 w-5" />}
                    {cat.label}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {cat.templates.map((t) => (
                      <GoalTemplateCard
                        key={t.id}
                        template={t}
                        onSelect={handleSelectTemplateFromGrid}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
          <div className="border-t pt-6">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/portal/goals/new">Create Custom Goal →</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Active Goals</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal as Goal}
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
                  <GoalCard key={goal.id} goal={goal as Goal} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <GoalTemplatePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onCustomGoal={() => setPickerOpen(false)}
        onGoalCreated={() => void refetch()}
      />

      {confirmTemplate && (
        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) setConfirmTemplate(null);
          }}
        >
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
            <GoalTemplateConfirm
              template={confirmTemplate}
              onBack={() => {
                setConfirmOpen(false);
                setConfirmTemplate(null);
              }}
              onSuccess={handleConfirmSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
