import { TemplateDetails } from "@/components/train/TemplateDetails";

export default async function TrainTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  return <TemplateDetails templateId={templateId} />;
}
