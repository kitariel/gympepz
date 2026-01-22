"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Dumbbell,
  Repeat,
  Scale,
  Target,
} from "lucide-react";

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
import { useGoalMutations } from "@/hooks/useGoals";
import { ExerciseCombobox } from "@/components/exercise-combobox";

const GOAL_TYPES = [
  {
    value: "strength",
    label: "Strength",
    icon: Dumbbell,
    description: "Lift a target weight",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500",
    requiresExercise: true,
  },
  {
    value: "reps",
    label: "Reps",
    icon: Repeat,
    description: "Hit a rep count",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500",
    requiresExercise: true,
  },
  {
    value: "consistency",
    label: "Consistency",
    icon: Calendar,
    description: "Complete workouts",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500",
    requiresExercise: false,
  },
  {
    value: "bodyweight",
    label: "Bodyweight",
    icon: Scale,
    description: "Reach a target weight",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500",
    requiresExercise: false,
  },
] as const;

const UNITS: Record<string, { value: string; label: string }[]> = {
  strength: [
    { value: "kg", label: "kg" },
    { value: "lbs", label: "lbs" },
  ],
  reps: [{ value: "reps", label: "reps" }],
  consistency: [{ value: "workouts", label: "workouts" }],
  bodyweight: [
    { value: "kg", label: "kg" },
    { value: "lbs", label: "lbs" },
  ],
};

export default function NewGoalPage() {
  const router = useRouter();
  const { create, isCreating, userId } = useGoalMutations();

  const [type, setType] = useState<
    "strength" | "reps" | "consistency" | "bodyweight"
  >("strength");
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);

  const units = UNITS[type] ?? UNITS.strength;
  const defaultUnit = units?.[0]?.value ?? "kg";
  const goalTypeConfig = GOAL_TYPES.find((t) => t.value === type);
  const requiresExercise = goalTypeConfig?.requiresExercise ?? false;

  const handleTypeChange = (newType: typeof type) => {
    setType(newType);
    const typeUnits = UNITS[newType];
    setUnit(typeUnits?.[0]?.value ?? "kg");
    const config = GOAL_TYPES.find((t) => t.value === newType);
    if (!config?.requiresExercise) {
      setExerciseId(null);
      setExerciseName(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const value = Number.parseFloat(targetValue);
    if (Number.isNaN(value) || value <= 0) {
      setError("Enter a valid target value.");
      return;
    }

    if (!userId) {
      setError("Sign in to create goals.");
      return;
    }

    if (requiresExercise && !exerciseId) {
      setError("Please select an exercise for this goal type.");
      return;
    }

    try {
      const goal = await create({
        type,
        targetValue: value,
        unit: unit as "lbs" | "kg" | "reps" | "workouts",
        deadline: deadline ? new Date(deadline) : undefined,
        exerciseId: requiresExercise ? exerciseId ?? undefined : undefined,
      });
      router.push(`/portal/goals/${goal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal.");
    }
  };

  if (!userId) {
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
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 pb-24 md:p-6 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9"
          asChild
        >
          <Link href="/portal/goals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Create Goal</h1>
          <p className="text-muted-foreground text-sm">
            Set a target and track your progress
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Goal Type Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Goal Type
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {GOAL_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value as typeof type)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                    "hover:bg-muted/50",
                    isSelected
                      ? `${t.borderColor} ${t.bgColor}`
                      : "border-border/50 hover:border-border"
                  )}
                >
                  {isSelected && (
                    <div
                      className={cn(
                        "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full",
                        t.bgColor
                      )}
                    >
                      <Check className={cn("h-3 w-3", t.iconColor)} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                      t.bgColor
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

        {/* Exercise Selection (conditional) */}
        {requiresExercise && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Exercise
            </Label>
            <ExerciseCombobox
              value={exerciseId}
              onChange={(id, name) => {
                setExerciseId(id);
                setExerciseName(name);
              }}
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

        {/* Target & Unit */}
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
              onChange={(e) => setTargetValue(e.target.value)}
              className="flex-1 text-lg font-semibold h-12"
            />
            {units.length > 1 ? (
              <Select value={unit} onValueChange={setUnit}>
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

        {/* Deadline */}
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
            onChange={(e) => setDeadline(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isCreating}
            className="flex-1 h-12 text-base font-semibold"
          >
            {isCreating ? "Creating..." : "Create Goal"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12"
            asChild
          >
            <Link href="/portal/goals">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
