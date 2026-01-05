/**
 * Progress indicator component for the wizard
 */

import { CheckCircle2 } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function WizardProgress({
  currentStep,
  totalSteps = 4,
}: WizardProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep >= s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStep > s ? <CheckCircle2 className="h-4 w-4" /> : s}
          </div>
          {s < totalSteps && (
            <div
              className={`h-0.5 w-12 ${
                currentStep > s ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

