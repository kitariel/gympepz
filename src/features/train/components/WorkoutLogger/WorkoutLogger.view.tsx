"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
  Play,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SwipeableSetRow } from "../SwipeableSetRow";
import type {
  WorkoutLoggerViewProps,
  WorkoutLoggerExerciseVM,
} from "./WorkoutLogger.types";
import type { RestTimerState } from "@/lib/storage/workoutRepo";

type FinishDialogState = "closed" | "no-progress" | "partial" | "complete";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function RestTimerCompact({
  restTimer,
  onStartRestTimer,
  onStopRestTimer,
}: {
  restTimer: RestTimerState;
  onStartRestTimer: (durationMs: number) => void;
  onStopRestTimer: () => void;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (restTimer.status !== "running") return;

    const updateRemaining = () => {
      const elapsed = Date.now() - restTimer.startedAt;
      const remaining = Math.max(
        0,
        Math.ceil((restTimer.durationMs - elapsed) / 1000),
      );
      setRemainingSeconds(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 100);
    return () => clearInterval(interval);
  }, [restTimer]);

  if (restTimer.status === "running") {
    const isFinished = remainingSeconds === 0;
    return (
      <Button
        variant={isFinished ? "default" : "secondary"}
        size="sm"
        onClick={onStopRestTimer}
        className={cn(
          "gap-2 tabular-nums",
          isFinished && "animate-pulse bg-emerald-500 hover:bg-emerald-600",
        )}
      >
        <Clock className="h-4 w-4" />
        {isFinished ? "Done!" : formatTime(remainingSeconds)}
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      {[60, 90, 120].map((secs) => (
        <Button
          key={secs}
          variant="ghost"
          size="sm"
          onClick={() => onStartRestTimer(secs * 1000)}
          className="h-9 px-2 text-xs"
        >
          {secs}s
        </Button>
      ))}
    </div>
  );
}

function ExerciseNavigator({
  exercises,
  currentIndex,
  onNavigate,
}: {
  exercises: WorkoutLoggerExerciseVM[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}) {
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < exercises.length - 1;

  return (
    <div className="flex items-center justify-between py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={!canGoPrev}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Prev</span>
      </Button>

      <div className="flex items-center gap-1.5">
        {exercises.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={cn(
              "h-2 rounded-full transition-all",
              idx === currentIndex
                ? "bg-primary w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2",
            )}
            aria-label={`Go to exercise ${idx + 1}`}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={!canGoNext}
        className="gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SingleExerciseView({
  exercise,
  onUpdateSet,
  onAddSet,
  onCopyPrevious,
  onCopyLastSet,
  showNextWorkout,
  onNextWorkout,
}: {
  exercise: WorkoutLoggerExerciseVM;
  onUpdateSet: (
    setId: string,
    patch: {
      actualReps?: string;
      actualWeight?: string | null;
      completed?: boolean;
    },
  ) => void;
  onAddSet: (exerciseId: string) => void;
  onCopyPrevious: (exerciseId: string, setId: string) => void;
  onCopyLastSet: (exerciseId: string, setId: string) => void;
  showNextWorkout?: boolean;
  onNextWorkout?: () => void;
}) {
  const completedSets = exercise.setRows.filter((s) => s.completed).length;
  const totalSets = exercise.setRows.length;
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const content = (
    <div className="space-y-5">
      {/* Exercise header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold">{exercise.name}</h2>
            {exercise.targetText ? (
              <p className="text-muted-foreground mt-1 text-sm">
                {exercise.targetText}
              </p>
            ) : null}
            {exercise.goalHint || exercise.goalUpdate ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {exercise.goalHint ? (
                  <Badge variant="outline" className="text-[10px]">
                    {exercise.goalHint}
                  </Badge>
                ) : null}
                {exercise.goalUpdate ? (
                  <Badge variant="secondary" className="text-[10px]">
                    Goal updated: {exercise.goalUpdate.label}
                    {exercise.goalUpdate.extraCount > 0
                      ? ` +${exercise.goalUpdate.extraCount}`
                      : ""}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {completedSets}/{totalSets}
          </Badge>
        </div>

        {/* Mini progress bar */}
        <Progress value={progress} className="h-1.5" />

        {/* Previous performance hint */}
        {exercise.previousPerformance ? (
          <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2">
            <div className="text-muted-foreground text-xs">
              <span className="font-medium">Previous:</span>{" "}
              {exercise.previousPerformance.weight
                ? `${exercise.previousPerformance.weight} x ${exercise.previousPerformance.reps}`
                : exercise.previousPerformance.reps}{" "}
              ({exercise.previousPerformance.relativeDate})
            </div>
            {!exercise.previousPerformance.isSameProgram ? (
              <Badge variant="outline" className="text-[10px]">
                {exercise.previousPerformance.programName}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Set rows */}
      <div className="space-y-3">
        {exercise.setRows.map((set, setIndex) => (
          <div key={set.id} className="space-y-1">
            <SwipeableSetRow
              id={set.id}
              setNumber={set.setNumber}
              repsValue={set.repsValue}
              repsPlaceholder={set.repsPlaceholder}
              weightValue={set.weightValue}
              weightPlaceholder={set.weightPlaceholder}
              completed={set.completed}
              onUpdateReps={(value) =>
                onUpdateSet(set.id, { actualReps: value })
              }
              onUpdateWeight={(value) =>
                onUpdateSet(set.id, { actualWeight: value })
              }
              onToggleComplete={(completed) => {
                if (set.completed) return;
                if (completed) onUpdateSet(set.id, { completed: true });
              }}
              onSwipeComplete={() => onUpdateSet(set.id, { completed: true })}
            />

            {/* Quick copy buttons */}
            {!set.completed && (
              <div className="flex justify-center gap-2">
                {exercise.previousPerformance && setIndex === 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 text-[10px]"
                    onClick={() => onCopyPrevious(exercise.id, set.id)}
                  >
                    Copy previous
                  </Button>
                ) : null}
                {set.canCopyLastSet && setIndex !== 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-7 text-[10px]"
                    onClick={() => onCopyLastSet(exercise.id, set.id)}
                  >
                    Copy set {set.setNumber - 1}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {showNextWorkout ? (
        <Button
          variant="default"
          className="touch-target h-12 w-full bg-emerald-500 hover:bg-emerald-600"
          onClick={onNextWorkout}
        >
          Next workout
        </Button>
      ) : null}

      {/* Add set button */}
      <Button
        variant="outline"
        className="touch-target h-12 w-full"
        onClick={() => onAddSet(exercise.id)}
      >
        {exercise.canAddExtraSet ? "+ Add extra set" : "+ Add set"}
      </Button>
    </div>
  );

  return (
    <div className="animate-scale-in">
      {/* Mobile: no card wrapper, just content */}
      <div className="md:hidden">{content}</div>

      {/* Desktop: with card wrapper */}
      <Card elevation="hero" className="hidden md:flex">
        <CardContent className="p-5">{content}</CardContent>
      </Card>
    </div>
  );
}

function FloatingActionBar({
  restTimer,
  onStartRestTimer,
  onStopRestTimer,
  onSaveExit,
  onFinish,
  finishDisabled,
}: {
  restTimer: RestTimerState;
  onStartRestTimer: (durationMs: number) => void;
  onStopRestTimer: () => void;
  onSaveExit: () => void;
  onFinish: () => void;
  finishDisabled: boolean;
}) {
  return (
    <div className="border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/80 rounded-lg border px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <RestTimerCompact
          restTimer={restTimer}
          onStartRestTimer={onStartRestTimer}
          onStopRestTimer={onStopRestTimer}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveExit}
            className="h-9"
          >
            <Pause className="mr-1.5 h-4 w-4" />
            Save
          </Button>
          <Button
            size="sm"
            onClick={onFinish}
            disabled={finishDisabled}
            className="h-9 bg-emerald-500 hover:bg-emerald-600"
          >
            <Play className="mr-1.5 h-4 w-4" />
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
}

function FinishConfirmationDialog({
  state,
  setsDone,
  setsTotal,
  onClose,
  onFinish,
  onDiscard,
}: {
  state: FinishDialogState;
  setsDone: number;
  setsTotal: number;
  onClose: () => void;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const progressPercent =
    setsTotal > 0 ? Math.round((setsDone / setsTotal) * 100) : 0;

  if (state === "no-progress") {
    return (
      <AlertDialog open onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-center">
              No sets completed
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You haven&apos;t logged any sets yet. Do you want to discard this
              workout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={onClose} className="mt-0">
              Keep logging
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Discard workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (state === "partial") {
    return (
      <AlertDialog open onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-center">
              Finish early?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-center">
                <p>
                  You&apos;ve completed {setsDone} of {setsTotal} sets (
                  {progressPercent}%).
                </p>
                <div className="mx-auto max-w-[200px]">
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <p className="text-muted-foreground text-xs">
                  Your progress will be saved to history.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={onClose} className="mt-0">
              Keep going
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onFinish}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finish anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (state === "complete") {
    return (
      <AlertDialog open onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <AlertDialogTitle className="text-center">
              Great work!
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-center">
                <p>You&lsquo;ve completed all {setsTotal} sets!</p>
                <div className="mx-auto max-w-[200px]">
                  <Progress value={100} className="h-2" />
                </div>
                <p className="text-muted-foreground text-xs">
                  Ready to finish and save your workout?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={onClose} className="mt-0">
              Add more sets
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onFinish}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Finish workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}

export function WorkoutLoggerView(props: WorkoutLoggerViewProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [finishDialogState, setFinishDialogState] =
    useState<FinishDialogState>("closed");
  const [workoutListOpen, setWorkoutListOpen] = useState(true);
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal") ?? false;

  // Container width classes: portal uses full width, train uses max-w-3xl
  const containerClasses = isPortal
    ? "w-full"
    : "mx-auto w-full max-w-3xl";

  // Reset index when exercises change
  useEffect(() => {
    if (props.kind === "logging") {
      setCurrentExerciseIndex((prev) =>
        prev >= props.exercises.length
          ? Math.max(0, props.exercises.length - 1)
          : prev,
      );
    }
  }, [props]);

  // Handle finish button click - determine which dialog to show
  const handleFinishClick = () => {
    if (props.kind !== "logging") return;

    const { setsDone, setsTotal } = props;

    if (setsDone === 0) {
      setFinishDialogState("no-progress");
    } else if (setsDone < setsTotal) {
      setFinishDialogState("partial");
    } else {
      setFinishDialogState("complete");
    }
  };

  if (props.kind === "loading") {
    return (
      <div className={cn(containerClasses, "space-y-4 p-6 pt-4")}>
        <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-64 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (props.kind === "error") {
    return (
      <div className={cn(containerClasses, "space-y-6 p-6 pt-4")}>
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{props.title}</h1>
            <p className="text-muted-foreground">{props.message}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="touch-target h-12 flex-1"
            onClick={props.onRetry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            className="touch-target h-12 flex-1"
            onClick={props.onGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (props.kind === "noProgram") {
    return (
      <div className={cn(containerClasses, "space-y-6 p-6 pt-4")}>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            No active program
          </h1>
          <p className="text-muted-foreground">
            Select a template to get started.
          </p>
        </div>
        <Button
          className="touch-target h-12 w-full sm:w-auto"
          onClick={props.onBrowseTemplates}
        >
          Browse templates
        </Button>
      </div>
    );
  }

  if (props.kind === "draftConflict") {
    return (
      <div className={cn(containerClasses, "space-y-6 p-6 pt-4")}>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Active workout</h1>
          <p className="text-muted-foreground">
            You have a workout in progress.
          </p>
        </div>

        <Card elevation="hero">
          <CardContent className="p-5">
            <p className="text-sm font-medium">
              {props.activeDraftProgram}
              {props.activeDraftDay ? ` - ${props.activeDraftDay}` : ""}
            </p>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardContent className="p-5">
            <p className="text-muted-foreground text-sm">
              Trying to start:{" "}
              <span className="text-foreground font-medium">
                {props.requestedProgram}
                {props.requestedDay ? ` - ${props.requestedDay}` : ""}
              </span>
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="touch-target h-12 flex-1" onClick={props.onResume}>
            Resume active
          </Button>
          <Button
            variant="destructive"
            className="touch-target h-12 flex-1"
            onClick={props.onDiscard}
          >
            Discard & start new
          </Button>
        </div>
        <Button
          variant="ghost"
          className="h-10 w-full"
          onClick={props.onCancel}
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (props.kind === "completedToday") {
    return (
      <div className={cn(containerClasses, "space-y-6 p-6 pt-4")}>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Great work!</h1>
          <p className="text-muted-foreground">
            You&apos;ve completed today&apos;s workout.
          </p>
        </div>

        <Card elevation="subtle">
          <CardContent className="p-5">
            <p className="font-medium">
              {props.programName}
              {props.dayLabel ? ` - ${props.dayLabel}` : ""}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="touch-target h-12 flex-1"
            onClick={props.onTakeRestDay}
          >
            Take a rest day
          </Button>
          <Button
            variant="outline"
            className="touch-target h-12 flex-1"
            onClick={props.onRepeat}
          >
            Repeat workout
          </Button>
        </div>
        <Button
          variant="ghost"
          className="h-10 w-full"
          onClick={props.onBackToOverview}
        >
          Back to overview
        </Button>
      </div>
    );
  }

  if (props.kind === "noDraft") {
    if (props.isRestDay) {
      return (
        <div className={cn(containerClasses, "space-y-6 p-6 pt-4")}>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Rest day</h1>
            <p className="text-muted-foreground">
              {props.dayLabel ?? "Today"} is scheduled as a rest day.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="touch-target h-12 flex-1"
              onClick={props.onBackToOverview}
            >
              View overview
            </Button>
            <Button
              variant="outline"
              className="touch-target h-12 flex-1"
              onClick={props.onUseAutoDay}
            >
              Change day
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={cn(containerClasses, "space-y-6 p-6 pt-4")}>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Ready to train</h1>
          <p className="text-muted-foreground">
            {props.programName}
            {props.dayLabel ? ` - ${props.dayLabel}` : ""}
          </p>
        </div>
        <Button
          className="touch-target h-14 w-full text-lg font-semibold"
          onClick={props.onStart}
          disabled={props.startDisabled}
        >
          Start workout
        </Button>
      </div>
    );
  }

  // Logging state
  const { programName, setsDone, setsTotal, exercises } = props;
  const currentExercise = exercises[currentExerciseIndex];
  const progressPercent = setsTotal > 0 ? (setsDone / setsTotal) * 100 : 0;
  const hasNextExercise = currentExerciseIndex < exercises.length - 1;
  const currentExerciseComplete =
    currentExercise?.setRows.every((set) => set.completed) ?? false;

  return (
    <div className={cn(containerClasses, "space-y-4 p-4 pt-2 pb-8")}>
      {/* Compact header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{programName}</h1>
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {setsDone}/{setsTotal} sets
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Goal tracking during workout</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={props.onToggleTrackGoals}
          >
            {props.trackGoalsEnabled ? "On" : "Off"}
          </Button>
        </div>
      </div>

      {/* Action bar - moved to top */}
      <FloatingActionBar
        restTimer={props.restTimer}
        onStartRestTimer={props.onStartRestTimer}
        onStopRestTimer={props.onStopRestTimer}
        onSaveExit={props.onSaveExit}
        onFinish={handleFinishClick}
        finishDisabled={props.finishDisabled}
      />

      {/* Exercise navigator */}
      <ExerciseNavigator
        exercises={exercises}
        currentIndex={currentExerciseIndex}
        onNavigate={setCurrentExerciseIndex}
      />

      <Card elevation="subtle">
        <CardContent className="space-y-2 p-4">
          <button
            type="button"
            onClick={() => setWorkoutListOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-muted-foreground"
            aria-expanded={workoutListOpen}
          >
            Workout list
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                workoutListOpen && "rotate-90",
              )}
            />
          </button>

          {workoutListOpen ? (
            <div className="space-y-1">
              {exercises.map((exercise, index) => {
                const completed = exercise.setRows.filter((set) => set.completed)
                  .length;
                const total = exercise.setRows.length;
                const isComplete = total > 0 && completed === total;
                const isActive = index === currentExerciseIndex;

                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => setCurrentExerciseIndex(index)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "hover:bg-muted",
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className="truncate">{exercise.name}</span>
                    <span className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : null}
                      {completed}/{total}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Single exercise focus */}
      {currentExercise ? (
        <SingleExerciseView
          key={currentExercise.id}
          exercise={currentExercise}
          onUpdateSet={props.onUpdateSet}
          onAddSet={props.onAddSet}
          onCopyPrevious={props.onCopyPrevious}
          onCopyLastSet={props.onCopyLastSet}
          showNextWorkout={currentExerciseComplete && hasNextExercise}
          onNextWorkout={() => setCurrentExerciseIndex((idx) => idx + 1)}
        />
      ) : null}

      {/* Finish confirmation dialog */}
      <FinishConfirmationDialog
        state={finishDialogState}
        setsDone={setsDone}
        setsTotal={setsTotal}
        onClose={() => setFinishDialogState("closed")}
        onFinish={() => {
          setFinishDialogState("closed");
          props.onFinish();
        }}
        onDiscard={() => {
          setFinishDialogState("closed");
          props.onDiscardWorkout();
        }}
      />
    </div>
  );
}
