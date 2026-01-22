"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getTemplatesByCategory,
  GOAL_TEMPLATE_CATEGORIES,
  type GoalTemplateCategory,
} from "@/lib/goal-templates";
import type { GoalTemplate } from "@/lib/goal-templates";
import type { GoalTemplatePickerProps, GoalTemplatePickerViewModel } from "./GoalTemplatePicker.types";
import { GoalTemplatePickerView } from "./GoalTemplatePicker.view";

const CATEGORY_ORDER: GoalTemplateCategory[] = [
  "strength",
  "reps",
  "consistency",
  "bodyweight",
];

export function GoalTemplatePickerContainer({
  open,
  onOpenChange,
  onCustomGoal,
  onGoalCreated,
}: GoalTemplatePickerProps) {
  const router = useRouter();
  const [step, setStep] = useState<"grid" | "confirm">("grid");
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  const categories = useMemo(() => {
    const byCat = getTemplatesByCategory();
    return CATEGORY_ORDER.map((id) => ({
      id,
      label: GOAL_TEMPLATE_CATEGORIES[id].label,
      templates: byCat[id],
    })).filter((c) => c.templates.length > 0);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setStep("grid");
        setSelectedTemplate(null);
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const handleConfirmSuccess = useCallback(
    (goalId: string) => {
      onGoalCreated?.(goalId);
      setStep("grid");
      setSelectedTemplate(null);
      onOpenChange(false);
      router.push(`/portal/goals/${goalId}`);
    },
    [onGoalCreated, onOpenChange, router],
  );

  const viewModel: GoalTemplatePickerViewModel = {
    step,
    selectedTemplate,
    categories,
    onSelectTemplate: (template: GoalTemplate) => {
      setSelectedTemplate(template);
      setStep("confirm");
    },
    onCustomGoal,
    onConfirmBack: () => {
      setStep("grid");
      setSelectedTemplate(null);
    },
    onConfirmSuccess: handleConfirmSuccess,
  };

  return (
    <GoalTemplatePickerView
      open={open}
      onOpenChange={handleOpenChange}
      {...viewModel}
    />
  );
}
