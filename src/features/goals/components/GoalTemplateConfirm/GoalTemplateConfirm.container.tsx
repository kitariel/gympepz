"use client";

import { useState, useCallback } from "react";
import { useGoalMutations } from "@/hooks/useGoals";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { GoalTemplateConfirmProps, GoalTemplateConfirmViewModel } from "./GoalTemplateConfirm.types";
import { GoalTemplateConfirmView } from "./GoalTemplateConfirm.view";

export function GoalTemplateConfirmContainer({
  template,
  onBack,
  onSuccess,
}: GoalTemplateConfirmProps) {
  const { create, isCreating, userId } = useGoalMutations();
  const [targetInput, setTargetInput] = useState(String(template.targetValue));
  const [currentInput, setCurrentInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: exercises } = api.exercise.list.useQuery(
    { q: template.exerciseName ?? "", take: 5 },
    { enabled: !!template.exerciseName && (template.type === "strength" || template.type === "reps") },
  );

  const exerciseId = (() => {
    if (!template.exerciseName || (template.type !== "strength" && template.type !== "reps"))
      return undefined;
    const match = exercises?.find(
      (e) => e.name.toLowerCase() === template.exerciseName!.toLowerCase(),
    );
    return match?.id;
  })();

  const handleSubmit = useCallback(async () => {
    setError(null);
    const target = Number.parseFloat(targetInput);
    if (Number.isNaN(target)) {
      setError("Enter a valid target value.");
      return;
    }
    if (template.type !== "bodyweight" && target < 0) {
      setError("Target must be positive for this goal type.");
      return;
    }
    if (!userId) {
      setError("Sign in to create goals.");
      return;
    }
    if ((template.type === "strength" || template.type === "reps") && !exerciseId) {
      setError(
        template.exerciseName
          ? `Exercise "${template.exerciseName}" not found. Create a custom goal instead.`
          : "Select an exercise for this goal type.",
      );
      return;
    }

    const current = currentInput.trim()
      ? Number.parseFloat(currentInput)
      : undefined;
    if (current !== undefined && Number.isNaN(current)) {
      setError("Enter a valid current value.");
      return;
    }

    const deadline = deadlineInput
      ? new Date(deadlineInput)
      : template.suggestedDeadlineDays != null
        ? (() => {
            const d = new Date();
            d.setDate(d.getDate() + template.suggestedDeadlineDays);
            return d;
          })()
        : undefined;

    try {
      const goal = await create({
        type: template.type,
        targetValue: target,
        unit: template.unit,
        deadline,
        exerciseId: exerciseId ?? undefined,
        ...(current != null && { currentValue: current }),
      });
      toast.success("Goal created!");
      onSuccess(goal.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal.");
    }
  }, [
    targetInput,
    currentInput,
    deadlineInput,
    template,
    userId,
    exerciseId,
    create,
    onSuccess,
  ]);

  const viewModel: GoalTemplateConfirmViewModel = {
    templateName: template.name,
    targetValue: template.targetValue,
    unit: template.unit,
    suggestedDeadlineDays: template.suggestedDeadlineDays,
    exerciseName: template.exerciseName,
    type: template.type,
    targetInput,
    currentInput,
    deadlineInput,
    error,
    isSubmitting: isCreating,
    onTargetChange: setTargetInput,
    onCurrentChange: setCurrentInput,
    onDeadlineChange: setDeadlineInput,
    onBack,
    onSubmit: () => {
      void handleSubmit();
    },
  };

  return <GoalTemplateConfirmView {...viewModel} />;
}
