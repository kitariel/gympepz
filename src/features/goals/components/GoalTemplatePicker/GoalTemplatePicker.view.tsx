"use client";

import Link from "next/link";
import { Dumbbell, Flame, Target, Scale } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoalTemplateCard } from "@/features/goals/components/GoalTemplateCard";
import { GoalTemplateConfirm } from "@/features/goals/components/GoalTemplateConfirm";
import type { GoalTemplate } from "@/lib/goal-templates";
import type { GoalTemplatePickerViewModel } from "./GoalTemplatePicker.types";

const CATEGORY_ICONS = {
  strength: Dumbbell,
  reps: Flame,
  consistency: Target,
  bodyweight: Scale,
} as const;

type PickerViewProps = GoalTemplatePickerViewModel & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GoalTemplatePickerView({
  open,
  onOpenChange,
  step,
  selectedTemplate,
  categories,
  onSelectTemplate,
  onCustomGoal,
  onConfirmBack,
  onConfirmSuccess,
}: PickerViewProps) {
  const isConfirm = step === "confirm" && selectedTemplate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isConfirm ? selectedTemplate.name : "Choose a Goal"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          {isConfirm ? (
            <GoalTemplateConfirm
              template={selectedTemplate}
              onBack={onConfirmBack}
              onSuccess={onConfirmSuccess}
            />
          ) : (
            <>
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id as keyof typeof CATEGORY_ICONS];
                return (
                  <section key={cat.id}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      {Icon && <Icon className="h-4 w-4" />}
                      {cat.label}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {cat.templates.map((t) => (
                        <GoalTemplateCard
                          key={t.id}
                          template={t}
                          onSelect={(template: GoalTemplate) => {
                            onSelectTemplate(template);
                          }}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
              <div className="border-t pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/portal/goals/new" onClick={onCustomGoal}>
                    Create Custom Goal →
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
