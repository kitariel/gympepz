"use client";

import { Suspense } from "react";
import { WorkoutLogger } from "@/components/train/WorkoutLogger";

export default function PortalTrainLogPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <WorkoutLogger />
    </Suspense>
  );
}
