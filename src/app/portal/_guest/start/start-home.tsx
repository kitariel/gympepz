"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GuestStartHome({
  canResume,
  onCreate,
  onSample,
  onResume,
}: {
  canResume: boolean;
  onCreate: () => void;
  onSample: () => void;
  onResume: () => void;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-base">Start a workout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <p className="text-sm text-muted-foreground">
          Create a workout the way you’d write it in Notes—then review the overview before you start logging.
        </p>

        <div className="grid gap-2">
          <Button className="h-11" onClick={onCreate}>
            Create workout
          </Button>
          <Button className="h-11" variant="outline" onClick={onSample}>
            Use a sample plan
          </Button>
          <Button
            className="h-11"
            variant="secondary"
            onClick={onResume}
            disabled={!canResume}
          >
            Resume workout
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          “Resume workout” appears when you have an active draft saved locally.
        </p>
      </CardContent>
    </Card>
  );
}

