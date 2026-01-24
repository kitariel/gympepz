"use client";

import dynamic from "next/dynamic";

const TrainPlans = dynamic(
  () => import("@/features/train/components/TrainPlans").then((mod) => mod.TrainPlans),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading plans...</p>
      </div>
    ),
  }
);

export default function TrainPlansPage() {
  return <TrainPlans />;
}
