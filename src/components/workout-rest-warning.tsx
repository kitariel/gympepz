"use client";

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
import { AlertTriangle } from "lucide-react";

interface WorkoutRestWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  recentWorkout: {
    title: string;
    hoursSince: number;
    minutesSince: number;
    duration: number | null;
  } | null;
}

export function WorkoutRestWarning({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  recentWorkout,
}: WorkoutRestWarningProps) {
  if (!recentWorkout) return null;

  const timeText =
    recentWorkout.hoursSince > 0
      ? `${recentWorkout.hoursSince} hour${recentWorkout.hoursSince > 1 ? "s" : ""}`
      : `${recentWorkout.minutesSince} minute${recentWorkout.minutesSince !== 1 ? "s" : ""}`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <AlertDialogTitle>Already Finished a Workout</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>
              You already finished a workout <strong>{timeText} ago</strong>.
            </p>
            <div className="bg-muted rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium">{recentWorkout.title}</p>
              {recentWorkout.duration && (
                <p className="text-xs text-muted-foreground">
                  Duration: {recentWorkout.duration} minutes
                </p>
              )}
            </div>
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Get some rest now! 💪
            </p>
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-3">
              <p className="text-xs text-orange-800 dark:text-orange-300">
                <strong>Note:</strong> Working out again so soon can be bad for your health and
                recovery. Your body needs time to rest and repair muscles.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Get Rest</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Workout Again Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
