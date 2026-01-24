"use client";

import dynamic from "next/dynamic";

const CustomProgramBuilder = dynamic(
  () => import("@/components/train/CustomProgramBuilder").then((mod) => mod.CustomProgramBuilder),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-4xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading builder...</p>
      </div>
    ),
  }
);

export default function TrainBuildPage() {
  return <CustomProgramBuilder />;
}
