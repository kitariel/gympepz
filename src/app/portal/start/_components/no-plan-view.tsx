/**
 * Component shown when user has no workout plan
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Dumbbell, Sparkles } from "lucide-react";
import { QuickPlanWizard } from "./quick-plan-wizard";

interface NoPlanViewProps {
  userId: string;
  onPlanCreated: () => void;
}

export function NoPlanView({ userId, onPlanCreated }: NoPlanViewProps) {
  const router = useRouter();
  const [showPlanChoices, setShowPlanChoices] = useState(false);
  const [showQuickWizard, setShowQuickWizard] = useState(false);

  if (showQuickWizard) {
    return (
      <div className="container mx-auto max-w-4xl p-4 sm:p-6">
        <div className="mb-4 space-y-1 text-center sm:mb-6 sm:space-y-2">
          <h1 className="text-xl font-bold sm:text-2xl">Quick Plan Builder</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Build your workout plan in minutes
          </p>
        </div>
        <QuickPlanWizard
          userId={userId}
          onComplete={async () => {
            setShowQuickWizard(false);
            onPlanCreated();
          }}
          onCancel={() => setShowQuickWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      {!showPlanChoices ? (
        <Card className="border-0 bg-transparent shadow-none sm:border-2 sm:border-dashed sm:bg-card">
          <CardContent className="space-y-6 px-0 pt-8 pb-8 text-center sm:px-6 sm:pt-16 sm:pb-16">
            <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
              <Target className="text-primary h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold sm:text-2xl">
                No Workout Plan Found
              </h2>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">
                Create a workout plan to get started. Choose how you&apos;d like
                to build your plan.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowPlanChoices(true)}
              className="h-14 bg-gradient-to-r from-blue-500 to-emerald-500 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] sm:h-12"
            >
              Create Workout Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Manual Builder Card */}
          <Card
            className="group cursor-pointer border-0 bg-transparent shadow-none transition-all duration-200 active:scale-[0.98] sm:border-2 sm:border-transparent sm:bg-card sm:hover:border-primary/50 sm:hover:shadow-lg"
            onClick={() => setShowQuickWizard(true)}
          >
            <CardHeader className="px-0 pt-0 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <div className="bg-primary/10 shrink-0 rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110 sm:p-3">
                  <Dumbbell className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">
                    Manual Builder
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm">
                    Build your workout plan step by step
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-4 sm:px-6 sm:pb-6">
              <ul className="text-muted-foreground mb-4 space-y-2.5 text-xs sm:mb-6 sm:space-y-3 sm:text-sm">
                <li className="flex items-start gap-2 sm:gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span>Select day and body part (Push/Pull/Legs)</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span>Choose exercises from the library</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span>Set sets, reps, and weight</span>
                </li>
              </ul>
              <Button
                className="h-12 w-full text-sm font-semibold sm:h-11 sm:text-base"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickWizard(true);
                }}
              >
                Start Building
              </Button>
            </CardContent>
          </Card>

          {/* AI Planner Card */}
          <Card
            className="group cursor-pointer border-0 bg-transparent shadow-none transition-all duration-200 active:scale-[0.98] sm:border-2 sm:border-transparent sm:bg-card sm:hover:border-primary/50 sm:hover:shadow-lg"
            onClick={() => router.push("/portal/ai-planner")}
          >
            <CardHeader className="px-0 pt-0 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <div className="bg-primary/10 shrink-0 rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110 sm:p-3">
                  <Sparkles className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl">AI Planner</CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm">
                    Let AI create a personalized workout plan for you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-4 sm:px-6 sm:pb-6">
              <ul className="text-muted-foreground mb-4 space-y-2.5 text-xs sm:mb-6 sm:space-y-3 sm:text-sm">
                <li className="flex items-start gap-2 sm:gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span>Select your fitness goals</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span>Choose experience level and equipment</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span>AI generates your personalized plan</span>
                </li>
              </ul>
              <Button
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-primary-foreground hover:from-blue-600 hover:to-emerald-600 h-12 w-full text-sm font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] sm:h-11 sm:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/portal/ai-planner");
                }}
              >
                Use AI Planner
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

