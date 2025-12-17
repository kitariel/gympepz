"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronUp, Trash2, TrendingUp } from "lucide-react";
import { SetRow } from "./set-row";
import { cn } from "@/lib/utils";

interface WorkoutSet {
  id: string;
  setNumber: number;
  targetReps?: number;
  targetWeight?: number;
  actualReps: number;
  actualWeight?: number;
  rpe?: number;
  completed: boolean;
}

interface ExerciseCardProps {
  exerciseName: string;
  muscleGroup: string;
  sets: WorkoutSet[];
  lastWorkoutData?: {
    weight: number;
    reps: number;
    date: Date;
  };
  onUpdateSet: (setId: string, data: Partial<WorkoutSet>) => void;
  onCompleteSet: (setId: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onDeleteExercise: () => void;
  onStartRestTimer?: () => void;
}

export function ExerciseCard({
  exerciseName,
  muscleGroup,
  sets,
  lastWorkoutData,
  onUpdateSet,
  onCompleteSet,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
  onStartRestTimer,
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedSets = sets.filter((s) => s.completed).length;
  const totalSets = sets.length;
  const allCompleted = completedSets === totalSets && totalSets > 0;

  return (
    <Card className={cn(allCompleted && "border-green-500 bg-green-50/50 dark:bg-green-950/20")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{exerciseName}</CardTitle>
              {allCompleted && (
                <Badge variant="success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{muscleGroup}</span>
              <span className="text-xs text-muted-foreground">
                • {completedSets}/{totalSets} sets
              </span>
            </div>
            {lastWorkoutData && (
              <div className="text-xs text-muted-foreground mt-1">
                Last: {lastWorkoutData.weight}kg × {lastWorkoutData.reps} reps
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onDeleteExercise}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2">
          {sets.map((set) => (
            <SetRow
              key={set.id}
              setNumber={set.setNumber}
              targetReps={set.targetReps}
              targetWeight={set.targetWeight}
              actualReps={set.actualReps}
              actualWeight={set.actualWeight}
              rpe={set.rpe}
              completed={set.completed}
              onUpdate={(data) => onUpdateSet(set.id, data)}
              onComplete={() => {
                onCompleteSet(set.id);
                onStartRestTimer?.();
              }}
              onDelete={() => onDeleteSet(set.id)}
            />
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={onAddSet}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Set
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
