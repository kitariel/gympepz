/**
 * Exercise selection dialog component
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, Dumbbell } from "lucide-react";
import type { ExerciseConfig } from "../../_types";
import type { Exercise } from "../../_types/exercise";

interface ExerciseSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
  selectedExercise: string | null;
  exerciseConfig: ExerciseConfig;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExerciseSelect: (exerciseId: string) => void;
  onExerciseDeselect: () => void;
  onConfigChange: (config: Partial<ExerciseConfig>) => void;
  onAddExercise: () => void;
  canAdd: boolean;
}

export function ExerciseSelectionDialog({
  open,
  onOpenChange,
  exercises,
  selectedExercise,
  exerciseConfig,
  searchQuery,
  onSearchChange,
  onExerciseSelect,
  onExerciseDeselect,
  onConfigChange,
  onAddExercise,
  canAdd,
}: ExerciseSelectionDialogProps) {
  const selectedExerciseData = exercises.find(
    (e) => e.id === selectedExercise,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedExercise ? (
            <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {selectedExerciseData?.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Configure sets, reps, and weight
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onExerciseDeselect}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={exerciseConfig.sets}
                    onChange={(e) =>
                      onConfigChange({
                        sets: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={exerciseConfig.reps}
                    onChange={(e) =>
                      onConfigChange({
                        reps: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Optional"
                    value={exerciseConfig.weight ?? ""}
                    onChange={(e) =>
                      onConfigChange({
                        weight:
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onExerciseDeselect}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={onAddExercise}
                  disabled={!canAdd}
                >
                  Add Exercise
                </Button>
              </div>
            </div>
          ) : (
            <>
              {exercises.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <Dumbbell className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No exercises found</p>
                  <p className="mt-1 text-xs">
                    Try adjusting your search or select a different body part
                  </p>
                </div>
              ) : (
                <div className="grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3">
                  {exercises.map((ex) => (
                    <Card
                      key={ex.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => onExerciseSelect(ex.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <Dumbbell className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {ex.name}
                            </p>
                            <Badge variant="outline" className="mt-1 text-[9px]">
                              {ex.muscleGroup}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

