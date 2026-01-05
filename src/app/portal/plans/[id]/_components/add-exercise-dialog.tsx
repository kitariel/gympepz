/**
 * Dialog component for adding exercises to a workout day
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus } from "lucide-react";
import type { Exercise } from "../_types";

// Note: Exercise type from API might differ slightly, but structure matches

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  exercises: Exercise[] | undefined;
  onAddExercise: (exerciseId: string) => void;
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  searchQuery,
  onSearchChange,
  exercises,
  onAddExercise,
}: AddExerciseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col sm:max-h-[85vh]">
        <DialogHeader className="flex-shrink-0 space-y-3 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Add Exercise to Workout
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            Search and select exercises from your library to add to this workout
            day
          </p>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col space-y-5 pt-2">
          <div className="relative">
            <Input
              placeholder="Search exercises by name, muscle group, or equipment..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 text-base border-2 focus:border-primary transition-colors pr-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                onClick={() => onSearchChange("")}
              >
                ×
              </Button>
            )}
          </div>
          <div className="max-h-[50vh] flex-1 space-y-2 overflow-y-auto sm:max-h-[450px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            {exercises && exercises.length > 0 ? (
              exercises.map((ex) => (
                <Card
                  key={ex.id}
                  className="cursor-pointer border-2 transition-all hover:border-primary/50 hover:shadow-md group"
                  onClick={() => onAddExercise(ex.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex w-full items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Dumbbell className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <h4 className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                          {ex.name}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs px-2.5 py-1 font-medium border-primary/20"
                          >
                            {ex.muscleGroup}
                          </Badge>
                          {ex.equipment && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-2.5 py-1 font-medium"
                            >
                              {ex.equipment}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Plus className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : searchQuery ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-base font-semibold mb-1">
                  No exercises found
                </p>
                <p className="text-muted-foreground text-sm">
                  Try a different search term or check your exercise library
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4 animate-pulse" />
                <p className="text-muted-foreground text-sm">
                  Start typing to search exercises...
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

