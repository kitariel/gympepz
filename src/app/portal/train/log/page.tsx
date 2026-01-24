"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const WorkoutLogger = dynamic(
  () => import("@/components/train/WorkoutLogger").then((mod) => mod.WorkoutLogger),
  { suspense: true }
);

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
