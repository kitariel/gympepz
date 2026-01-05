/**
 * Dialog component for adding a new workout day
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayTitle: string;
  onDayTitleChange: (title: string) => void;
  onAdd: () => void;
  isAdding: boolean;
}

export function AddDayDialog({
  open,
  onOpenChange,
  dayTitle,
  onDayTitleChange,
  onAdd,
  isAdding,
}: AddDayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Create New Workout Day
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            Add a new day to your weekly training schedule. You can add
            exercises to this day after creating it.
          </p>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-foreground">
              Day Name
            </label>
            <Input
              placeholder="e.g., Push Day, Leg Day, Upper Body, Monday Workout"
              value={dayTitle}
              onChange={(e) => onDayTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && dayTitle.trim()) {
                  void onAdd();
                }
              }}
              className="h-12 text-base border-2 focus:border-primary transition-colors"
              autoFocus
            />
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <span className="text-[10px] font-bold text-primary">💡</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Tip:</strong> Use descriptive names like &quot;Push
                Day&quot;, &quot;Pull Day&quot;, or include the day of week
                (e.g., &quot;Monday - Chest & Triceps&quot;).
              </p>
            </div>
          </div>
          <Button
            className="h-12 w-full gap-2 font-semibold text-base"
            onClick={onAdd}
            disabled={!dayTitle.trim() || isAdding}
          >
            <Plus className="h-5 w-5" />
            {isAdding ? "Creating..." : "Create Workout Day"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

