/**
 * Quick Plan Wizard - Main component
 * Orchestrates the multi-step plan creation wizard
 */

"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { WizardProgress } from "./wizard-progress";
import { Step1BodyPart } from "./step-1-body-part";
import { Step2Exercises } from "./step-2-exercises";
import { Step3AddDays } from "./step-3-add-days";
import { Step4Review } from "./step-4-review";
import { ExerciseSelectionDialog } from "./exercise-selection-dialog";
import { useWizardState } from "./_hooks/use-wizard-state";
import { filterExercisesByBodyPart } from "./_utils/exercise-filter";
import type { BodyPart, DayPlan, ExerciseConfig } from "../../_types";

interface QuickPlanWizardProps {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function QuickPlanWizard({
  userId,
  onComplete,
  onCancel,
}: QuickPlanWizardProps) {
  const router = useRouter();
  const state = useWizardState();

  // Fetch exercises
  const exercisesQuery = api.exercise.list.useQuery({
    q: state.searchQuery || undefined,
    take: 100,
  });

  // Filter exercises by body part
  const filteredExercises = filterExercisesByBodyPart(
    exercisesQuery.data ?? [],
    state.selectedBodyPart,
  );

  // Mutations
  const createPlan = api.plan.create.useMutation();
  const setActive = api.plan.setActive.useMutation();

  // Handlers
  const handleSelectBodyPart = (bodyPart: BodyPart) => {
    state.setSelectedBodyPart(bodyPart);
    state.setStep(2);
  };

  const handleAddExercise = () => {
    if (!state.selectedExercise || !state.selectedBodyPart) return;

    const currentDay = state.days[state.currentDayIndex];
    if (!currentDay) {
      // Create new day for this body part
      const dayTitle = `${state.selectedBodyPart} Day`;
      const newDay: DayPlan = {
        title: dayTitle,
        bodyPart: state.selectedBodyPart,
        exercises: [
          {
            exerciseId: state.selectedExercise,
            sets: state.exerciseConfig.sets,
            reps: state.exerciseConfig.reps,
            weight: state.exerciseConfig.weight,
          },
        ],
      };
      state.setDays([newDay]);
    } else {
      // Check if exercise already exists (prevent duplicates)
      if (
        currentDay.exercises.some(
          (ex) => ex.exerciseId === state.selectedExercise,
        )
      ) {
        state.resetExerciseSelection();
        return;
      }

      // Add to existing day
      const updatedDays = [...state.days];
      updatedDays[state.currentDayIndex] = {
        ...currentDay,
        exercises: [
          ...currentDay.exercises,
          {
            exerciseId: state.selectedExercise,
            sets: state.exerciseConfig.sets,
            reps: state.exerciseConfig.reps,
            weight: state.exerciseConfig.weight,
          },
        ],
      };
      state.setDays(updatedDays);
    }

    state.resetExerciseSelection();
    state.setIsExerciseDialogOpen(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedDays = [...state.days];
    updatedDays[state.currentDayIndex]!.exercises =
      updatedDays[state.currentDayIndex]?.exercises.filter(
        (_, i) => i !== index,
      ) ?? [];
    state.setDays(updatedDays);
  };

  const handleAddAnotherDay = () => {
    state.setSelectedBodyPart(null);
    state.setCurrentDayIndex(state.days.length);
    state.setStep(1);
  };

  const handleAutoGenerate5Days = () => {
    // Auto-generate Push/Pull/Legs/Push/Pull rotation
    const rotation: BodyPart[] = ["Push", "Pull", "Legs", "Push", "Pull"];
    const existingDay = state.days[0];

    // Create 5 days with the rotation
    const newDays: DayPlan[] = rotation.map((bodyPart, idx) => {
      // If we have an existing day with exercises and it matches the body part, use those exercises
      if (
        existingDay?.bodyPart === bodyPart &&
        existingDay.exercises.length > 0
      ) {
        return {
          title: `Day ${idx + 1} - ${bodyPart}`,
          bodyPart,
          exercises: [...existingDay.exercises], // Copy exercises from user's template
        };
      }
      return {
        title: `Day ${idx + 1} - ${bodyPart}`,
        bodyPart,
        exercises: [],
      };
    });
    state.setDays(newDays);
    state.setStep(4); // Show summary
  };

  const handleSavePlan = async () => {
    if (!state.planName.trim() || state.days.length === 0) return;

    try {
      const plan = await createPlan.mutateAsync({
        userId,
        name: state.planName,
        days: state.days.map((day, idx) => ({
          title: day.title,
          order: idx,
          items: day.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          })),
        })),
      });

      // Set as active
      if (userId) {
        await setActive.mutateAsync({ userId, planId: plan.id });
      }

      onComplete();
      // Small delay to ensure plan is set as active before redirect
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      if (error instanceof Error) {
        // Could show toast notification here in the future
      }
    }
  };

  const currentDay = state.days[state.currentDayIndex];

  return (
    <div className="space-y-6">
      <WizardProgress currentStep={state.step} />

      {/* Step 1: Select Body Part */}
      {state.step === 1 && (
        <Step1BodyPart
          onSelectBodyPart={handleSelectBodyPart}
          onCancel={onCancel}
        />
      )}

      {/* Step 2: Select Exercises */}
      {state.step === 2 && state.selectedBodyPart && (
        <Step2Exercises
          bodyPart={state.selectedBodyPart}
          currentDay={currentDay}
          exercises={exercisesQuery.data ?? []}
          onAddExercise={handleAddExercise}
          onRemoveExercise={handleRemoveExercise}
          onBack={() => state.setStep(1)}
          onContinue={() => state.setStep(3)}
          onOpenExerciseDialog={() => state.setIsExerciseDialogOpen(true)}
          canContinue={
            !!currentDay && currentDay.exercises.length > 0
          }
        />
      )}

      {/* Step 3: Add More Days or Finish */}
      {state.step === 3 && (
        <Step3AddDays
          daysCount={state.days.length}
          onAddAnotherDay={handleAddAnotherDay}
          onAutoGenerate={handleAutoGenerate5Days}
          onBack={() => state.setStep(2)}
          onFinish={() => state.setStep(4)}
        />
      )}

      {/* Step 4: Review & Save */}
      {state.step === 4 && (
        <Step4Review
          planName={state.planName}
          onPlanNameChange={state.setPlanName}
          days={state.days}
          exercises={exercisesQuery.data ?? []}
          onBack={() => state.setStep(3)}
          onSave={handleSavePlan}
          isSaving={createPlan.isPending}
          canSave={!!state.planName.trim() && !!userId}
        />
      )}

      {/* Exercise Selection Dialog */}
      <ExerciseSelectionDialog
        open={state.isExerciseDialogOpen}
        onOpenChange={state.setIsExerciseDialogOpen}
        exercises={filteredExercises}
        selectedExercise={state.selectedExercise}
        exerciseConfig={state.exerciseConfig}
        searchQuery={state.searchQuery}
        onSearchChange={state.setSearchQuery}
        onExerciseSelect={(exerciseId) => {
          state.setSelectedExercise(exerciseId);
          state.setExerciseConfig({
            ...state.exerciseConfig,
            exerciseId,
          });
        }}
        onExerciseDeselect={state.resetExerciseSelection}
        onConfigChange={(config) =>
          state.setExerciseConfig({
            ...state.exerciseConfig,
            ...config,
          })
        }
        onAddExercise={handleAddExercise}
        canAdd={
          state.exerciseConfig.sets >= 1 && state.exerciseConfig.reps >= 1
        }
      />
    </div>
  );
}

