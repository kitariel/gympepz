"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const TrainSummary = dynamic(
  () => import("@/features/train/components/TrainSummary").then((mod) => mod.TrainSummary),
  { suspense: true }
);

export default function TrainSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
          <div className="bg-muted h-32 animate-pulse rounded-xl" />
          <div className="bg-muted h-24 animate-pulse rounded-xl" />
        </div>
      }
    >
      <TrainSummary />
    </Suspense>
  );
}
