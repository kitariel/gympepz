"use client";

import { TemplateDetails } from "@/components/train/TemplateDetails";

export default function TrainTemplateDetailPage({
  params,
}: {
  params: { templateId: string };
}) {
  return <TemplateDetails templateId={params.templateId} />;
}

