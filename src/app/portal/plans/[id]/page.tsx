"use client";

import { useState, useEffect, use } from "react";
import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Dumbbell,
  Save,
  Eye,
  Calendar,
} from "lucide-react";

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [planName, setPlanName] = useState("");
  const [isAddDayDialogOpen, setIsAddDayDialogOpen] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState("");
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [targetDayId, setTargetDayId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const plan = api.plan.get.useQuery({ id }, { enabled: !!id });
  const updateMeta = api.plan.updateMeta.useMutation();
  const addDay = api.plan.addDay.useMutation();
  const addEx = api.plan.addExercise.useMutation();
  const updItem = api.plan.updateItem.useMutation();
  const delItem = api.plan.deleteItem.useMutation();
  const deleteDay = api.plan.deleteDay.useMutation();

  const exercises = api.exercise.list.useQuery(
    { q: searchQuery, take: 20 },
    { enabled: isAddExerciseDialogOpen }
  );

  const p = plan.data as any;

  useEffect(() => {
    if (p?.name && !planName) {
      setPlanName(p.name);
    }
  }, [p?.name, planName]);

  const handleSaveName = async () => {
    if (!id || !planName) return;
    await updateMeta.mutateAsync({ id, name: planName });
    await plan.refetch();
  };

  const handleAddDay = async () => {
    if (!newDayTitle) return;
    await addDay.mutateAsync({
      planId: id,
      title: newDayTitle,
      order: (p?.days?.length ?? 0),
    });
    setNewDayTitle("");
    setIsAddDayDialogOpen(false);
    await plan.refetch();
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Delete this day and all its exercises?")) return;
    await deleteDay.mutateAsync({ id: dayId });
    await plan.refetch();
  };

  const handleAddExercise = async (exerciseId: string) => {
    if (!targetDayId) return;
    await addEx.mutateAsync({
      dayId: targetDayId,
      exerciseId,
      sets: 3,
      reps: 10,
    });
    setIsAddExerciseDialogOpen(false);
    setSearchQuery("");
    await plan.refetch();
  };

  const handleUpdateItem = async (
    itemId: string,
    field: "sets" | "reps" | "weight",
    value: number
  ) => {
    await updItem.mutateAsync({ id: itemId, [field]: value });
  };

  const handleDeleteItem = async (itemId: string) => {
    await delItem.mutateAsync({ id: itemId });
    await plan.refetch();
  };

  if (plan.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Dumbbell className="h-10 w-10 animate-pulse mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading plan...</p>
        </div>
      </div>
    );
  }

  const totalExercises = p?.days?.reduce(
    (sum: number, d: any) => sum + (d.items?.length ?? 0),
    0
  ) ?? 0;

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Plan</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customize your workout program
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => router.push(`/portal/log`)} className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </div>

      {/* Plan Name - Compact */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-2.5">
          <div className="flex gap-2">
            <Input
              placeholder="Plan name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                }
              }}
              className="h-9"
            />
            <Button
              size="sm"
              onClick={handleSaveName}
              disabled={updateMeta.isPending || !planName}
              className="h-9"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {updateMeta.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {p?.days?.length ?? 0} days
            </span>
            <span>•</span>
            <span>{totalExercises} exercises</span>
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Workout Days</h3>
          <Dialog
            open={isAddDayDialogOpen}
            onOpenChange={setIsAddDayDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Day
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Workout Day</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Day title (e.g., Monday - Push Day)"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddDay();
                    }
                  }}
                />
                <Button
                  className="w-full"
                  onClick={handleAddDay}
                  disabled={!newDayTitle || addDay.isPending}
                >
                  {addDay.isPending ? "Adding..." : "Add Day"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {(p?.days ?? []).length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Dumbbell className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-base font-semibold mb-1">No workout days yet</h3>
              <p className="text-xs text-muted-foreground mb-3 text-center">
                Add your first workout day to get started
              </p>
              <Button size="sm" onClick={() => setIsAddDayDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Day
              </Button>
            </CardContent>
          </Card>
        ) : (
          (p?.days ?? []).map((day: any, dayIndex: number) => (
            <Card key={day.id} className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm">{day.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {day.items?.length ?? 0} exercises
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setTargetDayId(day.id);
                        setIsAddExerciseDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1.5" />
                      Add
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteDay(day.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(day.items ?? []).length > 0 && (
                <CardContent className="px-4 pb-4 space-y-2">
                  {(day.items ?? []).map((item: any, itemIndex: number) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-4 gap-2 items-center">
                          <div className="col-span-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {item.exercise?.name ?? item.exerciseId}
                            </p>
                            {item.exercise?.muscleGroup && (
                              <Badge variant="outline" className="text-[9px] mt-1 px-1.5 py-0">
                                {item.exercise.muscleGroup}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Sets:</span>
                            <Input
                              type="number"
                              className="w-16 h-8 text-xs"
                              value={item.sets ?? 3}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "sets",
                                  Number(e.target.value)
                                )
                              }
                              onBlur={() => plan.refetch()}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Reps:</span>
                            <Input
                              type="number"
                              className="w-16 h-8 text-xs"
                              value={item.reps ?? 10}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "reps",
                                  Number(e.target.value)
                                )
                              }
                              onBlur={() => plan.refetch()}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Weight:</span>
                            <Input
                              type="number"
                              className="w-16 h-8 text-xs"
                              value={item.weight ?? ""}
                              placeholder="kg"
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "weight",
                                  Number(e.target.value)
                                )
                              }
                              onBlur={() => plan.refetch()}
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {itemIndex < (day.items?.length ?? 0) - 1 && (
                        <Separator className="mt-2" />
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add Exercise Dialog */}
      <Dialog
        open={isAddExerciseDialogOpen}
        onOpenChange={setIsAddExerciseDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {exercises.data?.map((ex) => (
                <Button
                  key={ex.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-2.5"
                  onClick={() => handleAddExercise(ex.id)}
                >
                  <div className="flex items-start gap-2.5 text-left w-full">
                    <Dumbbell className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{ex.name}</p>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {ex.muscleGroup}
                        </Badge>
                        {ex.equipment && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {ex.equipment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
              {searchQuery && exercises.data?.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  No exercises found.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
