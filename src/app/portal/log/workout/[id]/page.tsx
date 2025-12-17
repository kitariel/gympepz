"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ActiveWorkoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const logId = params.id;
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  const utils = api.useUtils();
  const log = api.workoutLog.get.useQuery({ id: logId });
  const exercises = api.exercise.list.useQuery(
    { q: exerciseSearch, take: 10 },
    { enabled: isAddingExercise && exerciseSearch.length > 0 }
  );

  const addExercise = api.workoutLog.addExercise.useMutation({
    onSuccess: () => utils.workoutLog.get.invalidate({ id: logId }),
  });

  const updateExercise = api.workoutLog.updateExercise.useMutation({
    onSuccess: () => utils.workoutLog.get.invalidate({ id: logId }),
  });

  const deleteExercise = api.workoutLog.deleteExercise.useMutation({
    onSuccess: () => utils.workoutLog.get.invalidate({ id: logId }),
  });

  const completeWorkout = api.workoutLog.complete.useMutation({
    onSuccess: () => router.push("/portal/log"),
  });

  if (log.isLoading) return <div className="p-8">Loading workout...</div>;
  if (!log.data) return <div className="p-8">Workout not found</div>;

  const workout = log.data;

  // Group exercises by name (since multiple sets are individual rows in WorkoutLogExercise?)
  // Wait, the schema has WorkoutLogExercise which represents ONE set usually?
  // Or is it one row per exercise with sets/reps?
  // Let's check schema: WorkoutLogExercise has sets, reps, weight.
  // It seems like one row = one "slot" in the workout.
  // Typically in a workout app, you have: Exercise -> Set 1, Set 2, Set 3.
  // The current schema is: WorkoutLogExercise { sets, reps, weight }.
  // This implies one row = "3 sets of 10 reps".
  // This is a simplified model. For a true "active mode", users usually want to log EACH set individually.
  // However, based on the schema I implemented earlier:
  // model WorkoutLogExercise { sets Int, reps Int, weight Float? ... }
  // This means "I did X sets of Y reps at Z weight".
  // If a user does 3 sets at different weights, they might need 3 rows or we aggregate.
  // For this implementation, let's treat each WorkoutLogExercise row as a "Set Group" or allow multiple rows per exercise.
  // But standard UI is:
  // Bench Press
  //   Set 1: 100kg x 10 [x]
  //   Set 2: 100kg x 10 [x]
  //
  // To support that with CURRENT schema, we might need to interpret "sets" field differently or just let user edit the summary.
  //
  // ACTUALLY, looking at the schema:
  // model WorkoutLogExercise { sets: Int, reps: Int, weight: Float? }
  // This is a "planned" style schema (e.g. 3x10 @ 100).
  // Real logging often needs per-set granularity.
  //
  // For now, let's stick to the schema: One entry = "I did X sets of Y reps".
  // We can add a "Notes" field for details.
  //
  // OR, we can treat each row as a SINGLE set (sets=1) if the user wants detailed logging.
  // Let's stick to the current schema's intent: Summary of the exercise performance.
  // We will allow editing Sets/Reps/Weight.

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{workout.planDay?.title ?? "Workout"}</h1>
            <p className="text-xs text-muted-foreground">{format(new Date(workout.date), "PPP")}</p>
          </div>
        </div>
        <Button 
          onClick={() => completeWorkout.mutate({ id: logId, completed: true })}
          disabled={completeWorkout.isPending}
        >
          {completeWorkout.isPending ? "Finishing..." : "Finish"}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Notes */}
        <Card>
          <CardContent className="pt-4">
            <Textarea 
              placeholder="Workout notes..." 
              defaultValue={workout.notes ?? ""}
              onBlur={(e) => completeWorkout.mutate({ id: logId, notes: e.target.value })}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Exercises */}
        <div className="space-y-4">
          {workout.exercises.map((item) => (
            <Card key={item.id}>
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">{item.exercise.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteExercise.mutate({ id: item.id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-2 grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Sets</span>
                  <Input 
                    type="number" 
                    defaultValue={item.sets}
                    onBlur={(e) => updateExercise.mutate({ id: item.id, sets: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Reps</span>
                  <Input 
                    type="number" 
                    defaultValue={item.reps}
                    onBlur={(e) => updateExercise.mutate({ id: item.id, reps: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase">Weight (kg)</span>
                  <Input 
                    type="number" 
                    defaultValue={item.weight ?? ""}
                    placeholder="-"
                    onBlur={(e) => updateExercise.mutate({ id: item.id, weight: parseFloat(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Exercise Button */}
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full py-8 border-dashed">
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input 
                placeholder="Search exercises..." 
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
              />
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {exercises.data?.map((ex) => (
                  <Button
                    key={ex.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      addExercise.mutate({
                        workoutLogId: logId,
                        exerciseId: ex.id,
                        sets: 3,
                        reps: 10,
                      });
                      setIsAddingExercise(false);
                      setExerciseSearch("");
                    }}
                  >
                    {ex.name}
                  </Button>
                ))}
                {exerciseSearch && exercises.data?.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No exercises found.
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
