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
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-bold">Quick Plan Builder</h1>
          <p className="text-muted-foreground text-sm">
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
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold">Start Working Out</h1>
        <p className="text-muted-foreground">
          Create a workout plan to get started
        </p>
      </div>

      {!showPlanChoices ? (
        <Card className="border-2 border-dashed">
          <CardContent className="space-y-6 px-6 pt-16 pb-16 text-center">
            <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
              <Target className="text-primary h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No Workout Plan Found</h2>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">
                Create a workout plan to get started. Choose how you&apos;d like
                to build your plan.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowPlanChoices(true)}
              className="bg-primary hover:bg-primary/90 h-12 text-base"
            >
              Create Workout Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            className="hover:border-primary/50 group cursor-pointer border-2 border-transparent transition-all duration-200 hover:shadow-lg"
            onClick={() => setShowQuickWizard(true)}
          >
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-3 transition-transform duration-200 group-hover:scale-110">
                  <Dumbbell className="text-primary h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Manual Builder</CardTitle>
                  <CardDescription className="mt-1">
                    Build your workout plan step by step
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ul className="text-muted-foreground mb-6 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>Select day and body part (Push/Pull/Legs)</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>Choose exercises from the library</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>Set sets, reps, and weight</span>
                </li>
              </ul>
              <Button
                className="h-11 w-full text-base font-semibold"
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

          <Card
            className="hover:border-primary/50 group cursor-pointer border-2 border-transparent transition-all duration-200 hover:shadow-lg"
            onClick={() => router.push("/portal/ai-planner")}
          >
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-3 transition-transform duration-200 group-hover:scale-110">
                  <Sparkles className="text-primary h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Planner</CardTitle>
                  <CardDescription className="mt-1">
                    Let AI create a personalized workout plan for you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <ul className="text-muted-foreground mb-6 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>Select your fitness goals</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>Choose experience level and equipment</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>AI generates your personalized plan</span>
                </li>
              </ul>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full text-base font-semibold"
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

