"use client";

import dynamic from "next/dynamic";

const ProgramOverview = dynamic(
  () => import("@/components/train/ProgramOverview").then((mod) => mod.ProgramOverview),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading overview...</p>
      </div>
    ),
  }
);

export default function TrainOverviewPage() {
  return <ProgramOverview />;
}
