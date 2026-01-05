/**
 * Dialog component for copying exercises between days
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Calendar, Copy } from "lucide-react";
import type { PlanDay } from "../_types";

interface CopyExercisesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDayId: string | null;
  days: PlanDay[];
  onCopy: (targetDayId: string) => void;
  isCopying: boolean;
}

export function CopyExercisesDialog({
  open,
  onOpenChange,
  sourceDayId,
  days,
  onCopy,
  isCopying,
}: CopyExercisesDialogProps) {
  const availableDays = days.filter((d) => d.id !== sourceDayId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Copy className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Copy Exercises
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            Select a workout day to copy exercises to
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="max-h-[50vh] space-y-2 overflow-y-auto sm:max-h-[400px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            {availableDays.length > 0 ? (
              availableDays.map((day) => (
                <Card
                  key={day.id}
                  className="cursor-pointer border-2 transition-all hover:border-primary/50 hover:shadow-md group"
                  onClick={() => !isCopying && onCopy(day.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex w-full items-center justify-between">
                      <div className="min-w-0 flex-1 text-left space-y-1">
                        <p className="truncate text-base font-semibold group-hover:text-primary transition-colors">
                          {day.title}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Dumbbell className="h-3.5 w-3.5" />
                            {day.items?.length ?? 0}{" "}
                            {day.items?.length === 1 ? "exercise" : "exercises"}
                          </span>
                          {day.items && day.items.length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {day.items.reduce(
                                  (sum, item) => sum + (item.sets ?? 0),
                                  0,
                                )}{" "}
                                sets
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Copy className="ml-4 h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-base font-semibold mb-1">
                  No other days available
                </p>
                <p className="text-muted-foreground text-sm">
                  Create more workout days to copy exercises between them
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

