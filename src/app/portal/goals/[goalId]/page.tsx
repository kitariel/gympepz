"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Play, Plus, Pencil, Trash2, Dumbbell, Repeat, Calendar, Scale } from "lucide-react";
import { format } from "date-fns";

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
import { useGoal, useGoalMutations } from "@/hooks/useGoals";
import { useRouter } from "next/navigation";
import { GoalProgress } from "@/features/goals/components/GoalProgress";
import { toast } from "sonner";

const GOAL_TYPE_CONFIG = {
  strength: { icon: Dumbbell, label: "Strength", color: "bg-blue-500" },
  reps: { icon: Repeat, label: "Reps", color: "bg-green-500" },
  consistency: { icon: Calendar, label: "Consistency", color: "bg-purple-500" },
  bodyweight: { icon: Scale, label: "Bodyweight", color: "bg-orange-500" },
} as const;

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = use(params);
  const router = useRouter();
  const { goal, isLoading, refetch } = useGoal(goalId);
  const { recordProgress, update, delete: deleteGoal, isUpdating, isDeleting } = useGoalMutations();

  // Progress dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressValue, setProgressValue] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTargetValue, setEditTargetValue] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const handleRecordProgress = async () => {
    const value = Number.parseFloat(progressValue);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Please enter a valid value");
      return;
    }

    setIsRecording(true);
    try {
      await recordProgress({
        goalId,
        value,
        notes: progressNotes || undefined,
      });
      toast.success("Progress recorded!");
      setDialogOpen(false);
      setProgressValue("");
      setProgressNotes("");
      refetch();
    } catch (err) {
      toast.error("Failed to record progress");
      console.error(err);
    } finally {
      setIsRecording(false);
    }
  };

  const openEditDialog = () => {
    if (goal) {
      setEditTargetValue(String(goal.targetValue));
      setEditDeadline(goal.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : "");
    }
    setEditDialogOpen(true);
  };

  const handleEditGoal = async () => {
    const value = Number.parseFloat(editTargetValue);
    if (Number.isNaN(value) || value <= 0) {
      toast.error("Please enter a valid target value");
      return;
    }

    try {
      await update({
        id: goalId,
        targetValue: value,
        deadline: editDeadline ? new Date(editDeadline) : null,
      });
      toast.success("Goal updated!");
      setEditDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error("Failed to update goal");
      console.error(err);
    }
  };

  const handleAbandonGoal = async () => {
    try {
      await update({
        id: goalId,
        status: "abandoned",
      });
      toast.success("Goal marked as abandoned");
      router.push("/portal/goals");
    } catch (err) {
      toast.error("Failed to abandon goal");
      console.error(err);
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await deleteGoal({ id: goalId });
      toast.success("Goal deleted");
      router.push("/portal/goals");
    } catch (err) {
      toast.error("Failed to delete goal");
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[40vh] items-center justify-center p-6">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto max-w-md space-y-6 p-6">
        <p className="text-muted-foreground">Goal not found.</p>
        <Button asChild>
          <Link href="/portal/goals">Back to Goals</Link>
        </Button>
      </div>
    );
  }

  const goalType = goal.type as keyof typeof GOAL_TYPE_CONFIG;
  const config = GOAL_TYPE_CONFIG[goalType] ?? GOAL_TYPE_CONFIG.strength;
  const TypeIcon = config.icon;

  const goalTitle = goal.exercise?.name ?? config.label;
  const isCompleted = goal.status === "completed";

  return (
    <div className="container mx-auto max-w-lg space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/goals">← Goals</Link>
        </Button>
        <div className="flex gap-2">
          {!isCompleted && (
            <>
              {/* Record Progress Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Progress</DialogTitle>
                    <DialogDescription>
                      Enter your current {goalType === "bodyweight" ? "weight" : goalType === "consistency" ? "workout count" : "value"} to update your goal progress.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="progress-value">
                        Current {goalType === "bodyweight" ? "Weight" : goalType === "consistency" ? "Workouts" : "Value"} ({goal.unit})
                      </Label>
                      <Input
                        id="progress-value"
                        type="number"
                        min={0}
                        step={goalType === "strength" || goalType === "bodyweight" ? 0.1 : 1}
                        placeholder={`e.g. ${goal.currentValue || goal.targetValue * 0.5}`}
                        value={progressValue}
                        onChange={(e) => setProgressValue(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Target: {goal.targetValue} {goal.unit} | Current: {goal.currentValue} {goal.unit}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progress-notes">Notes (optional)</Label>
                      <Textarea
                        id="progress-notes"
                        placeholder="Add any notes about this progress..."
                        value={progressNotes}
                        onChange={(e) => setProgressNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isRecording}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleRecordProgress} disabled={isRecording}>
                      {isRecording ? "Recording..." : "Record"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Goal Dialog */}
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Goal</DialogTitle>
                    <DialogDescription>
                      Update your goal's target value or deadline.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-target">Target Value ({goal.unit})</Label>
                      <Input
                        id="edit-target"
                        type="number"
                        min={0}
                        step={goalType === "strength" || goalType === "bodyweight" ? 0.1 : 1}
                        value={editTargetValue}
                        onChange={(e) => setEditTargetValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-deadline">Deadline (optional)</Label>
                      <Input
                        id="edit-deadline"
                        type="date"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                      variant="destructive"
                      onClick={handleAbandonGoal}
                      disabled={isUpdating}
                      className="w-full sm:w-auto"
                    >
                      Abandon Goal
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(false)}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleEditGoal} disabled={isUpdating} className="flex-1">
                        {isUpdating ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Delete Goal */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this goal? This action cannot be undone and all progress history will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteGoal}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" size="sm" asChild>
            <Link href="/train/log">
              <Play className="mr-2 h-4 w-4" />
              Workout
            </Link>
          </Button>
        </div>
      </div>

      {/* Goal Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`${config.color} text-white`}>
                  <TypeIcon className="mr-1 h-3 w-3" />
                  {config.label}
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
        <CardContent className="space-y-4">
          {/* Goal Stats */}
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

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress History</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalProgress goalId={goalId} />
        </CardContent>
      </Card>

      {/* Help Text for Goal Types */}
      {goalType === "bodyweight" && !isCompleted && (
        <Card className="border-dashed">
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            <Scale className="mx-auto mb-2 h-6 w-6" />
            <p>
              Bodyweight goals are updated manually. Click "Record Progress" to log your current weight.
            </p>
          </CardContent>
        </Card>
      )}

      {(goalType === "strength" || goalType === "reps" || goalType === "consistency") && !isCompleted && (
        <Card className="border-dashed">
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            <Dumbbell className="mx-auto mb-2 h-6 w-6" />
            <p>
              This goal updates automatically when you complete workouts. You can also record progress manually.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
