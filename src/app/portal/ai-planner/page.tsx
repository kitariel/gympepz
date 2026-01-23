"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import WorkoutChat from "./components/workout-chat";
import { OnboardingWizard } from "./_components/onboarding-wizard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Dumbbell,
  Target,
  Calendar,
  History,
  ChevronRight,
  Zap,
  TrendingUp,
  RotateCcw,
} from "lucide-react";

type OnboardingData = {
  goal: string;
  experience: "Beginner" | "Intermediate" | "Advanced";
  equipment: "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid";
  days: number;
};

export default function AIPlannerPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const router = useRouter();

  const [view, setView] = useState<"home" | "onboarding" | "chat">("home");
  const [initialData, setInitialData] = useState<OnboardingData | null>(null);

  useEffect(() => {
    // Check if user has seen onboarding
    const savedData = localStorage.getItem("ai-planner-preferences");
    if (savedData) {
      try {
        setInitialData(JSON.parse(savedData));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleOnboardingComplete = (data: OnboardingData) => {
    setInitialData(data);
    localStorage.setItem("ai-planner-preferences", JSON.stringify(data));
    setView("chat");
  };

  const handleSkipOnboarding = () => {
    setView("chat");
  };

  const handleStartChat = () => {
    if (!initialData) {
      setView("onboarding");
    } else {
      setView("chat");
    }
  };

  const handleResetPreferences = () => {
    localStorage.removeItem("ai-planner-preferences");
    setInitialData(null);
    setView("onboarding");
  };

  // Onboarding View
  if (view === "onboarding") {
    return (
      <div className="flex-1">
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      </div>
    );
  }

  // Chat View
  if (view === "chat") {
    return (
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-background">
        {/* Header with back button */}
        <div className="border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("home")}
            className="gap-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">AI Coach</p>
              <p className="text-xs text-muted-foreground">Ready to help</p>
            </div>
          </div>
          {initialData && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {initialData.experience} • {initialData.equipment}
            </Badge>
          )}
        </div>
        <WorkoutChat
          userId={userId}
          goal={initialData?.goal ?? ""}
          days={initialData?.days ?? 3}
          experience={initialData?.experience ?? "Beginner"}
          equipment={initialData?.equipment ?? "Full Gym"}
          onPlanCreated={() => {
            router.push("/portal/train/overview");
          }}
        />
      </div>
    );
  }

  // Home/Dashboard View
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">AI Workout Coach</h1>
                    <p className="text-sm text-muted-foreground">
                      Powered by advanced AI
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground max-w-md">
                  Get personalized workout plans tailored to your goals,
                  experience, and available equipment. Just tell me what you
                  want to achieve.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleStartChat}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Conversation
                  </Button>
                  {initialData && (
                    <Button
                      variant="outline"
                      onClick={handleResetPreferences}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Preferences
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Current Preferences */}
            {initialData && (
              <div className="mt-6 pt-6 border-t border-violet-500/20">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Your Preferences
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                  >
                    <Target className="mr-1.5 h-3 w-3" />
                    {initialData.goal === "muscle"
                      ? "Build Muscle"
                      : initialData.goal === "strength"
                        ? "Gain Strength"
                        : initialData.goal === "lose"
                          ? "Lose Weight"
                          : initialData.goal === "endurance"
                            ? "Improve Endurance"
                            : "General Fitness"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                  >
                    <TrendingUp className="mr-1.5 h-3 w-3" />
                    {initialData.experience}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                  >
                    <Dumbbell className="mr-1.5 h-3 w-3" />
                    {initialData.equipment}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                  >
                    <Calendar className="mr-1.5 h-3 w-3" />
                    {initialData.days} days/week
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              icon={<Zap className="h-5 w-5" />}
              title="Generate Plan"
              description="Create a new workout plan with AI"
              onClick={handleStartChat}
              gradient="from-amber-500 to-orange-500"
            />
            <QuickActionCard
              icon={<Dumbbell className="h-5 w-5" />}
              title="Browse Templates"
              description="Explore pre-made workout plans"
              onClick={() => router.push("/portal/train/templates")}
              gradient="from-emerald-500 to-teal-500"
            />
            <QuickActionCard
              icon={<Target className="h-5 w-5" />}
              title="Set Goals"
              description="Track your fitness objectives"
              onClick={() => router.push("/portal/goals")}
              gradient="from-blue-500 to-cyan-500"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Try Asking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Create a push/pull/legs 6-day split for muscle building",
              "I want a full body workout 3x per week for beginners",
              "Design an upper/lower 4-day program for strength",
              "Give me a home workout plan with no equipment",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setView("chat");
                }}
                className="group text-left p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all"
              >
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  &ldquo;{prompt}&rdquo;
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">What AI Coach Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Sparkles className="h-5 w-5 text-violet-500" />}
              title="Personalized Plans"
              description="Get workout plans tailored to your specific goals, experience level, and available equipment."
            />
            <FeatureCard
              icon={<Calendar className="h-5 w-5 text-emerald-500" />}
              title="Flexible Scheduling"
              description="Plans adapt to your availability - whether you can train 2 days or 6 days per week."
            />
            <FeatureCard
              icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
              title="Progressive Overload"
              description="Programs designed with proper progression to help you continuously improve."
            />
            <FeatureCard
              icon={<History className="h-5 w-5 text-amber-500" />}
              title="Conversational"
              description="Refine your plan through natural conversation. Ask questions and make adjustments easily."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  onClick,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-lg"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
      />
      <div className="relative">
        <div
          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3`}
        >
          {icon}
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
    </button>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
      <div className="shrink-0">{icon}</div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
