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
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null);
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
  const filteredExercises = exercisesQuery.data?.filter((ex) => {
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
      if (existingDay && existingDay.bodyPart === bodyPart && existingDay.exercises.length > 0) {
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
      console.error("Failed to create plan:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  step >= s
                    ? "bg-teal-600 text-white"
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 h-0.5 ${
                  step > s ? "bg-teal-600" : "bg-muted"
                }`}
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
            <p className="text-sm text-muted-foreground">
              Choose which muscle groups you want to train today
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BODY_PARTS.map((bodyPart) => (
                <Card
                  key={bodyPart}
                  className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-teal-500"
                  onClick={() => handleSelectBodyPart(bodyPart)}
                >
                  <CardContent className="p-6 text-center space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                      <Target className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="font-semibold text-lg">{bodyPart}</h3>
                    <p className="text-xs text-muted-foreground">
                      {BODY_PART_DESCRIPTIONS[bodyPart]}
                    </p>
                    <ArrowRight className="h-4 w-4 mx-auto mt-2 text-teal-600" />
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
                <p className="text-sm text-muted-foreground mt-1">
                  {BODY_PART_DESCRIPTIONS[selectedBodyPart]}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExerciseDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {days[currentDayIndex]?.exercises.length > 0 ? (
              <div className="space-y-2">
                {days[currentDayIndex].exercises.map((ex, idx) => {
                  const exercise = exercisesQuery.data?.find(
                    (e) => e.id === ex.exerciseId
                  );
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{exercise?.name ?? "Exercise"}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.sets} sets × {ex.reps} reps
                          {ex.weight && ` @ ${ex.weight}kg`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updatedDays = [...days];
                          updatedDays[currentDayIndex].exercises =
                            updatedDays[currentDayIndex].exercises.filter(
                              (_, i) => i !== idx
                            );
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
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No exercises added yet</p>
                <p className="text-xs mt-1">
                  Click "Add Exercise" to get started
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsExerciseDialogOpen(true)}
                  disabled={!selectedBodyPart}
                >
                  <Plus className="h-4 w-4 mr-2" />
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
                  <ArrowRight className="h-4 w-4 ml-2" />
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
            <p className="text-sm text-muted-foreground">
              You've created {days.length} workout day{days.length !== 1 ? "s" : ""}.
              Would you like to add more days or auto-generate a full week?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-all border-2"
                onClick={handleAddAnotherDay}
              >
                <CardContent className="p-6 text-center space-y-2">
                  <Plus className="h-8 w-8 mx-auto text-teal-600" />
                  <h3 className="font-semibold">Add Another Day</h3>
                  <p className="text-xs text-muted-foreground">
                    Manually add more workout days
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-all border-2"
                onClick={handleAutoGenerate5Days}
              >
                <CardContent className="p-6 text-center space-y-2">
                  <Zap className="h-8 w-8 mx-auto text-purple-600" />
                  <h3 className="font-semibold">Auto-Generate 5 Days</h3>
                  <p className="text-xs text-muted-foreground">
                    Create Push/Pull/Legs rotation
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setStep(4)}>
                Finish Setup
                <ArrowRight className="h-4 w-4 ml-2" />
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
              <h4 className="font-semibold text-sm">
                Workout Days ({days.length}):
              </h4>
              {days.map((day, idx) => (
                <Card key={idx} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{day.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {day.exercises.length} exercise{day.exercises.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {day.exercises.length > 0 ? (
                        day.exercises.map((ex, exIdx) => {
                          const exercise = exercisesQuery.data?.find(
                            (e) => e.id === ex.exerciseId
                          );
                          return (
                            <div
                              key={exIdx}
                              className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                            >
                              <div>
                                <span className="font-medium">
                                  {exercise?.name ?? "Exercise"}
                                </span>
                                {exercise?.muscleGroup && (
                                  <Badge variant="outline" className="text-[9px] ml-2">
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
                        <p className="text-xs text-muted-foreground italic">
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
                <ArrowLeft className="h-4 w-4 mr-2" />
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
      <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedExercise ? (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {
                        exercisesQuery.data?.find((e) => e.id === selectedExercise)
                          ?.name
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                  <div className="text-center py-8 text-muted-foreground">
                    <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No exercises found</p>
                    <p className="text-xs mt-1">
                      Try adjusting your search or select a different body part
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                    {filteredExercises.map((ex) => (
                      <Card
                        key={ex.id}
                        className="cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setSelectedExercise(ex.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <Dumbbell className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {ex.name}
                              </p>
                              <Badge variant="outline" className="text-[9px] mt-1">
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
