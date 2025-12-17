"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import WorkoutChat from "./components/workout-chat";
import { OnboardingWizard } from "./_components/onboarding-wizard";

export default function AIPlannerPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [initialData, setInitialData] = useState<{
    goal: string;
    experience: "Beginner" | "Intermediate" | "Advanced";
    equipment: "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid";
    days: number;
  } | null>(null);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasCompleted = localStorage.getItem("ai-planner-onboarding");
    if (hasCompleted) {
      setShowOnboarding(false);
      setHasSeenOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (data: any) => {
    setInitialData(data);
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    localStorage.setItem("ai-planner-onboarding", "true");
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    localStorage.setItem("ai-planner-onboarding", "true");
  };

  if (showOnboarding && !hasSeenOnboarding) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <WorkoutChat
        userId={userId}
        goal={initialData?.goal ?? ""}
        days={initialData?.days ?? 3}
        experience={initialData?.experience ?? "Beginner"}
        equipment={initialData?.equipment ?? "Full Gym"}
        onPlanCreated={(id) => void id}
      />
    </div>
  );
}
