"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Repeat, Calendar, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoalMutations } from "@/hooks/useGoals";
import { ExerciseCombobox } from "@/components/exercise-combobox";

const GOAL_TYPES = [
  {
    value: "strength",
    label: "Strength",
    icon: Dumbbell,
    description: "Lift a target weight for an exercise",
    requiresExercise: true,
  },
  {
    value: "reps",
    label: "Reps",
    icon: Repeat,
    description: "Complete a target number of reps",
    requiresExercise: true,
  },
  {
    value: "consistency",
    label: "Consistency",
    icon: Calendar,
    description: "Complete a target number of workouts",
    requiresExercise: false,
  },
  {
    value: "bodyweight",
    label: "Bodyweight",
    icon: Scale,
    description: "Reach a target bodyweight",
    requiresExercise: false,
  },
] as const;

const UNITS: Record<string, { value: string; label: string }[]> = {
  strength: [
    { value: "lbs", label: "lbs" },
    { value: "kg", label: "kg" },
  ],
  reps: [{ value: "reps", label: "reps" }],
  consistency: [{ value: "workouts", label: "workouts" }],
  bodyweight: [
    { value: "lbs", label: "lbs" },
    { value: "kg", label: "kg" },
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
      setError(
        err instanceof Error ? err.message : "Failed to create goal.",
      );
    }
  };

  if (!userId) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to create goals.
            </p>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">New Goal</h1>
        <p className="text-muted-foreground mt-1">
          Set a target and track your progress.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Goal type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v as typeof type);
                  setUnit(defaultUnit);
                  // Clear exercise when switching to a type that doesn't require it
                  const newType = GOAL_TYPES.find((t) => t.value === v);
                  if (!newType?.requiresExercise) {
                    setExerciseId(null);
                    setExerciseName(null);
                  }
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {goalTypeConfig && (
                <p className="text-xs text-muted-foreground">
                  {goalTypeConfig.description}
                </p>
              )}
            </div>

            {requiresExercise && (
              <div className="space-y-2">
                <Label>Exercise</Label>
                <ExerciseCombobox
                  value={exerciseId}
                  onChange={(id, name) => {
                    setExerciseId(id);
                    setExerciseName(name);
                  }}
                  placeholder="Select an exercise..."
                />
                {exerciseName && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {exerciseName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="target">
                Target {type === "consistency" ? "workouts" : type === "reps" ? "reps" : "value"}
              </Label>
              <Input
                id="target"
                type="number"
                min={0}
                step={type === "bodyweight" || type === "strength" ? 0.1 : 1}
                placeholder={
                  type === "strength"
                    ? "e.g. 135"
                    : type === "reps"
                      ? "e.g. 20"
                      : type === "consistency"
                        ? "e.g. 12"
                        : "e.g. 175"
                }
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(units ?? []).map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isCreating} className="flex-1">
                {isCreating ? "Creating…" : "Create goal"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/portal/goals">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
