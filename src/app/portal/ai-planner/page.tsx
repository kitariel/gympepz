"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import WorkoutChat from "./components/workout-chat";
import { OnboardingWizard } from "./_components/onboarding-wizard";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex-1 flex flex-col p-4 sm:p-6 pt-4">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
            <Sparkles className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Workout Planner</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Chat with AI to create personalized workout plans
            </p>
          </div>
        </div>
        {initialData && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Goal: {initialData.goal || "General Fitness"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {initialData.experience}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {initialData.equipment}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {initialData.days} days/week
            </Badge>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0 border rounded-lg bg-card">
        <WorkoutChat
          userId={userId}
          goal={initialData?.goal ?? ""}
          days={initialData?.days ?? 3}
          experience={initialData?.experience ?? "Beginner"}
          equipment={initialData?.equipment ?? "Full Gym"}
          onPlanCreated={(id) => {
            // Navigate to the plan or show success
            console.log("Plan created:", id);
          }}
        />
      </div>
    </div>
  );
}
