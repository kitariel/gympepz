"use client";

import dynamic from "next/dynamic";

const TemplateList = dynamic(
  () => import("@/components/train/TemplateList").then((mod) => mod.TemplateList),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-4xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading templates...</p>
      </div>
    ),
  }
);

export default function TrainTemplatesPage() {
  return <TemplateList />;
}
