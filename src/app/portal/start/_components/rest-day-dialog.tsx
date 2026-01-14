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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {isRestDay ? (
            <>
              <DialogTitle className="text-lg sm:text-xl">
                It&apos;s Your Rest Day Today
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm sm:text-base">
                {workoutTitle
                  ? `Today is scheduled as a rest day for "${workoutTitle}". Take time to recover and let your muscles heal.`
                  : "Today is scheduled as a rest day. Take time to recover and let your muscles heal."}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-lg sm:text-xl">
                No Exercises for Today&apos;s Workout
              </DialogTitle>
              <DialogDescription className="pt-2 text-sm sm:text-base">
                {workoutTitle
                  ? `Today's workout "${workoutTitle}" doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?`
                  : "Today's workout doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?"}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 mt-4 sm:flex-row sm:justify-end">
          {isRestDay ? (
            <Button
              variant="default"
              onClick={() => onAction("skip")}
              className="h-11 w-full bg-gradient-to-r from-blue-500 to-emerald-500 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] sm:h-10"
            >
              Got It
            </Button>
          ) : (
            <>
              <div className="flex flex-col gap-2 w-full sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => onAction("skip")}
                  className="h-11 flex-1 sm:h-10"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={() => onAction("add")}
                  className="h-11 flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] sm:h-10"
                >
                  Add Exercises
                </Button>
              </div>
              <Button
                variant="secondary"
                onClick={() => onAction("mark")}
                className="h-11 w-full sm:h-10"
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

