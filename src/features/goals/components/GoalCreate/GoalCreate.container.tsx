"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useGoalMutations } from "@/hooks/useGoals";
import { GOAL_TYPES, UNITS, getGoalTypeConfig } from "./GoalCreate.config";
import type { GoalCreateViewModel, GoalTypeValue } from "./GoalCreate.types";
import { GoalCreateView } from "./GoalCreate.view";

// Container: owns form state, validation, and mutation side effects.
export function GoalCreateContainer() {
  const router = useRouter();
  const { create, isCreating, userId } = useGoalMutations();

  const [type, setType] = useState<GoalTypeValue>("strength");
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);

  const units = useMemo(() => UNITS[type] ?? UNITS.strength, [type]);
  const requiresExercise =
    getGoalTypeConfig(type)?.requiresExercise ?? false;

  const handleTypeChange = useCallback((newType: GoalTypeValue) => {
    setType(newType);
    const typeUnits = UNITS[newType];
    setUnit(typeUnits?.[0]?.value ?? "kg");
    const config = getGoalTypeConfig(newType);
    if (!config?.requiresExercise) {
      setExerciseId(null);
      setExerciseName(null);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const value = Number.parseFloat(targetValue);
      if (Number.isNaN(value) || value <= 0) {
        setError("Enter a valid target value.");
        return;
      }

      if (!userId) {
        setError("Sign in to create goals.");
        return;
      }

      if (requiresExercise && !exerciseId) {
        setError("Please select an exercise for this goal type.");
        return;
      }

      try {
        const goal = await create({
          type,
          targetValue: value,
          unit: unit as "lbs" | "kg" | "reps" | "workouts",
          deadline: deadline ? new Date(deadline) : undefined,
          exerciseId: requiresExercise ? exerciseId ?? undefined : undefined,
        });
        router.push(`/portal/goals/${goal.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create goal.");
      }
    },
    [
      targetValue,
      userId,
      requiresExercise,
      exerciseId,
      create,
      type,
      unit,
      deadline,
      router,
    ],
  );

  const viewModel: GoalCreateViewModel = {
    isAuthenticated: Boolean(userId),
    isCreating,
    type,
    exerciseId,
    exerciseName,
    targetValue,
    unit,
    deadline,
    error,
    goalTypes: GOAL_TYPES,
    units,
    requiresExercise,
    paths: {
      backToGoals: "/portal/goals",
      cancel: "/portal/goals",
      login: "/login",
    },
    onTypeChange: handleTypeChange,
    onExerciseChange: (id, name) => {
      setExerciseId(id);
      setExerciseName(name);
    },
    onTargetChange: setTargetValue,
    onUnitChange: setUnit,
    onDeadlineChange: setDeadline,
    onSubmit: handleSubmit,
  };

  return <GoalCreateView {...viewModel} />;
}
