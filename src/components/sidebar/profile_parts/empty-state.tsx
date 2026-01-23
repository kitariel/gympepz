"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dumbbell, Play } from "lucide-react";

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/10 p-6">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-2xl bg-primary text-primary-foreground shadow-md">
          <Dumbbell className="h-8 w-8" />
        </div>

        <div>
          <div className="font-bold text-lg text-foreground mb-1">
            Ready to Start?
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Begin your fitness journey and track your progress
          </p>

          <Button onClick={() => router.push("/portal/train/log")}>
            <Play className="h-4 w-4 mr-2 fill-current" />
            Start First Workout
          </Button>
        </div>
      </div>
    </div>
  );
}
