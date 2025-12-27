"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Circle,
} from "lucide-react";
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
    <Card
      className={cn(
        "ring-border border-0 shadow-sm ring-1 transition-all hover:shadow-md",
        isDone && "ring-primary bg-primary/5",
        allCompleted && !isMarkedDone && "ring-primary bg-primary/5",
      )}
    >
      <CardHeader className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 md:px-5 md:pt-5 md:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
              {onToggleDone && (
                <button
                  onClick={onToggleDone}
                  className="mt-0.5 shrink-0 touch-manipulation"
                  aria-label={
                    isMarkedDone
                      ? "Mark as incomplete"
                      : "Mark exercise as done"
                  }
                >
                  {isMarkedDone ? (
                    <CheckCircle2 className="text-primary h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  ) : (
                    <Circle className="text-muted-foreground hover:text-primary h-5 w-5 transition-colors sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  )}
                </button>
              )}
              <CardTitle
                className={cn(
                  "min-w-0 text-base font-bold tracking-tight break-words sm:text-lg md:text-xl",
                  isMarkedDone && "text-muted-foreground line-through",
                )}
              >
                {exerciseName}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                {allCompleted && !isMarkedDone && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm"
                  >
                    <TrendingUp className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
                    Complete
                  </Badge>
                )}
                {isMarkedDone && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm"
                  >
                    Done
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 md:mt-2 md:gap-3">
              <span className="text-muted-foreground bg-muted/50 rounded-sm px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase sm:text-xs md:text-sm">
                {muscleGroup}
              </span>
              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs md:text-sm">
                • {completedSets}/{totalSets} SETS
              </span>
            </div>
            {lastWorkoutData && (
              <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-[10px] font-medium sm:text-xs md:text-sm">
                <span className="text-muted-foreground/60 text-[9px] tracking-wider uppercase sm:text-[10px]">
                  Last Workout:
                </span>
                <span>
                  {lastWorkoutData.weight}kg × {lastWorkoutData.reps} reps
                </span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 md:gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 touch-manipulation sm:h-8 sm:w-8 md:h-9 md:w-9"
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
              className="text-destructive h-9 w-9 touch-manipulation sm:h-8 sm:w-8 md:h-9 md:w-9"
              onClick={onDeleteExercise}
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2 px-3 pb-3 sm:px-4 sm:pb-4 md:space-y-3 md:px-5 md:pb-5">
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
            className="mt-2 h-9 w-full touch-manipulation text-sm md:mt-3 md:h-10 md:text-base"
            onClick={onAddSet}
          >
            <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Add Set
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
