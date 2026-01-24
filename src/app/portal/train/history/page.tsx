"use client";

import dynamic from "next/dynamic";

const HistoryList = dynamic(
  () => import("@/components/train/HistoryList").then((mod) => mod.HistoryList),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading history...</p>
      </div>
    ),
  }
);

export default function PortalTrainHistoryPage() {
  return <HistoryList />;
}
