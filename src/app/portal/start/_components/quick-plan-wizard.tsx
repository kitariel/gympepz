"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import {
  ArrowRight,
  ArrowLeft,
  Dumbbell,
  CheckCircle2,
  Target,
  X,
  Search,
  Plus,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

type BodyPart = "Push" | "Pull" | "Legs";

interface ExerciseConfig {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
}

interface DayPlan {
  title: string;
  bodyPart: BodyPart;
  exercises: ExerciseConfig[];
}

const BODY_PARTS: BodyPart[] = ["Push", "Pull", "Legs"];

const BODY_PART_DESCRIPTIONS = {
  Push: "Chest, Shoulders, Triceps",
  Pull: "Back, Biceps, Rear Delts",
  Legs: "Quads, Hamstrings, Glutes, Calves",
};

export function QuickPlanWizard({
  userId,
  onComplete,
  onCancel,
}: {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [planName, setPlanName] = useState("My Workout Plan");
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(
    null,
  );
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseConfig, setExerciseConfig] = useState({
    sets: 3,
    reps: 10,
    weight: undefined as number | undefined,
  });
  const [days, setDays] = useState<DayPlan[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const exercisesQuery = api.exercise.list.useQuery({
    q: searchQuery || undefined,
    muscleGroup:
      selectedBodyPart === "Push"
        ? undefined // Will filter manually for Push exercises
        : selectedBodyPart === "Pull"
          ? undefined // Will filter manually
          : selectedBodyPart === "Legs"
            ? undefined
            : undefined,
    take: 100,
  });

  // Filter exercises by body part
  const filteredExercises =
    exercisesQuery.data?.filter((ex) => {
      if (!selectedBodyPart) return true;
      const muscle = ex.muscleGroup.toLowerCase();
      if (selectedBodyPart === "Push") {
        // Push: Chest, Shoulders, Triceps
        return (
          muscle.includes("chest") ||
          muscle.includes("shoulder") ||
          muscle.includes("triceps")
        );
      } else if (selectedBodyPart === "Pull") {
        // Pull: Back, Biceps, Rear Delts
        return (
          muscle.includes("back") ||
          muscle.includes("biceps") ||
          muscle.includes("rear") ||
          muscle === "arms" // Arms category might contain biceps
        );
      } else if (selectedBodyPart === "Legs") {
        // Legs: Quads, Hamstrings, Glutes, Calves
        return (
          muscle.includes("leg") ||
          muscle.includes("quad") ||
          muscle.includes("hamstring") ||
          muscle.includes("glute") ||
          muscle.includes("calf") ||
          muscle.includes("thigh")
        );
      }
      return true;
    }) ?? [];

  const createPlan = api.plan.create.useMutation();
  const setActive = api.plan.setActive.useMutation();

  const handleSelectBodyPart = (bodyPart: BodyPart) => {
    setSelectedBodyPart(bodyPart);
    setStep(2);
  };

  const handleAddExercise = () => {
    if (!selectedExercise || !selectedBodyPart) return;

    const currentDay = days[currentDayIndex];
    if (!currentDay) {
      // Create new day for this body part
      const dayTitle = `${selectedBodyPart} Day`;
      const newDay: DayPlan = {
        title: dayTitle,
        bodyPart: selectedBodyPart,
        exercises: [
          {
            exerciseId: selectedExercise,
            sets: exerciseConfig.sets,
            reps: exerciseConfig.reps,
            weight: exerciseConfig.weight,
          },
        ],
      };
      setDays([newDay]);
    } else {
      // Check if exercise already exists (prevent duplicates)
      if (
        currentDay.exercises.some((ex) => ex.exerciseId === selectedExercise)
      ) {
        setSelectedExercise(null);
        setExerciseConfig({ sets: 3, reps: 10, weight: undefined });
        return;
      }

      // Add to existing day
      const updatedDays = [...days];
      updatedDays[currentDayIndex] = {
        ...currentDay,
        exercises: [
          ...currentDay.exercises,
          {
            exerciseId: selectedExercise,
            sets: exerciseConfig.sets,
            reps: exerciseConfig.reps,
            weight: exerciseConfig.weight,
          },
        ],
      };
      setDays(updatedDays);
    }

    setSelectedExercise(null);
    setExerciseConfig({ sets: 3, reps: 10, weight: undefined });
    setIsExerciseDialogOpen(false);
    setSearchQuery("");
  };

  const handleAddAnotherDay = () => {
    setSelectedBodyPart(null);
    setCurrentDayIndex(days.length);
    setStep(1);
  };

  const handleAutoGenerate5Days = () => {
    // Auto-generate Push/Pull/Legs/Push/Pull rotation
    // If user already has a day with exercises, use that pattern
    const rotation: BodyPart[] = ["Push", "Pull", "Legs", "Push", "Pull"];
    const existingDay = days[0];

    // Create 5 days with the rotation
    const newDays: DayPlan[] = rotation.map((bodyPart, idx) => {
      // If we have an existing day with exercises and it matches the body part, use those exercises
      if (
        existingDay?.bodyPart === bodyPart &&
        existingDay.exercises.length > 0
      ) {
        return {
          title: `Day ${idx + 1} - ${bodyPart}`,
          bodyPart,
          exercises: [...existingDay.exercises], // Copy exercises from user's template
        };
      }
      return {
        title: `Day ${idx + 1} - ${bodyPart}`,
        bodyPart,
        exercises: [],
      };
    });
    setDays(newDays);
    setStep(4); // Show summary
  };

  const handleSavePlan = async (userId: string) => {
    if (!planName.trim() || days.length === 0) return;

    try {
      const plan = await createPlan.mutateAsync({
        userId,
        name: planName,
        days: days.map((day, idx) => ({
          title: day.title,
          order: idx,
          items: day.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          })),
        })),
      });

      // Set as active
      if (userId) {
        await setActive.mutateAsync({ userId, planId: plan.id });
      }

      onComplete();
      // Small delay to ensure plan is set as active before redirect
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      // This catch block is here to prevent unhandled promise rejection
      if (error instanceof Error) {
        // Could show toast notification here in the future
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              } `}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 w-12 ${step > s ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Body Part */}
      {step === 1 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Select Body Part Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Choose which muscle groups you want to train today
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {BODY_PARTS.map((bodyPart) => (
                <Card
                  key={bodyPart}
                  className="hover:border-primary cursor-pointer border-2 transition-all hover:shadow-md"
                  onClick={() => handleSelectBodyPart(bodyPart)}
                >
                  <CardContent className="space-y-2 p-6 text-center">
                    <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                      <Target className="text-primary h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold">{bodyPart}</h3>
                    <p className="text-muted-foreground text-xs">
                      {BODY_PART_DESCRIPTIONS[bodyPart]}
                    </p>
                    <ArrowRight className="text-primary mx-auto mt-2 h-4 w-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Exercises */}
      {step === 2 && selectedBodyPart && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedBodyPart} Day Exercises</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">
                  {BODY_PART_DESCRIPTIONS[selectedBodyPart]}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExerciseDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {days?.[currentDayIndex]?.exercises?.length ? (
              <div className="space-y-2">
                {days?.[currentDayIndex]?.exercises.map((ex, idx) => {
                  const exercise = exercisesQuery.data?.find(
                    (e) => e.id === ex.exerciseId,
                  );
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {exercise?.name ?? "Exercise"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {ex.sets} sets × {ex.reps} reps
                          {ex.weight && ` @ ${ex.weight}kg`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updatedDays = [...days];
                          updatedDays[currentDayIndex]!.exercises =
                            updatedDays?.[currentDayIndex]?.exercises?.filter(
                              (_, i) => i !== idx,
                            ) ?? [];
                          // updatedDays?.[currentDayIndex]?.exercises.filter(
                          //   (_, i) => i !== idx,
                          // );
                          setDays(updatedDays);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <Dumbbell className="mx-auto mb-3 h-12 w-12 opacity-50" />
                <p>No exercises added yet</p>
                <p className="mt-1 text-xs">
                  Click &quot;Add Exercise&quot; to get started
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsExerciseDialogOpen(true)}
                  disabled={!selectedBodyPart}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add More Exercises
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={
                    !days[currentDayIndex] ||
                    days[currentDayIndex].exercises.length === 0
                  }
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add More Days or Finish */}
      {step === 3 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Add More Days?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              You&apos;ve created {days.length} workout day
              {days.length !== 1 ? "s" : ""}. Would you like to add more days or
              auto-generate a full week?
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card
                className="cursor-pointer border-2 transition-all hover:shadow-md"
                onClick={handleAddAnotherDay}
              >
                <CardContent className="space-y-2 p-6 text-center">
                  <Plus className="mx-auto h-8 w-8 text-teal-600" />
                  <h3 className="font-semibold">Add Another Day</h3>
                  <p className="text-muted-foreground text-xs">
                    Manually add more workout days
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border-2 transition-all hover:shadow-md"
                onClick={handleAutoGenerate5Days}
              >
                <CardContent className="space-y-2 p-6 text-center">
                  <Zap className="mx-auto h-8 w-8 text-purple-600" />
                  <h3 className="font-semibold">Auto-Generate 5 Days</h3>
                  <p className="text-muted-foreground text-xs">
                    Create Push/Pull/Legs rotation
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Finish Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Save */}
      {step === 4 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Review Your Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="My Workout Plan"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">
                Workout Days ({days.length}):
              </h4>
              {days.map((day, idx) => (
                <Card key={idx} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{day.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {day.exercises.length} exercise
                        {day.exercises.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {day.exercises.length > 0 ? (
                        day.exercises.map((ex, exIdx) => {
                          const exercise = exercisesQuery.data?.find(
                            (e) => e.id === ex.exerciseId,
                          );
                          return (
                            <div
                              key={exIdx}
                              className="flex items-center justify-between border-b py-1.5 text-sm last:border-0"
                            >
                              <div>
                                <span className="font-medium">
                                  {exercise?.name ?? "Exercise"}
                                </span>
                                {exercise?.muscleGroup && (
                                  <Badge
                                    variant="outline"
                                    className="ml-2 text-[9px]"
                                  >
                                    {exercise.muscleGroup}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-muted-foreground text-xs">
                                {ex.sets}×{ex.reps}
                                {ex.weight && ` @ ${ex.weight}kg`}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-xs italic">
                          No exercises yet - you can add them later
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => handleSavePlan(userId)}
                disabled={!planName.trim() || createPlan.isPending || !userId}
                className="bg-gradient-to-br from-teal-600 to-teal-700"
              >
                {createPlan.isPending ? "Creating..." : "Create Plan & Start"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Selection Dialog */}
      <Dialog
        open={isExerciseDialogOpen}
        onOpenChange={setIsExerciseDialogOpen}
      >
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedExercise ? (
              <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {
                        exercisesQuery.data?.find(
                          (e) => e.id === selectedExercise,
                        )?.name
                      }
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Configure sets, reps, and weight
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedExercise(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={exerciseConfig.sets}
                      onChange={(e) =>
                        setExerciseConfig((prev) => ({
                          ...prev,
                          sets: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={exerciseConfig.reps}
                      onChange={(e) =>
                        setExerciseConfig((prev) => ({
                          ...prev,
                          reps: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Optional"
                      value={exerciseConfig.weight ?? ""}
                      onChange={(e) =>
                        setExerciseConfig((prev) => ({
                          ...prev,
                          weight:
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value) || undefined,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedExercise(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddExercise}
                    disabled={
                      exerciseConfig.sets < 1 || exerciseConfig.reps < 1
                    }
                  >
                    Add Exercise
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {filteredExercises.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    <Dumbbell className="mx-auto mb-3 h-12 w-12 opacity-50" />
                    <p>No exercises found</p>
                    <p className="mt-1 text-xs">
                      Try adjusting your search or select a different body part
                    </p>
                  </div>
                ) : (
                  <div className="grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3">
                    {filteredExercises.map((ex) => (
                      <Card
                        key={ex.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => setSelectedExercise(ex.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <Dumbbell className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {ex.name}
                              </p>
                              <Badge
                                variant="outline"
                                className="mt-1 text-[9px]"
                              >
                                {ex.muscleGroup}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
