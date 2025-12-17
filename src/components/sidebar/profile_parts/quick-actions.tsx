"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Target } from "lucide-react";

interface QuickActionsProps {
  activePlanId?: string;
}

export function QuickActions({ activePlanId }: QuickActionsProps) {
  const router = useRouter();

  const handleStartWorkout = () => {
    if (activePlanId) {
      router.push(`/portal/log?quickStart=${activePlanId}`);
    } else {
      router.push("/portal/log");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-2">
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700"
            size="sm"
            onClick={handleStartWorkout}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/portal/log")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/portal/plans")}
            >
              <Target className="h-4 w-4 mr-2" />
              Plans
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
