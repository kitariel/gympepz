import dynamic from "next/dynamic";

const PortalTrainPlans = dynamic(
  () => import("@/features/train/components/PortalTrainPlans").then((mod) => mod.PortalTrainPlans),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading plans...</p>
      </div>
    ),
  }
);

export default function PortalTrainPlansPage() {
  return <PortalTrainPlans />;
}
