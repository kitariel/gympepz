"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Save,
  Dumbbell,
  Calendar,
  Target,
  Wrench,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";

type Item = {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
};

export default function WorkoutBuilderPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");

  // Plan state
  const [name, setName] = useState("");
  const [days, setDays] = useState<{ title: string; items: Item[] }[]>([
    { title: "Push Day", items: [] },
  ]);

  // Exercise selection dialog
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [targetDayIdx, setTargetDayIdx] = useState<number | null>(null);

  // Exercise query with filters
  const exercisesQuery = api.exercise.list.useQuery({
    q: searchQuery || undefined,
    muscleGroup: selectedMuscle !== "All" ? selectedMuscle : undefined,
    equipment: selectedEquipment !== "All" ? selectedEquipment : undefined,
    take: 100,
  });

  const exercises = exercisesQuery.data ?? [];

  const create = api.plan.create.useMutation({
    onSuccess: (plan) => {
      router.push(`/portal/plans/${plan.id}`);
    },
  });

  const addDay = () => {
    setDays((d) => [...d, { title: "New Day", items: [] }]);
  };

  const deleteDay = (dayIdx: number) => {
    setDays((d) => d.filter((_, i) => i !== dayIdx));
  };

  const openExerciseDialog = (dayIdx: number) => {
    setTargetDayIdx(dayIdx);
    setIsExerciseDialogOpen(true);
  };

  const addExercise = (exerciseId: string) => {
    if (targetDayIdx === null) return;
    setDays((d) => {
      const next = [...d];
      next[targetDayIdx]!.items.push({
        exerciseId,
        sets: 3,
        reps: 10,
        weight: undefined,
      });
      return next;
    });
    setIsExerciseDialogOpen(false);
    setSearchQuery("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
  };

  const updateItem = (
    dayIdx: number,
    itemIdx: number,
    field: "sets" | "reps" | "weight",
    value: number
  ) => {
    setDays((d) => {
      const next = [...d];
      const item = next[dayIdx]!.items[itemIdx]!;
      next[dayIdx]!.items[itemIdx] = { ...item, [field]: value };
      return next;
    });
  };

  const deleteItem = (dayIdx: number, itemIdx: number) => {
    setDays((d) => {
      const next = [...d];
      next[dayIdx]!.items = next[dayIdx]!.items.filter((_, i) => i !== itemIdx);
      return next;
    });
  };

  const save = async () => {
    if (!userId || !name || days.length === 0) return;
    await create.mutateAsync({
      userId,
      name,
      days: days.map((d, i) => ({
        title: d.title,
        order: i,
        items: d.items.map((item) => ({
          exerciseId: item.exerciseId,
          sets: item.sets,
          reps: item.reps,
          weight: item.weight,
        })),
      })),
    });
  };

  const totalExercises = days.reduce((sum, d) => sum + d.items.length, 0);
  const canSave = userId && name.trim() && days.length > 0;

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout Builder</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create a custom workout plan
          </p>
        </div>
        <Button
          onClick={save}
          disabled={!canSave || create.isPending}
          className="gap-2"
          size="sm"
        >
          <Save className="h-4 w-4" />
          {create.isPending ? "Saving..." : "Save Plan"}
        </Button>
      </div>

      {/* Plan Name - Compact */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          <Input
            placeholder="Enter plan name (e.g., My Strength Program)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
          />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {days.length} {days.length === 1 ? "day" : "days"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3 w-3" />
              {totalExercises} {totalExercises === 1 ? "exercise" : "exercises"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Workout Days</h3>
          <Button size="sm" onClick={addDay} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Day
          </Button>
        </div>

        {days.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Dumbbell className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-base font-semibold mb-1">No workout days yet</h3>
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Add your first workout day to get started
              </p>
              <Button size="sm" onClick={addDay} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Day
              </Button>
            </CardContent>
          </Card>
        ) : (
          days.map((day, dayIdx) => (
            <Card key={dayIdx} className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={day.title}
                    onChange={(e) =>
                      setDays((prev) =>
                        prev.map((d, i) =>
                          i === dayIdx ? { ...d, title: e.target.value } : d
                        )
                      )
                    }
                    className="h-8 text-sm font-semibold flex-1"
                    placeholder="Day title (e.g., Monday - Push)"
                  />
                  {days.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteDay(dayIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {/* Add Exercise Button */}
                <Dialog
                  open={isExerciseDialogOpen && targetDayIdx === dayIdx}
                  onOpenChange={(open) => {
                    setIsExerciseDialogOpen(open);
                    if (!open) {
                      setTargetDayIdx(null);
                      setSearchQuery("");
                      setSelectedMuscle("All");
                      setSelectedEquipment("All");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed gap-2"
                      onClick={() => openExerciseDialog(dayIdx)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Exercise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Exercise</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {/* Search and Filters */}
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search exercises..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-9"
                          />
                          {searchQuery && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                              onClick={() => setSearchQuery("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={selectedMuscle}
                            onValueChange={setSelectedMuscle}
                          >
                            <SelectTrigger className="h-9">
                              <Target className="h-3.5 w-3.5 mr-2" />
                              <SelectValue placeholder="Muscle Group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Muscle Groups</SelectItem>
                              <SelectItem value="Chest">Chest</SelectItem>
                              <SelectItem value="Back">Back</SelectItem>
                              <SelectItem value="Shoulders">Shoulders</SelectItem>
                              <SelectItem value="Arms">Arms</SelectItem>
                              <SelectItem value="Legs">Legs</SelectItem>
                              <SelectItem value="Core">Core</SelectItem>
                              <SelectItem value="Glutes">Glutes</SelectItem>
                              <SelectItem value="Calves">Calves</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedEquipment}
                            onValueChange={setSelectedEquipment}
                          >
                            <SelectTrigger className="h-9">
                              <Wrench className="h-3.5 w-3.5 mr-2" />
                              <SelectValue placeholder="Equipment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Equipment</SelectItem>
                              <SelectItem value="Barbell">Barbell</SelectItem>
                              <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                              <SelectItem value="Cable">Cable</SelectItem>
                              <SelectItem value="Machine">Machine</SelectItem>
                              <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                              <SelectItem value="Kettlebell">Kettlebell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Exercise List */}
                      <div className="max-h-[400px] overflow-y-auto space-y-1.5">
                        {exercises.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No exercises found</p>
                          </div>
                        ) : (
                          exercises.map((ex) => (
                            <Button
                              key={ex.id}
                              variant="ghost"
                              className="w-full justify-start h-auto p-3 hover:bg-accent"
                              onClick={() => addExercise(ex.id)}
                            >
                              <div className="flex items-start gap-3 w-full text-left">
                                <div className="p-1.5 rounded bg-teal-100 dark:bg-teal-900/30 shrink-0">
                                  <Dumbbell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{ex.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-[9px] px-1.5 py-0 h-4"
                                    >
                                      {ex.muscleGroup}
                                    </Badge>
                                    {ex.equipment && (
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] px-1.5 py-0 h-4"
                                      >
                                        {ex.equipment}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Exercise Items */}
                {day.items.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                    <p>No exercises added yet</p>
                    <p className="text-xs mt-1">Click "Add Exercise" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {day.items.map((item, itemIdx) => {
                      const exercise = exercises.find((e) => e.id === item.exerciseId);
                      return (
                        <div
                          key={itemIdx}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {exercise?.name ?? "Unknown Exercise"}
                            </p>
                            {exercise && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 mt-1"
                              >
                                {exercise.muscleGroup}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={item.sets}
                                onChange={(e) =>
                                  updateItem(
                                    dayIdx,
                                    itemIdx,
                                    "sets",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-14 h-8 text-center text-xs"
                              />
                              <span className="text-[10px] text-muted-foreground w-8">
                                sets
                              </span>
                            </div>
                            <span className="text-muted-foreground">×</span>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={item.reps}
                                onChange={(e) =>
                                  updateItem(
                                    dayIdx,
                                    itemIdx,
                                    "reps",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-14 h-8 text-center text-xs"
                              />
                              <span className="text-[10px] text-muted-foreground w-10">
                                reps
                              </span>
                            </div>
                            {item.weight !== undefined && (
                              <>
                                <span className="text-muted-foreground">@</span>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={item.weight}
                                    onChange={(e) =>
                                      updateItem(
                                        dayIdx,
                                        itemIdx,
                                        "weight",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 h-8 text-center text-xs"
                                  />
                                  <span className="text-[10px] text-muted-foreground w-6">
                                    kg
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive shrink-0"
                            onClick={() => deleteItem(dayIdx, itemIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
