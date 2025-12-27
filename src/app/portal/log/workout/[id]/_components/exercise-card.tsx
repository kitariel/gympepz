"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronUp, Trash2, TrendingUp, CheckCircle2, Circle } from "lucide-react";
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
  isMarkedDone?: boolean;
  onToggleDone?: () => void;
  exerciseId?: string;
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
  isMarkedDone = false,
  onToggleDone,
  exerciseId,
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedSets = sets.filter((s) => s.completed).length;
  const totalSets = sets.length;
  const allCompleted = completedSets === totalSets && totalSets > 0;
  const isDone = isMarkedDone || allCompleted;

  return (
    <Card className={cn(
      isDone && "border-primary bg-primary/5",
      allCompleted && !isMarkedDone && "border-primary bg-primary/5"
    )}>
      <CardHeader className="pb-3 sm:pb-4 md:pb-4 px-3 sm:px-4 md:px-5 pt-3 sm:pt-4 md:pt-5">
        <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-2.5 flex-wrap">
              {onToggleDone && (
                <button
                  onClick={onToggleDone}
                  className="shrink-0 mt-0.5 touch-manipulation"
                  aria-label={isMarkedDone ? "Mark as incomplete" : "Mark exercise as done"}
                >
                  {isMarkedDone ? (
                    <CheckCircle2 className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
              )}
              <CardTitle className={cn(
                "text-sm sm:text-base md:text-lg min-w-0 break-words",
                isMarkedDone && "line-through text-muted-foreground"
              )}>
                {exerciseName}
              </CardTitle>
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                {allCompleted && !isMarkedDone && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs md:text-sm bg-primary/10 text-primary border-primary/20">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 mr-1" />
                    Complete
                  </Badge>
                )}
                {isMarkedDone && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs md:text-sm">
                    Done
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2 flex-wrap">
              <span className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">{muscleGroup}</span>
              <span className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">
                • {completedSets}/{totalSets} sets
              </span>
            </div>
            {lastWorkoutData && (
              <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-1 md:mt-1.5">
                Last: {lastWorkoutData.weight}kg × {lastWorkoutData.reps} reps
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-8 sm:w-8 md:h-9 md:w-9 touch-manipulation"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-8 sm:w-8 md:h-9 md:w-9 text-destructive touch-manipulation"
              onClick={onDeleteExercise}
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2 md:space-y-3 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
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
            className="w-full mt-2 md:mt-3 text-sm md:text-base touch-manipulation h-9 md:h-10"
            onClick={onAddSet}
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Add Set
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
