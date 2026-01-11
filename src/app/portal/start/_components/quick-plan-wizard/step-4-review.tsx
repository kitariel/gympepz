/**
 * Step 4: Review & Save
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { DayPlan } from "../../_types";
import type { Exercise } from "../../_types/exercise";

interface Step4ReviewProps {
  planName: string;
  onPlanNameChange: (name: string) => void;
  days: DayPlan[];
  exercises: Exercise[];
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export function Step4Review({
  planName,
  onPlanNameChange,
  days,
  exercises,
  onBack,
  onSave,
  isSaving,
  canSave,
}: Step4ReviewProps) {
  return (
    <Card className="border-0 py-4 shadow-sm">
      <CardHeader>
        <CardTitle>Review Your Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Plan Name</Label>
          <Input
            value={planName}
            onChange={(e) => onPlanNameChange(e.target.value)}
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
                      const exercise = exercises.find(
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
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onSave}
            disabled={!canSave || isSaving}
            className="bg-gradient-to-br from-teal-600 to-teal-700"
          >
            {isSaving ? "Creating..." : "Create Plan & Start"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
