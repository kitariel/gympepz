"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Dumbbell, Calendar, Sparkles } from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (data: {
    goal: string;
    experience: "Beginner" | "Intermediate" | "Advanced";
    equipment: "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid";
    days: number;
  }) => void;
  onSkip: () => void;
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
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
  const progress = (step / totalSteps) * 100;

  const GOALS = [
    { id: "muscle", label: "Build Muscle", icon: "💪" },
    { id: "strength", label: "Gain Strength", icon: "🏋️" },
    { id: "lose", label: "Lose Weight", icon: "🔥" },
    { id: "endurance", label: "Improve Endurance", icon: "🏃" },
    { id: "general", label: "General Fitness", icon: "🎯" },
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Workout Generator
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Target className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">
                  What's your primary goal?
                </h3>
                <p className="text-sm text-muted-foreground">
                  This helps us create the perfect workout plan for you
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <Button
                    key={g.id}
                    variant={goal === g.id ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => setGoal(g.id)}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span>{g.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Dumbbell className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">
                  What's your experience level?
                </h3>
                <p className="text-sm text-muted-foreground">
                  We'll adjust the intensity and exercise selection accordingly
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    level: "Beginner" as const,
                    desc: "New to working out or returning after a long break",
                  },
                  {
                    level: "Intermediate" as const,
                    desc: "Regular gym-goer with 1-2 years of experience",
                  },
                  {
                    level: "Advanced" as const,
                    desc: "Experienced lifter with 3+ years of training",
                  },
                ].map((l) => (
                  <Button
                    key={l.level}
                    variant={experience === l.level ? "default" : "outline"}
                    className="w-full h-auto py-4 flex-col items-start text-left"
                    onClick={() => setExperience(l.level)}
                  >
                    <span className="font-semibold">{l.level}</span>
                    <span className="text-xs opacity-80">{l.desc}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Equipment */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Dumbbell className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">
                  What equipment do you have access to?
                </h3>
                <p className="text-sm text-muted-foreground">
                  We'll include exercises that match your available equipment
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "Full Gym" as const,
                    label: "Full Gym",
                    desc: "Barbells, machines, cables, etc.",
                  },
                  {
                    value: "Dumbbells" as const,
                    label: "Dumbbells",
                    desc: "Just dumbbells and basics",
                  },
                  {
                    value: "Home Setup" as const,
                    label: "Home/Bodyweight",
                    desc: "Minimal or no equipment",
                  },
                  {
                    value: "Hybrid" as const,
                    label: "Hybrid",
                    desc: "Mix of different equipment",
                  },
                ].map((e) => (
                  <Button
                    key={e.value}
                    variant={equipment === e.value ? "default" : "outline"}
                    className="h-24 flex-col gap-1 items-start text-left"
                    onClick={() => setEquipment(e.value)}
                  >
                    <span className="font-semibold">{e.label}</span>
                    <span className="text-xs opacity-80">{e.desc}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Days per week */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Calendar className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">
                  How many days per week can you train?
                </h3>
                <p className="text-sm text-muted-foreground">
                  We'll create a schedule that fits your availability
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[2, 3, 4, 5, 6].map((d) => (
                  <Button
                    key={d}
                    variant={days === d ? "default" : "outline"}
                    className="h-20 text-lg font-bold"
                    onClick={() => setDays(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Your Plan Summary:</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Goal:</strong> {GOALS.find((g) => g.id === goal)?.label}
                  </p>
                  <p>
                    <strong>Experience:</strong> {experience}
                  </p>
                  <p>
                    <strong>Equipment:</strong> {equipment}
                  </p>
                  <p>
                    <strong>Training Days:</strong> {days} days per week
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !goal) ||
                (step === 2 && !experience) ||
                (step === 3 && !equipment)
              }
            >
              {step === totalSteps ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Plan
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
