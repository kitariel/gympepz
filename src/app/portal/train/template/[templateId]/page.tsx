"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const TemplateDetails = dynamic(
  () => import("@/components/train/TemplateDetails").then((mod) => mod.TemplateDetails),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-4xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading template...</p>
      </div>
    ),
  }
);

export default function PortalTrainTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  return <TemplateDetails templateId={templateId} />;
}
