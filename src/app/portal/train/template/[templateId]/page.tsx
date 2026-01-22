"use client";

import { use } from "react";
import { TemplateDetails } from "@/components/train/TemplateDetails";

export default function PortalTrainTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  return <TemplateDetails templateId={templateId} />;
}
