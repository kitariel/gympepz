"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GoalTemplateConfirmViewModel } from "./GoalTemplateConfirm.types";

export function GoalTemplateConfirmView({
  templateName,
  targetValue,
  unit,
  suggestedDeadlineDays,
  targetInput,
  currentInput,
  deadlineInput,
  error,
  isSubmitting,
  customGoalHref,
  onTargetChange,
  onCurrentChange,
  onDeadlineChange,
  onBack,
  onSubmit,
}: GoalTemplateConfirmViewModel) {
  const defaultDeadline =
    suggestedDeadlineDays != null
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + suggestedDeadlineDays);
          return d.toISOString().slice(0, 10);
        })()
      : "";

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Start "{templateName}"</h2>
            <p className="text-muted-foreground text-sm">
              Customize your target before you begin.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-target">
              Target {unit === "workouts" ? "Workouts" : unit === "reps" ? "Reps" : "Value"} ({unit})
            </Label>
            <Input
              id="confirm-target"
              type="number"
              min={unit === "lbs" || unit === "kg" ? undefined : 0}
              step={unit === "workouts" || unit === "reps" ? 1 : 0.1}
              placeholder={String(targetValue)}
              value={targetInput}
              onChange={(e) => onTargetChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Suggested: {targetValue} {unit}
            </p>
          </div>

          {(unit === "lbs" || unit === "kg") && (
            <div className="space-y-2">
              <Label htmlFor="confirm-current">Current (optional)</Label>
              <Input
                id="confirm-current"
                type="number"
                step={0.1}
                placeholder="e.g. 185"
                value={currentInput}
                onChange={(e) => onCurrentChange(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm-deadline">Deadline (optional)</Label>
            <Input
              id="confirm-deadline"
              type="date"
              value={deadlineInput || defaultDeadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
            />
            {suggestedDeadlineDays != null && !deadlineInput && (
              <p className="text-xs text-muted-foreground">
                Suggested: {suggestedDeadlineDays} days from now
              </p>
            )}
          </div>

          {error && (
            <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
              {customGoalHref && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={customGoalHref}>Create custom goal</Link>
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Start goal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
