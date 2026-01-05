/**
 * Custom hook for managing wizard state
 */

import { useState } from "react";
import type { BodyPart, DayPlan, ExerciseConfig } from "../../../_types";

export function useWizardState() {
  const [step, setStep] = useState(1);
  const [planName, setPlanName] = useState("My Workout Plan");
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseConfig, setExerciseConfig] = useState<ExerciseConfig>({
    exerciseId: "",
    sets: 3,
    reps: 10,
    weight: undefined,
  });
  const [days, setDays] = useState<DayPlan[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const resetExerciseSelection = () => {
    setSelectedExercise(null);
    setExerciseConfig({
      exerciseId: "",
      sets: 3,
      reps: 10,
      weight: undefined,
    });
    setSearchQuery("");
  };

  return {
    step,
    setStep,
    planName,
    setPlanName,
    selectedBodyPart,
    setSelectedBodyPart,
    selectedExercise,
    setSelectedExercise,
    exerciseConfig,
    setExerciseConfig,
    days,
    setDays,
    currentDayIndex,
    setCurrentDayIndex,
    isExerciseDialogOpen,
    setIsExerciseDialogOpen,
    searchQuery,
    setSearchQuery,
    resetExerciseSelection,
  };
}

