"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Play,
  Plus,
  Pencil,
  Trash2,
  Scale,
  Dumbbell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GoalProgress } from "@/features/goals/components/GoalProgress";
import type { GoalDetailViewProps } from "./GoalDetail.types";

// View: displays goal details and dialogs based on the view state.
export function GoalDetailView(props: GoalDetailViewProps) {
  if (props.state === "loading") {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (props.state === "error") {
    return (
      <div className="container mx-auto max-w-md space-y-6 p-6">
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="space-y-3 py-8 text-center">
            <h2 className="text-base font-semibold">Unable to load goal</h2>
            <p className="text-destructive text-sm">{props.message}</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={props.onRetry}>
                Retry
              </Button>
              <Button asChild>
                <Link href={props.backHref}>Back to Goals</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (props.state === "missing") {
    return (
      <div className="container mx-auto max-w-md space-y-6 p-6">
        <p className="text-muted-foreground">Goal not found.</p>
        <Button asChild>
          <Link href={props.backHref}>Back to Goals</Link>
        </Button>
      </div>
    );
  }

  const {
    goal,
    goalTitle,
    goalTypeLabel,
    goalTypeColorClass,
    GoalTypeIcon,
    isCompleted,
    goalType,
    progress,
    backHref,
    workoutHref,
    progressDialogOpen,
    onProgressDialogChange,
    progressValue,
    progressNotes,
    isRecording,
    onProgressValueChange,
    onProgressNotesChange,
    onRecordProgress,
    editDialogOpen,
    onEditDialogChange,
    editTargetValue,
    editDeadline,
    isUpdating,
    onEditTargetValueChange,
    onEditDeadlineChange,
    onEditGoal,
    onAbandonGoal,
    isDeleting,
    onDeleteGoal,
  } = props;

  const recordValueLabel =
    goalType === "bodyweight"
      ? "Weight"
      : goalType === "consistency"
        ? "Workouts"
        : "Value";

  const recordValueDescription =
    goalType === "bodyweight"
      ? "weight"
      : goalType === "consistency"
        ? "workout count"
        : "value";

  return (
    <div className="container mx-auto max-w-lg space-y-7 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Goals
          </Link>
        </Button>
        <div className="flex gap-2">
          {!isCompleted && (
            <>
              <Dialog
                open={progressDialogOpen}
                onOpenChange={onProgressDialogChange}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record progress</DialogTitle>
                    <DialogDescription>
                      Log a new check-in for this goal. You can add a short
                      note to remember how it felt.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="progress-value">
                        Current {recordValueLabel} ({goal.unit})
                      </Label>
                      <Input
                        id="progress-value"
                        type="number"
                        min={0}
                        step={
                          goalType === "strength" || goalType === "bodyweight"
                            ? 0.1
                            : 1
                        }
                        placeholder={`e.g. ${goal.currentValue || goal.targetValue * 0.5}`}
                        value={progressValue}
                        onChange={(e) => onProgressValueChange(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Target: {goal.targetValue} {goal.unit} · Current:{" "}
                        {goal.currentValue} {goal.unit}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progress-notes">Notes (optional)</Label>
                      <Textarea
                        id="progress-notes"
                        placeholder="Add a quick note (optional)"
                        value={progressNotes}
                        onChange={(e) => onProgressNotesChange(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => onProgressDialogChange(false)}
                      disabled={isRecording}
                    >
                      Cancel
                    </Button>
                    <Button onClick={onRecordProgress} disabled={isRecording}>
                      {isRecording ? "Saving..." : "Save progress"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={editDialogOpen} onOpenChange={onEditDialogChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-4">
                  <DialogHeader>
                    <DialogTitle>Edit goal</DialogTitle>
                    <DialogDescription>
                      Adjust your target or deadline. Progress history stays
                      intact.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-target">
                        Target Value ({goal.unit})
                      </Label>
                      <Input
                        id="edit-target"
                        type="number"
                        min={0}
                        step={
                          goalType === "strength" || goalType === "bodyweight"
                            ? 0.1
                            : 1
                        }
                        value={editTargetValue}
                        onChange={(e) =>
                          onEditTargetValueChange(e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-deadline">Deadline (optional)</Label>
                      <Input
                        id="edit-deadline"
                        type="date"
                        value={editDeadline}
                        onChange={(e) =>
                          onEditDeadlineChange(e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to remove the deadline.
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                      variant="destructive"
                      onClick={onAbandonGoal}
                      disabled={isUpdating}
                      className="w-full sm:w-auto"
                    >
                      Abandon Goal
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => onEditDialogChange(false)}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={onEditGoal}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        {isUpdating ? "Saving..." : "Save changes"}
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                aria-label="Delete goal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete goal</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the goal and its progress history.
                  This can’t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteGoal}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete goal"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" size="sm" asChild>
            <Link href={workoutHref}>
              <Play className="mr-2 h-4 w-4" />
              Start workout
            </Link>
          </Button>
        </div>
      </div>

      <Card className="py-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`${goalTypeColorClass} text-white`}>
                  <GoalTypeIcon className="mr-1 h-3 w-3" />
                  {goalTypeLabel}
                </Badge>
                {isCompleted && (
                  <Badge variant="default" className="bg-yellow-500 text-white">
                    Completed
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{goalTitle}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-semibold">
                {goal.targetValue} {goal.unit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Current</p>
              <p className="font-semibold">
                {goal.currentValue} {goal.unit}
              </p>
            </div>
            {goal.deadline && (
              <div>
                <p className="text-muted-foreground">Deadline</p>
                <p className="font-semibold">
                  {format(new Date(goal.deadline), "MMM d, yyyy")}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-semibold">
                {format(new Date(goal.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader>
          <CardTitle className="text-lg">Progress History</CardTitle>
        </CardHeader>
        <CardContent >
          <GoalProgress
            goalId={goal.id}
            goal={goal}
            progress={progress ?? null}
            progressLoading={progress == null}
          />
        </CardContent>
      </Card>

      {goalType === "bodyweight" && !isCompleted && (
        <Card className="border-dashed">
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            <Scale className="mx-auto mb-2 h-6 w-6" />
            <p>
              Bodyweight goals are updated manually. Click "Record Progress" to
              log your current weight.
            </p>
          </CardContent>
        </Card>
      )}

      {(goalType === "strength" ||
        goalType === "reps" ||
        goalType === "consistency") &&
        !isCompleted && (
          <Card className="border-dashed">
            <CardContent className="py-4 text-center text-sm text-muted-foreground">
              <Dumbbell className="mx-auto mb-2 h-6 w-6" />
              <p>
                This goal updates automatically when you complete workouts. You
                can also record progress manually.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
