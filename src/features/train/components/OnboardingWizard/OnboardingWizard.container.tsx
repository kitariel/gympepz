"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import type { TrainingEquipment, TrainingExperience, TrainingGoal } from "@/lib/training-profile/types";
import type { OnboardingWizardViewProps } from "./OnboardingWizard.types";
import { OnboardingWizardView } from "./OnboardingWizard.view";

export function OnboardingWizard() {
  const router = useRouter();
  const { profile, save, hydrated } = useTrainingProfile();

  const initializedRef = useRef(false);

  const [experience, setExperience] = useState<TrainingExperience>(profile?.experience ?? "newbie");
  const [goal, setGoal] = useState<TrainingGoal>(profile?.goal ?? "general_fitness");
  const [equipment, setEquipment] = useState<TrainingEquipment>(profile?.equipment ?? "bodyweight");
  const [daysPerWeek, setDaysPerWeek] = useState<2 | 3 | 4 | 5 | 6>(profile?.daysPerWeek ?? 3);

  useEffect(() => {
    if (!hydrated) return;
    if (initializedRef.current) return;
    if (!profile) {
      initializedRef.current = true;
      return;
    }
    setExperience(profile.experience);
    setGoal(profile.goal);
    setEquipment(profile.equipment);
    setDaysPerWeek(profile.daysPerWeek);
    initializedRef.current = true;
  }, [hydrated, profile]);

  const { debounced: debouncedAutosave } = useDebouncedCallback(
    (next: {
      experience: TrainingExperience;
      goal: TrainingGoal;
      equipment: TrainingEquipment;
      daysPerWeek: 2 | 3 | 4 | 5 | 6;
    }) => {
      save(next);
    },
    500,
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!initializedRef.current) return;
    debouncedAutosave({ experience, goal, equipment, daysPerWeek });
  }, [hydrated, experience, goal, equipment, daysPerWeek, debouncedAutosave]);

  const viewProps: OnboardingWizardViewProps = {
    hydrated,
    experience,
    goal,
    equipment,
    daysPerWeek,
    onExperienceChange: setExperience,
    onGoalChange: setGoal,
    onEquipmentChange: setEquipment,
    onDaysPerWeekChange: setDaysPerWeek,
    onContinue: () => {
      save({ experience, goal, equipment, daysPerWeek });
      router.push("/train/templates");
    },
    onBack: () => router.push("/train"),
  };

  return <OnboardingWizardView {...viewProps} />;
}

