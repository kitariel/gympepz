"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type LeaveGuardChoice = "save_exit" | "keep_training" | "discard";

export function LeaveGuardDialog({
  open,
  onOpenChange,
  onChoose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (choice: LeaveGuardChoice) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave this workout?</DialogTitle>
          <DialogDescription className="pt-2">
            You have logged sets. Choose what you want to do before leaving.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onChoose("keep_training")}>
            Keep training
          </Button>
          <Button variant="secondary" onClick={() => onChoose("save_exit")}>
            Save & exit
          </Button>
          <Button variant="destructive" onClick={() => onChoose("discard")}>
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

