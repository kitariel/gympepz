"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGoalTemplates } from "@/hooks/useGoalTemplates";
import { groupGoalTemplatesByCategory } from "@/lib/goal-template-utils";
import type { GoalTemplate } from "@/types/goal-template.types";
import type { GoalTemplatePickerProps, GoalTemplatePickerViewModel } from "./GoalTemplatePicker.types";
import { GoalTemplatePickerView } from "./GoalTemplatePicker.view";

export function GoalTemplatePickerContainer({
  open,
  onOpenChange,
  onCustomGoal,
  onGoalCreated,
}: GoalTemplatePickerProps) {
  const router = useRouter();
  const { templates } = useGoalTemplates();
  const [step, setStep] = useState<"grid" | "confirm">("grid");
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  const categories = useMemo(() => {
    return groupGoalTemplatesByCategory(templates);
  }, [templates]);

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
