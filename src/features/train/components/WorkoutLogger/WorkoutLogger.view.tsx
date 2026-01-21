"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Pause, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SwipeableSetRow } from "../SwipeableSetRow";
import type { WorkoutLoggerViewProps, WorkoutLoggerExerciseVM } from "./WorkoutLogger.types";
import type { RestTimerState } from "@/lib/storage/workoutRepo";

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
      const remaining = Math.max(0, Math.ceil((restTimer.durationMs - elapsed) / 1000));
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
          isFinished && "animate-pulse bg-emerald-500 hover:bg-emerald-600"
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
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
}: {
  exercise: WorkoutLoggerExerciseVM;
  onUpdateSet: (setId: string, patch: { actualReps?: string; actualWeight?: string | null; completed?: boolean }) => void;
  onAddSet: (exerciseId: string) => void;
  onCopyPrevious: (exerciseId: string, setId: string) => void;
  onCopyLastSet: (exerciseId: string, setId: string) => void;
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
              onUpdateReps={(value) => onUpdateSet(set.id, { actualReps: value })}
              onUpdateWeight={(value) => onUpdateSet(set.id, { actualWeight: value })}
              onToggleComplete={(completed) => onUpdateSet(set.id, { completed })}
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
    <div className="border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 left-0 z-40 border-t px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 backdrop-blur md:bottom-20">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <RestTimerCompact
          restTimer={restTimer}
          onStartRestTimer={onStartRestTimer}
          onStopRestTimer={onStopRestTimer}
        />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSaveExit} className="h-9">
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

export function WorkoutLoggerView(props: WorkoutLoggerViewProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Reset index when exercises change
  useEffect(() => {
    if (props.kind === "logging") {
      setCurrentExerciseIndex((prev) =>
        prev >= props.exercises.length ? Math.max(0, props.exercises.length - 1) : prev
      );
    }
  }, [props]);

  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-64 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (props.kind === "noProgram") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">No active program</h1>
          <p className="text-muted-foreground">Select a template to get started.</p>
        </div>
        <Button className="touch-target h-12 w-full sm:w-auto" onClick={props.onBrowseTemplates}>
          Browse templates
        </Button>
      </div>
    );
  }

  if (props.kind === "draftConflict") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Active workout</h1>
          <p className="text-muted-foreground">You have a workout in progress.</p>
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
              <span className="font-medium text-foreground">
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
          <Button variant="destructive" className="touch-target h-12 flex-1" onClick={props.onDiscard}>
            Discard & start new
          </Button>
        </div>
        <Button variant="ghost" className="h-10 w-full" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  if (props.kind === "completedToday") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Great work!</h1>
          <p className="text-muted-foreground">
            You've completed today's workout.
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
          <Button className="touch-target h-12 flex-1" onClick={props.onTakeRestDay}>
            Take a rest day
          </Button>
          <Button variant="outline" className="touch-target h-12 flex-1" onClick={props.onRepeat}>
            Repeat workout
          </Button>
        </div>
        <Button variant="ghost" className="h-10 w-full" onClick={props.onBackToOverview}>
          Back to overview
        </Button>
      </div>
    );
  }

  if (props.kind === "noDraft") {
    if (props.isRestDay) {
      return (
        <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Rest day</h1>
            <p className="text-muted-foreground">
              {props.dayLabel ?? "Today"} is scheduled as a rest day.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="touch-target h-12 flex-1" onClick={props.onBackToOverview}>
              View overview
            </Button>
            <Button variant="outline" className="touch-target h-12 flex-1" onClick={props.onUseAutoDay}>
              Change day
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 pb-36 pt-2">
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
      </div>

      {/* Exercise navigator */}
      <ExerciseNavigator
        exercises={exercises}
        currentIndex={currentExerciseIndex}
        onNavigate={setCurrentExerciseIndex}
      />

      {/* Single exercise focus */}
      {currentExercise ? (
        <SingleExerciseView
          key={currentExercise.id}
          exercise={currentExercise}
          onUpdateSet={props.onUpdateSet}
          onAddSet={props.onAddSet}
          onCopyPrevious={props.onCopyPrevious}
          onCopyLastSet={props.onCopyLastSet}
        />
      ) : null}

      {/* Floating action bar */}
      <FloatingActionBar
        restTimer={props.restTimer}
        onStartRestTimer={props.onStartRestTimer}
        onStopRestTimer={props.onStopRestTimer}
        onSaveExit={props.onSaveExit}
        onFinish={props.onFinish}
        finishDisabled={props.finishDisabled}
      />
    </div>
  );
}
