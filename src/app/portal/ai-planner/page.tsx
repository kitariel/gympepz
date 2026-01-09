"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import WorkoutChat from "./components/workout-chat";
import { OnboardingWizard } from "./_components/onboarding-wizard";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIPlannerPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const router = useRouter();

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

  const handleOnboardingComplete = (data: {
    goal: string;
    experience: "Beginner" | "Intermediate" | "Advanced";
    equipment: "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid";
    days: number;
  }) => {
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
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-background">
      <WorkoutChat
        userId={userId}
        goal={initialData?.goal ?? ""}
        days={initialData?.days ?? 3}
        experience={initialData?.experience ?? "Beginner"}
        equipment={initialData?.equipment ?? "Full Gym"}
        onPlanCreated={(id) => {
          // Navigate to the plan detail page
          router.push(`/portal/plans/${id}`);
        }}
      />
    </div>
  );
}
