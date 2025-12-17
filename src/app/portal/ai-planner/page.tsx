"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import WorkoutChat from "./components/workout-chat";
import { OnboardingWizard } from "./_components/onboarding-wizard";
import { Sparkles } from "lucide-react";

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
      <div className="flex-1 p-6 pt-4">
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 pt-4">
      {/* Compact Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <h2 className="text-2xl font-bold tracking-tight">AI Workout Planner</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate personalized workout plans with AI assistance
        </p>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <WorkoutChat
          userId={userId}
          goal={initialData?.goal ?? ""}
          days={initialData?.days ?? 3}
          experience={initialData?.experience ?? "Beginner"}
          equipment={initialData?.equipment ?? "Full Gym"}
          onPlanCreated={(id) => void id}
        />
      </div>
    </div>
  );
}
