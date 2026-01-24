"use client";

import dynamic from "next/dynamic";

const ActivityList = dynamic(
  () => import("@/features/train/components/ActivityList").then((mod) => mod.ActivityList),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading activity...</p>
      </div>
    ),
  }
);

export default function TrainActivityPage() {
  return <ActivityList />;
}
