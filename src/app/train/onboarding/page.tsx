"use client";

import dynamic from "next/dynamic";

const OnboardingWizard = dynamic(
  () => import("@/components/train/OnboardingWizard").then((mod) => mod.OnboardingWizard),
  {
    loading: () => (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading onboarding...</p>
      </div>
    ),
  }
);

export default function TrainOnboardingPage() {
  return <OnboardingWizard />;
}
