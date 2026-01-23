"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Target,
  Dumbbell,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  Zap,
  Heart,
  Trophy,
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (data: {
    goal: string;
    experience: "Beginner" | "Intermediate" | "Advanced";
    equipment: "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid";
    days: number;
  }) => void;
  onSkip: () => void;
}

export function OnboardingWizard({
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState<
    "Beginner" | "Intermediate" | "Advanced"
  >("Beginner");
  const [equipment, setEquipment] = useState<
    "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid"
  >("Full Gym");
  const [days, setDays] = useState(3);

  const totalSteps = 4;

  const GOALS = [
    {
      id: "muscle",
      label: "Build Muscle",
      description: "Gain lean mass and definition",
      icon: Dumbbell,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: "strength",
      label: "Gain Strength",
      description: "Increase your lifting power",
      icon: Trophy,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      id: "lose",
      label: "Lose Weight",
      description: "Burn fat and get leaner",
      icon: Flame,
      gradient: "from-rose-500 to-red-600",
    },
    {
      id: "endurance",
      label: "Improve Endurance",
      description: "Build stamina and cardio",
      icon: Heart,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "general",
      label: "General Fitness",
      description: "Overall health and wellness",
      icon: Zap,
      gradient: "from-blue-500 to-cyan-600",
    },
  ];

  const EXPERIENCE_LEVELS = [
    {
      level: "Beginner" as const,
      description: "New to working out or returning after a long break",
      timeframe: "< 1 year",
    },
    {
      level: "Intermediate" as const,
      description: "Regular gym-goer with solid foundational knowledge",
      timeframe: "1-3 years",
    },
    {
      level: "Advanced" as const,
      description: "Experienced lifter with advanced training knowledge",
      timeframe: "3+ years",
    },
  ];

  const EQUIPMENT_OPTIONS = [
    {
      value: "Full Gym" as const,
      label: "Full Gym",
      description: "Barbells, machines, cables, etc.",
      icon: "🏋️",
    },
    {
      value: "Dumbbells" as const,
      label: "Dumbbells Only",
      description: "Just dumbbells and basics",
      icon: "💪",
    },
    {
      value: "Home Setup" as const,
      label: "Home/Bodyweight",
      description: "Minimal or no equipment",
      icon: "🏠",
    },
    {
      value: "Hybrid" as const,
      label: "Hybrid Setup",
      description: "Mix of different equipment",
      icon: "⚡",
    },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({ goal, experience, equipment, days });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const selectedGoal = GOALS.find((g) => g.id === goal);

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Setup Your Profile</h1>
                <p className="text-xs text-muted-foreground">
                  Step {step} of {totalSteps}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  i + 1 <= step
                    ? "bg-gradient-to-r from-violet-500 to-purple-600"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-violet-500" />
                  <h2 className="text-xl font-semibold">
                    What&apos;s your primary goal?
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  This helps us create the perfect workout plan tailored to your
                  objectives
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {GOALS.map((g) => {
                  const Icon = g.icon;
                  const isSelected = goal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={cn(
                        "group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-violet-500/50 bg-violet-500/10"
                          : "border-border/50 hover:border-violet-500/30 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0",
                          g.gradient
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{g.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {g.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-violet-500" />
                  <h2 className="text-xl font-semibold">
                    What&apos;s your experience level?
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll adjust the intensity and exercise selection
                  accordingly
                </p>
              </div>

              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => {
                  const isSelected = experience === level.level;
                  return (
                    <button
                      key={level.level}
                      onClick={() => setExperience(level.level)}
                      className={cn(
                        "group relative flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-violet-500/50 bg-violet-500/10"
                          : "border-border/50 hover:border-violet-500/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{level.level}</p>
                          <Badge
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {level.timeframe}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0 ml-4">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Equipment */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-violet-500" />
                  <h2 className="text-xl font-semibold">
                    What equipment do you have?
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll include exercises that match your available
                  equipment
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENT_OPTIONS.map((e) => {
                  const isSelected = equipment === e.value;
                  return (
                    <button
                      key={e.value}
                      onClick={() => setEquipment(e.value)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                        isSelected
                          ? "border-violet-500/50 bg-violet-500/10"
                          : "border-border/50 hover:border-violet-500/30 hover:bg-muted/50"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <span className="text-3xl">{e.icon}</span>
                      <div>
                        <p className="font-medium">{e.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Days per week */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-violet-500" />
                  <h2 className="text-xl font-semibold">
                    How many days per week?
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll create a schedule that fits your availability
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {[2, 3, 4, 5, 6].map((d) => {
                  const isSelected = days === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={cn(
                        "h-14 w-14 rounded-xl border text-lg font-bold transition-all",
                        isSelected
                          ? "border-violet-500 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                          : "border-border/50 hover:border-violet-500/30 hover:bg-muted/50"
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {days === 2 && "Perfect for maintaining fitness with a busy schedule"}
                {days === 3 && "Great balance for beginners and intermediate lifters"}
                {days === 4 && "Ideal for building muscle with adequate recovery"}
                {days === 5 && "Optimal for dedicated training and faster progress"}
                {days === 6 && "Advanced split for maximum training volume"}
              </p>

              {/* Summary Card */}
              <div className="mt-8 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Your Plan Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Goal</p>
                    <div className="flex items-center gap-2">
                      {selectedGoal && (
                        <div
                          className={cn(
                            "h-6 w-6 rounded-md bg-gradient-to-br flex items-center justify-center",
                            selectedGoal.gradient
                          )}
                        >
                          <selectedGoal.icon className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <p className="font-medium">{selectedGoal?.label}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-medium">{experience}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Equipment</p>
                    <p className="font-medium">{equipment}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Schedule</p>
                    <p className="font-medium">{days} days/week</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !goal) ||
                (step === 2 && !experience) ||
                (step === 3 && !equipment)
              }
              className={cn(
                "gap-2 min-w-[140px]",
                step === totalSteps &&
                  "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
              )}
            >
              {step === totalSteps ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Start Chat
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
