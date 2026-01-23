"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Play } from "lucide-react";

export function EmptyState() {
  const router = useRouter();

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-full bg-primary/10">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="font-semibold mb-1">No workouts yet</div>
            <div className="text-sm text-muted-foreground mb-4">
              Start your fitness journey today
            </div>
            <Button size="sm" onClick={() => router.push("/portal/train/log")}>
              <Play className="h-4 w-4 mr-2" />
              Start First Workout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
