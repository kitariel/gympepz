/**
 * Dialog component for handling rest day scenarios
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { RestDayAction } from "../_types";

interface RestDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: RestDayAction) => void;
  isRestDay: boolean;
  workoutTitle?: string | null;
}

export function RestDayDialog({
  open,
  onOpenChange,
  onAction,
  isRestDay,
  workoutTitle,
}: RestDayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {isRestDay ? (
            <>
              <DialogTitle>It&apos;s Your Rest Day Today</DialogTitle>
              <DialogDescription className="pt-2">
                {workoutTitle
                  ? `Today is scheduled as a rest day for "${workoutTitle}". Take time to recover and let your muscles heal.`
                  : "Today is scheduled as a rest day. Take time to recover and let your muscles heal."}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>No Exercises for Today&apos;s Workout</DialogTitle>
              <DialogDescription className="pt-2">
                {workoutTitle
                  ? `Today's workout "${workoutTitle}" doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?`
                  : "Today's workout doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?"}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 mt-4">
          {isRestDay ? (
            <Button
              variant="default"
              onClick={() => onAction("skip")}
              className="w-full"
            >
              Got It
            </Button>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => onAction("skip")}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={() => onAction("add")}
                  className="flex-1"
                >
                  Add Exercises
                </Button>
              </div>
              <Button
                variant="secondary"
                onClick={() => onAction("mark")}
                className="w-full"
              >
                Mark Today as Rest Day
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

