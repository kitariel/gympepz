"use client";

import Link from "next/link";
import { ArrowLeft, Check, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ExerciseCombobox } from "@/components/exercise-combobox";
import type { GoalCreateViewModel } from "./GoalCreate.types";

// View: renders the goal creation form UI from a view model.
export function GoalCreateView({
  isAuthenticated,
  isCreating,
  type,
  exerciseId,
  exerciseName,
  targetValue,
  unit,
  deadline,
  error,
  goalTypes,
  units,
  requiresExercise,
  paths,
  onTypeChange,
  onExerciseChange,
  onTargetChange,
  onUnitChange,
  onDeadlineChange,
  onSubmit,
}: GoalCreateViewModel) {
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg p-4 md:p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Target className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Sign in required</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Create an account to set and track your goals.
              </p>
            </div>
            <Button asChild>
              <Link href={paths.login}>Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pb-24 md:p-6 md:pb-8">
      <div className="flex flex-col gap-3">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href={paths.backToGoals}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Goals
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Create Goal</h1>
          <p className="text-muted-foreground text-sm">
            Set a target and track your progress
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Goal Type
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {goalTypes.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onTypeChange(t.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                    "hover:bg-muted/50",
                    isSelected
                      ? `${t.borderColor} ${t.bgColor}`
                      : "border-border/50 hover:border-border",
                  )}
                >
                  {isSelected && (
                    <div
                      className={cn(
                        "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full",
                        t.bgColor,
                      )}
                    >
                      <Check className={cn("h-3 w-3", t.iconColor)} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                      t.bgColor,
                    )}
                  >
                    <Icon className={cn("h-5 w-5", t.iconColor)} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {requiresExercise && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Exercise
            </Label>
            <ExerciseCombobox
              value={exerciseId}
              onChange={onExerciseChange}
              placeholder="Select an exercise..."
            />
            {exerciseName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-500" />
                {exerciseName}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Target
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              step={type === "bodyweight" || type === "strength" ? 0.1 : 1}
              placeholder={
                type === "strength"
                  ? "e.g. 100"
                  : type === "reps"
                    ? "e.g. 20"
                    : type === "consistency"
                      ? "e.g. 12"
                      : "e.g. 75"
              }
              value={targetValue}
              onChange={(e) => onTargetChange(e.target.value)}
              className="flex-1 text-lg font-semibold h-12"
            />
            {units.length > 1 ? (
              <Select value={unit} onValueChange={onUnitChange}>
                <SelectTrigger className="w-24 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-12 w-24 items-center justify-center rounded-md border bg-muted/50 text-sm font-medium text-muted-foreground">
                {units[0]?.label}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Deadline{" "}
            <span className="font-normal normal-case text-muted-foreground/70">
              (optional)
            </span>
          </Label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className="h-12"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isCreating}
            className="flex-1 h-12 text-base font-semibold"
          >
            {isCreating ? "Creating..." : "Create Goal"}
          </Button>
          <Button type="button" variant="outline" className="h-12" asChild>
            <Link href={paths.cancel}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
