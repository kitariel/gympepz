"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{templateName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <p className="text-sm text-destructive">{error}</p>
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
              {isSubmitting ? "Creating…" : "Start This Goal"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
