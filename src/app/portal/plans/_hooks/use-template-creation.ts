/**
 * Custom hook for template-based plan creation
 */

import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { TEMPLATE_DEFINITIONS } from "../_components/template-exercises";

export function useTemplateCreation(userId: string) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const create = api.plan.create.useMutation();
  const setActive = api.plan.setActive.useMutation();
  const list = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });

  const exercises = api.exercise.list.useQuery(
    { take: 500 },
    { enabled: !!selectedTemplate },
  );

  const findExerciseId = (name: string): string | null => {
    const searchName = name.toLowerCase().trim();
    const exerciseList = exercises.data ?? [];

    // Try exact match first
    let found = exerciseList.find(
      (ex) => ex.name.toLowerCase() === searchName,
    );
    if (found) return found.id;

    // Try partial match
    found = exerciseList.find((ex) => {
      const exName = ex.name.toLowerCase();
      return exName.includes(searchName) || searchName.includes(exName);
    });

    // Try reverse match
    found ??= exerciseList.find((ex) => {
      const exName = ex.name.toLowerCase();
      return exName.endsWith(searchName) || exName.includes(` ${searchName}`);
    });

    return found?.id ?? null;
  };

  const handleCreateFromTemplate = async (
    templateId: string,
    planName: string,
  ) => {
    if (!userId || !planName) return;

    const template = TEMPLATE_DEFINITIONS[templateId];
    if (!template) {
      return null;
    }

    const days = template.days.map((day, idx) => ({
      title: day.title,
      order: idx,
      items: day.exerciseNames
        .map((exDef) => {
          const exerciseId = findExerciseId(exDef.name);
          if (!exerciseId) {
            return null;
          }
          return {
            exerciseId,
            sets: exDef.sets,
            reps: exDef.reps,
            weight: exDef.weight,
          };
        })
        .filter((item) => item !== null) as {
          exerciseId: string;
          reps: number;
          sets: number;
          weight?: number;
        }[],
    }));

    const newPlan = await create.mutateAsync({
      userId,
      name: planName,
      days: days.map((day) => ({
        title: day.title,
        order: day.order,
        items: day.items,
      })),
    });

    // Auto-set first plan as active if no active plan exists
    const plansList = await list.refetch();
    const hasActivePlan = plansList.data?.some((p) => p.isActive);
    if (!hasActivePlan && newPlan) {
      await setActive.mutateAsync({ userId, planId: newPlan.id });
    }

    // Navigate to the new plan for editing
    router.push(`/portal/plans/${newPlan.id}`);

    return newPlan;
  };

  return {
    selectedTemplate,
    setSelectedTemplate,
    exercises,
    handleCreateFromTemplate,
    isCreating: create.isPending,
  };
}

