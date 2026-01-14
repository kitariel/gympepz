"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */

import { useState, useEffect, use, useRef, useMemo } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowLeft,
  Clock,
  Dumbbell,
  AlertCircle,
  GripVertical,
  Move,
  Check,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDndContext,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExerciseCard } from "./_components/exercise-card";
import { RestTimer } from "./_components/rest-timer";
import { useWorkoutTimer, useRestTimer } from "@/hooks/useWorkoutTimer";
import { useWorkoutExercises } from "./_hooks/use-workout-exercises";
import { useWorkoutHandlers } from "./_hooks/use-workout-handlers";
import type { ExerciseGroup, SetUpdateData } from "./_types";

// Sortable exercise item component with collapsed view when dragging
function SortableExerciseItem({
  id,
  exerciseName,
  muscleGroup,
  exerciseId,
  sets,
  lastWorkoutData,
  isMarkedDone,
  onToggleDone,
  onUpdateSet,
  onCompleteSet,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
  onStartRestTimer,
  isArrangeMode,
}: {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  exerciseId: string;
  sets: Array<{
    id: string;
    setNumber: number;
    targetReps?: number;
    targetWeight?: number;
    actualReps: number;
    actualWeight?: number;
    rpe?: number;
    completed: boolean;
  }>;
  lastWorkoutData?: {
    weight: number;
    reps: number;
    date: Date;
  };
  isMarkedDone: boolean;
  onToggleDone: () => void;
  onUpdateSet: (setId: string, data: Partial<any>) => void;
  onCompleteSet: (setId: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onDeleteExercise: () => void;
  onStartRestTimer: () => void;
  isArrangeMode: boolean;
  isFirstExercise?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Check if any item is being dragged (not just this one)
  const { active } = useDndContext();
  const isAnyDragging = !!active || isDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isAnyDragging ? transition : "all 0.3s ease-in-out",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative cursor-grab transition-all duration-300 active:cursor-grabbing"
    >
      <div className="text-muted-foreground pointer-events-none absolute top-0 left-0 z-10 flex h-full items-center justify-center px-2">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="pl-8 transition-all duration-300">
        <ExerciseCard
          exerciseName={exerciseName}
          muscleGroup={muscleGroup}
          exerciseId={exerciseId}
          sets={sets}
          lastWorkoutData={lastWorkoutData}
          isMarkedDone={isMarkedDone}
          onToggleDone={onToggleDone}
          onUpdateSet={onUpdateSet}
          onCompleteSet={onCompleteSet}
          onAddSet={onAddSet}
          onDeleteSet={onDeleteSet}
          onDeleteExercise={onDeleteExercise}
          onStartRestTimer={onStartRestTimer}
          isCollapsed={isArrangeMode}
          isDragging={isDragging}
        />
      </div>
    </div>
  );
}

// Types are now imported from _types/index.ts

export default function ActiveWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { id: logId } = use(params);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const lastSavedMinute = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    new Set(),
  );
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isArrangeMode, setIsArrangeMode] = useState(false);

  // Timers
  const { elapsedTime, elapsedSeconds } = useWorkoutTimer(true);
  const restTimer = useRestTimer();

  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);

  // Get today's workout from plan (for reference)
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;
  const localDayName = dayNames[new Date().getDay()]!;

  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId, day: localDayName },
    { enabled: !!userId },
  );

  const utils = api.useUtils();
  const log = api.workoutLog.getWithHistory.useQuery({
    id: logId,
    includeLastWorkout: true,
  });

  const exercises = api.exercise.listInfinite.useInfiniteQuery(
    { q: exerciseSearch, limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: isAddingExercise,
    },
  );

  const flatExercises = useMemo(
    () => exercises.data?.pages.flatMap((page) => page.items) ?? [],
    [exercises.data?.pages],
  );

  // Note: workoutSet router is currently disabled, so we use workoutLogExercise mutations
  // These mutations work with the current database schema
  const deleteExercise = api.workoutLog.deleteExercise.useMutation({
    onSuccess: async () => {
      await utils.workoutLog.getWithHistory.invalidate({
        id: logId,
        includeLastWorkout: true,
      });
    },
  });

  const addExerciseMutation = api.workoutLog.addExercise.useMutation({
    onSuccess: async () => {
      await utils.workoutLog.getWithHistory.invalidate({
        id: logId,
        includeLastWorkout: true,
      });
      setIsAddingExercise(false);
      setExerciseSearch("");
    },
  });

  const reorderExercises = api.workoutLog.reorderExercises.useMutation({
    onSuccess: async () => {
      await utils.workoutLog.getWithHistory.invalidate({
        id: logId,
        includeLastWorkout: true,
      });
    },
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle exercise reordering
  const handleExerciseDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = workout as any;
    // Exercises are already sorted by order from the query
    const workoutExercises = w?.exercises ?? [];
    const oldIndex = workoutExercises.findIndex(
      (ex: any) => ex.id === active.id,
    );
    const newIndex = workoutExercises.findIndex((ex: any) => ex.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(workoutExercises, oldIndex, newIndex);
      const orderedIds = reordered.map((ex: any) => ex.id);

      reorderExercises.mutate({
        workoutLogId: logId,
        orderedIds,
      });
    }
  };

  const updateExerciseMutation = api.workoutLog.updateExercise.useMutation({
    onSuccess: async () => {
      await utils.workoutLog.getWithHistory.invalidate({
        id: logId,
        includeLastWorkout: true,
      });
    },
  });

  const completeWorkout = api.workoutLog.complete.useMutation({
    onSuccess: async () => {
      // Invalidate queries before redirecting
      await utils.workoutLog.list.invalidate();
      await utils.workoutLog.getWithHistory.invalidate({
        id: logId,
        includeLastWorkout: true,
      });
      router.push("/portal/log");
    },
    onError: (error) => {
      // Error is handled by the Alert component showing error state
      setError(
        error.message || "Failed to complete workout. Please try again.",
      );
    },
  });

  // Auto-save duration every minute (improved logic)
  const updateDuration = api.workoutLog.updateDuration.useMutation();

  useEffect(() => {
    const currentMinute = Math.floor(elapsedSeconds / 60);
    if (currentMinute > lastSavedMinute.current && elapsedSeconds > 0) {
      lastSavedMinute.current = currentMinute;
      updateDuration.mutate({
        id: logId,
        duration: currentMinute,
      });
    }
  }, [elapsedSeconds, logId, updateDuration]);

  // Initialize notes from workout data when workout loads
  useEffect(() => {
    if (log.data?.notes && !notes) {
      setNotes(log.data.notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log.data?.notes]);

  // Get workout data (may be null/undefined during loading)
  const workout = log.data;

  // Use hook to get exercises from multiple sources (log, planDay, today's workout)
  // Must be called before any early returns to follow Rules of Hooks
  const { exerciseGroups, exercises: workoutExercises } = useWorkoutExercises({
    workout,
    todaysWorkout,
  });

  // Calculate stats
  const allSets = useMemo(
    () =>
      Object.values(exerciseGroups).flatMap(
        (group: ExerciseGroup) => group.sets,
      ),
    [exerciseGroups],
  );

  // Merge completed sets from state with sets that have completed flag
  const allSetsWithCompletion = useMemo(() => {
    return allSets.map((set) => ({
      ...set,
      completed: completedSets.has(set.id) || set.completed,
    }));
  }, [allSets, completedSets]);

  const { totalVolume, completedSetsCount, totalSets } = useMemo(() => {
    const volume = allSetsWithCompletion.reduce((sum, set) => {
      return (
        sum +
        (set.actualWeight ?? set.targetWeight ?? 0) *
          (set.actualReps ?? set.targetReps ?? 0)
      );
    }, 0);
    const completed = allSetsWithCompletion.filter((s) => s.completed).length;
    const total = allSetsWithCompletion.length;
    return {
      totalVolume: volume,
      completedSetsCount: completed,
      totalSets: total,
    };
  }, [allSetsWithCompletion]);

  // Use handlers hook for workout actions
  // Must be called before any early returns to follow Rules of Hooks
  const handlers = useWorkoutHandlers({
    logId,
    workout,
    exerciseGroups,
    updateExerciseMutation,
    addExerciseMutation,
    deleteExercise,
    setError,
    restTimer,
    completedSets,
    setCompletedSets,
  });

  const handleFinish = () => {
    // Ensure duration is at least 1 minute if workout was started
    const duration = Math.max(1, Math.floor(elapsedSeconds / 60));

    completeWorkout.mutate({
      id: logId,
      completed: true,
      duration: duration,
      notes: (notes || workout?.notes) ?? undefined,
    });
  };

  // Early returns must come AFTER all hooks
  if (log.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!log.data) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Workout not found</p>
        <Button onClick={() => router.push("/portal/log")} className="mt-4">
          Back to Logs
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header - Mobile, Tablet & Desktop Optimized */}
      <div className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 md:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 shrink-0 sm:h-8 sm:w-8 md:h-9 md:w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold tracking-tight sm:text-lg md:text-xl">
                {todaysWorkout.data?.todayWorkout?.title ??
                  (workout as any)?.planDay?.title ??
                  "Workout"}
              </h1>
              <p className="text-muted-foreground/70 truncate text-xs font-medium tracking-wider uppercase sm:text-sm md:text-base">
                {format(new Date(), "EEEE, MMM d")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3 md:gap-4">
            <div className="bg-muted/50 ring-border/50 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ring-1 sm:gap-2 sm:px-3 sm:py-1.5 md:gap-2.5 md:rounded-lg md:px-3 md:py-2">
              <Clock className="text-muted-foreground h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 md:h-4 md:w-4" />
              <span className="font-mono text-xs font-medium tabular-nums sm:text-sm md:text-base">
                {elapsedTime}
              </span>
            </div>
            <Button
              onClick={() => setIsArrangeMode(!isArrangeMode)}
              variant={isArrangeMode ? "default" : "outline"}
              size="sm"
              className="h-9 shrink-0 gap-2 px-3 text-xs font-semibold sm:h-8 sm:px-4 sm:text-sm md:h-9 md:px-5 md:text-base"
            >
              {isArrangeMode ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Done</span>
                </>
              ) : (
                <>
                  <Move className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Arrange</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleFinish}
              disabled={completeWorkout.isPending || !logId || isArrangeMode}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 shrink-0 px-3 text-xs font-semibold disabled:opacity-50 sm:h-8 sm:px-4 sm:text-sm md:h-9 md:px-5 md:text-base"
            >
              {completeWorkout.isPending ? "Finishing..." : "Finish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Mobile, Tablet & Desktop Optimized */}
      <div className="flex-1 space-y-3 overflow-auto p-3 pb-20 sm:space-y-4 sm:p-4 sm:pb-24 md:space-y-5 md:p-6 md:pb-24">
        {/* Info about current mode */}
        {Object.keys(exerciseGroups).length > 0 && (
          <Alert className="border-primary/20 bg-primary/5 text-primary">
            <AlertCircle className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
            <AlertDescription className="text-xs md:text-sm">
              Using exercise-level tracking. You can edit reps, weight, and sets
              per exercise. Individual set tracking will be available after
              database migration.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="border-red-200 bg-red-50 dark:bg-red-950/20"
          >
            <AlertCircle className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
            <AlertDescription className="text-xs md:text-sm">
              {error}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs md:h-8 md:text-sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {/* Quick Stats - Mobile, Tablet & Desktop Optimized */}
        <Card className="ring-border bg-card border-0 shadow-sm ring-1">
          <CardContent className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 md:px-5 md:pt-5">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:flex lg:items-center lg:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm">
                  Sets
                </p>
                <p className="text-base font-bold sm:text-lg md:text-xl">
                  {completedSetsCount}/{totalSets}
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm">
                  Volume
                </p>
                <p className="text-base font-bold sm:text-lg md:text-xl">
                  {Math.round(totalVolume)}{" "}
                  <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                    kg
                  </span>
                </p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase sm:text-xs md:text-sm">
                  Exercises
                </p>
                <p className="text-base font-bold sm:text-lg md:text-xl">
                  {Object.keys(exerciseGroups).length}
                </p>
              </div>
              {(workout as any).lastWorkout && (
                <div className="col-span-3 mt-2 flex justify-center sm:col-span-1 sm:mt-0 sm:justify-end lg:mt-0 lg:flex lg:justify-end">
                  <Badge
                    variant="outline"
                    className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase sm:text-xs md:text-sm"
                  >
                    Last:{" "}
                    {(() => {
                      const date = new Date((workout as any).lastWorkout.date);
                      // Dates are stored as UTC start of day, so use UTC components directly
                      const year = date.getUTCFullYear();
                      const month = date.getUTCMonth();
                      const day = date.getUTCDate();
                      // Format using UTC date (stored as start of day in UTC)
                      const displayDate = new Date(
                        Date.UTC(year, month, day, 12, 0, 0),
                      );
                      return format(displayDate, "MMM d");
                    })()}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Notes - Mobile, Tablet & Desktop Optimized */}
        <Card className="ring-border bg-card border-0 shadow-sm ring-1">
          <CardContent className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4 md:px-5 md:pt-5 md:pb-5">
            <Textarea
              placeholder="Add workout notes..."
              value={(notes || workout?.notes) ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={(e) => {
                setNotes(e.target.value);
                // Optionally save notes immediately on blur
                if (e.target.value !== workout?.notes) {
                  completeWorkout.mutate({
                    id: logId,
                    notes: e.target.value,
                    completed: workout?.completed,
                  });
                }
              }}
              className="border-border/50 focus:border-primary/50 bg-muted/20 resize-none text-sm md:text-base"
              rows={2}
            />
          </CardContent>
        </Card>

        {/* Exercises - Mobile, Tablet & Desktop Optimized */}
        {isArrangeMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event) => {
              setIsDragging(false);
              handleExerciseDragEnd(event);
            }}
          >
            <SortableContext
              items={
                workoutExercises
                  .filter((ex: any) => ex.exercise != null)
                  .map((ex: any) => ex.id) ?? []
              }
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {workoutExercises
                  .filter((exerciseLog: any) => exerciseLog.exercise != null)
                  .map((exerciseLog: any) => {
                    // Use exerciseLog.id as the key (not exerciseId) to handle duplicate exercises
                    const group = exerciseGroups[exerciseLog.id];
                    if (!group?.exercise) return null;

                    const exerciseId = exerciseLog.exerciseId;

                    const { exercise, sets, exerciseLogId } = group;
                    // Find last workout data for this exercise
                    const w = workout as any;
                    const lastWorkoutSet =
                      w.lastWorkout?.sets?.find(
                        (s: any) => s.exerciseId === exerciseId && s.completed,
                      ) ??
                      w.lastWorkout?.exercises?.find(
                        (e: any) => e.exerciseId === exerciseId,
                      );

                    const isMarkedDone = completedExercises.has(exerciseId);

                    // Check if this exercise is being dragged
                    const isDragging = false; // Will be set by useSortable in the wrapper

                    return (
                      <SortableExerciseItem
                        key={exerciseLog.id}
                        id={exerciseLog.id}
                        exerciseName={exercise.name}
                        muscleGroup={exercise.muscleGroup}
                        exerciseId={exerciseId}
                        sets={sets.map((s) => ({
                          id: s.id,
                          setNumber: s.setNumber,
                          targetReps: s.targetReps,
                          targetWeight: s.targetWeight ?? undefined,
                          actualReps: s.actualReps ?? 0,
                          actualWeight: s.actualWeight ?? undefined,
                          rpe: s.rpe ?? undefined,
                          completed:
                            completedSets.has(s.id) || (s.completed ?? false),
                        }))}
                        lastWorkoutData={
                          lastWorkoutSet
                            ? {
                                weight:
                                  lastWorkoutSet.actualWeight ??
                                  lastWorkoutSet.weight ??
                                  0,
                                reps:
                                  lastWorkoutSet.actualReps ??
                                  lastWorkoutSet.reps ??
                                  0,
                                date: w.lastWorkout!.date,
                              }
                            : undefined
                        }
                        isMarkedDone={isMarkedDone}
                        onToggleDone={() => {
                          const newCompleted = new Set(completedExercises);
                          if (isMarkedDone) {
                            newCompleted.delete(exerciseId);
                          } else {
                            newCompleted.add(exerciseId);
                          }
                          setCompletedExercises(newCompleted);
                        }}
                        onUpdateSet={(setId, data) =>
                          handlers.handleUpdateSet(setId, data)
                        }
                        onCompleteSet={(setId) => {
                          handlers.handleCompleteSet(setId);
                          restTimer.start(180);
                        }}
                        onAddSet={() =>
                          handlers.handleAddSet(exerciseId, exerciseLogId)
                        }
                        onDeleteSet={(setId) =>
                          handlers.handleDeleteSet(setId, exerciseLogId)
                        }
                        onDeleteExercise={() =>
                          handlers.handleDeleteExercise(
                            exerciseId,
                            exerciseLogId,
                          )
                        }
                        onStartRestTimer={() => restTimer.start(180)}
                        isArrangeMode={isArrangeMode}
                      />
                    );
                  })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {workoutExercises
              .filter((exerciseLog: any) => exerciseLog.exercise != null)
              .map((exerciseLog: any) => {
                // Use exerciseLog.id as the key (not exerciseId) to handle duplicate exercises
                const group = exerciseGroups[exerciseLog.id];
                if (!group?.exercise) return null;

                const exerciseId = exerciseLog.exerciseId;

                const { exercise, sets, exerciseLogId } = group;
                // Find last workout data for this exercise
                const w = workout as any;
                const lastWorkoutSet =
                  w.lastWorkout?.sets?.find(
                    (s: any) => s.exerciseId === exerciseId && s.completed,
                  ) ??
                  w.lastWorkout?.exercises?.find(
                    (e: any) => e.exerciseId === exerciseId,
                  );

                const isMarkedDone = completedExercises.has(exerciseId);

                // Check if this is the first exercise
                const isFirstExercise =
                  workoutExercises
                    .filter((ex: any) => ex.exercise != null)
                    .findIndex((ex: any) => ex.id === exerciseLog.id) === 0;

                return (
                  <ExerciseCard
                    key={exerciseLog.id}
                    exerciseName={exercise.name}
                    muscleGroup={exercise.muscleGroup}
                    exerciseId={exerciseId}
                    sets={sets.map((s) => ({
                      id: s.id,
                      setNumber: s.setNumber,
                      targetReps: s.targetReps,
                      targetWeight: s.targetWeight ?? undefined,
                      actualReps: s.actualReps ?? 0,
                      actualWeight: s.actualWeight ?? undefined,
                      rpe: s.rpe ?? undefined,
                      completed:
                        completedSets.has(s.id) || (s.completed ?? false),
                    }))}
                    lastWorkoutData={
                      lastWorkoutSet
                        ? {
                            weight:
                              lastWorkoutSet.actualWeight ??
                              lastWorkoutSet.weight ??
                              0,
                            reps:
                              lastWorkoutSet.actualReps ??
                              lastWorkoutSet.reps ??
                              0,
                            date: w.lastWorkout!.date,
                          }
                        : undefined
                    }
                    isMarkedDone={isMarkedDone}
                    onToggleDone={() => {
                      const newCompleted = new Set(completedExercises);
                      if (isMarkedDone) {
                        newCompleted.delete(exerciseId);
                      } else {
                        newCompleted.add(exerciseId);
                      }
                      setCompletedExercises(newCompleted);
                    }}
                    onUpdateSet={(setId, data) =>
                      handlers.handleUpdateSet(setId, data)
                    }
                    onCompleteSet={(setId) => {
                      handlers.handleCompleteSet(setId);
                      restTimer.start(180);
                    }}
                    onAddSet={() =>
                      handlers.handleAddSet(exerciseId, exerciseLogId)
                    }
                    onDeleteSet={(setId) =>
                      handlers.handleDeleteSet(setId, exerciseLogId)
                    }
                    onDeleteExercise={() =>
                      handlers.handleDeleteExercise(exerciseId, exerciseLogId)
                    }
                    onStartRestTimer={() => restTimer.start(180)}
                    isCollapsed={false}
                    isDragging={false}
                    isFirstExercise={isFirstExercise}
                  />
                );
              })}
          </div>
        )}

        {/* Add Exercise Button - Mobile, Tablet & Desktop Optimized */}
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="hover:border-primary/50 hover:bg-primary/5 group w-full touch-manipulation border-2 border-dashed py-6 text-sm transition-all sm:py-7 sm:text-base md:py-8 md:text-lg"
            >
              <Plus className="text-muted-foreground group-hover:text-primary mr-2 h-4 w-4 transition-colors md:h-5 md:w-5" />
              <span className="text-muted-foreground group-hover:text-primary transition-colors">
                Add Exercise
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl sm:max-h-[80vh] sm:w-[calc(100vw-3rem)] md:max-h-[75vh] md:w-full">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">
                Add Exercise
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 md:space-y-5 md:pt-5">
              <Input
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="h-10 text-sm sm:h-9 sm:text-base md:h-10 md:text-base"
              />
              <div className="-mx-1 max-h-[300px] space-y-1.5 overflow-y-auto px-1 sm:max-h-[400px] sm:space-y-2 md:max-h-[500px] md:space-y-2.5">
                {flatExercises.map((ex) => (
                  <Button
                    key={ex.id}
                    variant="ghost"
                    className="h-auto w-full touch-manipulation justify-start py-2.5 text-left sm:py-2.5 md:py-3"
                    onClick={() => handlers.handleAddExercise(ex.id)}
                  >
                    <div className="flex w-full items-center gap-2.5 text-left sm:gap-3 md:gap-3.5">
                      <Dumbbell className="text-muted-foreground h-4 w-4 shrink-0 md:h-5 md:w-5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium sm:text-base md:text-lg">
                          {ex.name}
                        </p>
                        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
                          {ex.muscleGroup}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
                {exercises.hasNextPage && (
                  <Button
                    variant="ghost"
                    className="text-muted-foreground w-full text-xs"
                    onClick={() => exercises.fetchNextPage()}
                    disabled={exercises.isFetchingNextPage}
                  >
                    {exercises.isFetchingNextPage ? "Loading..." : "Load More"}
                  </Button>
                )}
                {flatExercises.length === 0 && !exercises.isLoading && (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    No exercises found.
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rest Timer Overlay */}
      {restTimer.isActive && (
        <RestTimer
          remainingSeconds={restTimer.remainingSeconds}
          isActive={restTimer.isActive}
          onPause={restTimer.pause}
          onResume={restTimer.resume}
          onCancel={restTimer.cancel}
          onAddTime={restTimer.addTime}
        />
      )}
    </div>
  );
}
