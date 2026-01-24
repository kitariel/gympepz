"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGoalTemplates } from "@/hooks/useGoalTemplates";
import { groupGoalTemplatesByCategory } from "@/lib/goal-template-utils";
import type { GoalTemplate } from "@/types/goal-template.types";
import { useGoals, useGoalMutations } from "@/hooks/useGoals";
import { GoalTemplatePicker } from "@/features/goals/components/GoalTemplatePicker";
import { GoalTemplateConfirm } from "@/features/goals/components/GoalTemplateConfirm";
import type { Goal } from "@/types/goal.types";
import type {
  GoalsDashboardProps,
  GoalsDashboardViewModel,
  GoalsDashboardState,
} from "./GoalsDashboard.types";
import { GoalsDashboardView } from "./GoalsDashboard.view";

function goalShortLabel(g: Goal): string {
  if (g.exercise?.name) return g.exercise.name;
  switch (g.type) {
    case "strength":
      return "Strength goal";
    case "reps":
      return "Reps goal";
    case "consistency":
      return "Consistency goal";
    case "bodyweight":
      return "Bodyweight goal";
    default:
      return "This goal";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Container
// ─────────────────────────────────────────────────────────────────────────────

export function GoalsDashboardContainer({
  basePath = "/portal/goals",
}: GoalsDashboardProps) {
  const router = useRouter();
  const {
    activeGoals,
    completedGoals,
    isLoading,
    userId,
    error,
    refetch,
  } = useGoals();
  const {
    templates,
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates,
  } = useGoalTemplates();
  const { delete: deleteGoal } = useGoalMutations();

  // Local state
  const [state, setState] = useState<GoalsDashboardState>({
    pickerOpen: false,
    confirmOpen: false,
    confirmTemplate: null,
    goalToDelete: null,
    isDeleting: false,
  });

  // Memoized template categories
  const templateCategories = useMemo(
    () => groupGoalTemplatesByCategory(templates),
    [templates],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddGoalClick = useCallback(() => {
    setState((s) => ({ ...s, pickerOpen: true }));
  }, []);

  const handlePickerClose = useCallback(() => {
    setState((s) => ({ ...s, pickerOpen: false }));
  }, []);

  const handleTemplateSelect = useCallback((template: GoalTemplate) => {
    setState((s) => ({
      ...s,
      confirmTemplate: template,
      confirmOpen: true,
    }));
  }, []);

  const handleConfirmClose = useCallback(() => {
    setState((s) => ({
      ...s,
      confirmOpen: false,
      confirmTemplate: null,
    }));
  }, []);

  const handleConfirmSuccess = useCallback(
    (goalId: string) => {
      setState((s) => ({
        ...s,
        confirmOpen: false,
        confirmTemplate: null,
      }));
      void refetch();
      router.push(`${basePath}/${goalId}`);
    },
    [refetch, router, basePath]
  );

  const handleGoalDelete = useCallback((goal: Goal) => {
    setState((s) => ({ ...s, goalToDelete: goal }));
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setState((s) => ({ ...s, goalToDelete: null }));
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!state.goalToDelete) return;

    setState((s) => ({ ...s, isDeleting: true }));
    try {
      await deleteGoal({ id: state.goalToDelete.id });
      toast.success("Goal deleted");
      setState((s) => ({ ...s, goalToDelete: null, isDeleting: false }));
      void refetch();
    } catch (e) {
      console.error("Failed to delete goal:", e);
      toast.error("Failed to delete goal. Try again.");
      setState((s) => ({ ...s, isDeleting: false }));
    }
  }, [state.goalToDelete, deleteGoal, refetch]);

  // ─────────────────────────────────────────────────────────────────────────
  // Build View Model
  // ─────────────────────────────────────────────────────────────────────────

  const hasGoals = activeGoals.length > 0 || completedGoals.length > 0;

  const isAuthenticated = Boolean(userId);
  const showTemplateError = Boolean(templatesError) && !hasGoals;
  const errorMessage =
    isAuthenticated && (error || showTemplateError)
      ? error?.message ??
        templatesError?.message ??
        "Failed to load goals."
      : null;

  const viewModel: GoalsDashboardViewModel = {
    isLoading: isLoading || (!hasGoals && templatesLoading),
    isAuthenticated,
    hasGoals,
    errorMessage,
    activeGoals: activeGoals as Goal[],
    completedGoals: completedGoals as Goal[],
    templateCategories,
    activeCount: activeGoals.length,
    completedCount: completedGoals.length,
    onAddGoalClick: handleAddGoalClick,
    onTemplateSelect: handleTemplateSelect,
    onGoalDelete: handleGoalDelete,
    onRetry: () => {
      void refetch();
      void refetchTemplates();
    },
    paths: {
      startWorkout: "/portal/train/log",
      createCustomGoal: `${basePath}/new`,
      goalDetail: (id: string) => `${basePath}/${id}`,
      login: "/login",
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <GoalsDashboardView {...viewModel} />

      {/* Template Picker Modal */}
      <GoalTemplatePicker
        open={state.pickerOpen}
        onOpenChange={(open) => !open && handlePickerClose()}
        onCustomGoal={handlePickerClose}
        onGoalCreated={() => void refetch()}
      />

      {/* Template Confirm Dialog */}
      {state.confirmTemplate && (
        <Dialog
          open={state.confirmOpen}
          onOpenChange={(open) => !open && handleConfirmClose()}
        >
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
            <GoalTemplateConfirm
              template={state.confirmTemplate}
              onBack={handleConfirmClose}
              onSuccess={handleConfirmSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(state.goalToDelete)}
        onOpenChange={(open) => !open && handleDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              {state.goalToDelete && (
                <>
                  &quot;{goalShortLabel(state.goalToDelete)}&quot; and all its
                  progress will be removed. This can&apos;t be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={state.isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
              disabled={state.isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {state.isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
