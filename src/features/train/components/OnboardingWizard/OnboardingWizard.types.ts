import type { TrainingEquipment, TrainingExperience, TrainingGoal } from "@/lib/training-profile/types";

export type OnboardingWizardViewProps = {
  hydrated: boolean;
  experience: TrainingExperience;
  goal: TrainingGoal;
  equipment: TrainingEquipment;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  onExperienceChange: (value: TrainingExperience) => void;
  onGoalChange: (value: TrainingGoal) => void;
  onEquipmentChange: (value: TrainingEquipment) => void;
  onDaysPerWeekChange: (value: 2 | 3 | 4 | 5 | 6) => void;
  onContinue: () => void;
  onBack: () => void;
};

