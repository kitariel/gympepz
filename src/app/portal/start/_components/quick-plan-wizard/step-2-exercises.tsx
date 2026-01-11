/**
 * Step 2: Exercise Selection
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, X, Dumbbell } from "lucide-react";
import type { BodyPart, DayPlan, ExerciseConfig } from "../../_types";
import type { Exercise } from "../../_types/exercise";

interface Step2ExercisesProps {
  bodyPart: BodyPart;
  currentDay: DayPlan | undefined;
  exercises: Exercise[];
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  onBack: () => void;
  onContinue: () => void;
  onOpenExerciseDialog: () => void;
  canContinue: boolean;
}

export function Step2Exercises({
  bodyPart,
  currentDay,
  exercises,
  onAddExercise,
  onRemoveExercise,
  onBack,
  onContinue,
  onOpenExerciseDialog,
  canContinue,
}: Step2ExercisesProps) {
  return (
    <Card className="border-0 py-4 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{bodyPart} Day Exercises</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {bodyPart === "Push"
                ? "Chest, Shoulders, Triceps"
                : bodyPart === "Pull"
                  ? "Back, Biceps, Rear Delts"
                  : "Quads, Hamstrings, Glutes, Calves"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenExerciseDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Exercise
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentDay?.exercises?.length ? (
          <div className="space-y-2">
            {currentDay.exercises.map((ex, idx) => {
              const exercise = exercises.find((e) => e.id === ex.exerciseId);
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
                    onClick={() => onRemoveExercise(idx)}
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
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onOpenExerciseDialog}
              disabled={!bodyPart}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add More Exercises
            </Button>
            <Button onClick={onContinue} disabled={!canContinue}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
