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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Dumbbell,
  Save,
  Eye,
  Calendar,
  Pencil,
  Copy,
  MoreVertical,
  ChevronRight,
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
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState("");

  const plan = api.plan.get.useQuery({ id }, { enabled: !!id });
  const updateMeta = api.plan.updateMeta.useMutation();
  const addDay = api.plan.addDay.useMutation();
  const addEx = api.plan.addExercise.useMutation();
  const updItem = api.plan.updateItem.useMutation();
  const delItem = api.plan.deleteItem.useMutation();
  const deleteDay = api.plan.deleteDay.useMutation();
  const updateDay = api.plan.updateDay.useMutation();
  const duplicateDay = api.plan.duplicateDay.useMutation();
  const copyExercises = api.plan.copyExercises.useMutation();
  const [copyFromDayId, setCopyFromDayId] = useState<string | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

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

  const handleStartEditDay = (dayId: string, currentTitle: string) => {
    setEditingDayId(dayId);
    setEditingDayTitle(currentTitle);
  };

  const handleSaveDayTitle = async (dayId: string) => {
    if (!editingDayTitle.trim()) return;
    await updateDay.mutateAsync({ id: dayId, title: editingDayTitle });
    setEditingDayId(null);
    setEditingDayTitle("");
    await plan.refetch();
  };

  const handleCancelEditDay = () => {
    setEditingDayId(null);
    setEditingDayTitle("");
  };

  const handleDuplicateDay = async (dayId: string) => {
    if (!id) return;
    await duplicateDay.mutateAsync({ dayId, planId: id });
    await plan.refetch();
  };

  const handleOpenCopyDialog = (dayId: string) => {
    setCopyFromDayId(dayId);
    setIsCopyDialogOpen(true);
  };

  const handleCopyExercises = async (targetDayId: string) => {
    if (!copyFromDayId) return;
    await copyExercises.mutateAsync({
      sourceDayId: copyFromDayId,
      targetDayId,
    });
    setIsCopyDialogOpen(false);
    setCopyFromDayId(null);
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
    <div className="flex-1 space-y-3 sm:space-y-4 p-4 sm:p-6 pt-4">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 sm:h-8 sm:w-8 shrink-0" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Edit Plan</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Customize your workout program
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => router.push(`/portal/log`)} 
          className="gap-2 w-full sm:w-auto h-9 sm:h-8"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Preview</span>
          <span className="sm:hidden">View Logs</span>
        </Button>
      </div>

      {/* Plan Name - Responsive */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 sm:px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-4 pb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Plan name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveName();
                }
              }}
              className="h-10 sm:h-9 flex-1"
            />
            <Button
              size="sm"
              onClick={handleSaveName}
              disabled={updateMeta.isPending || !planName}
              className="h-10 sm:h-9 w-full sm:w-auto"
            >
              <Save className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5" />
              {updateMeta.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {p?.days?.length ?? 0} {p?.days?.length === 1 ? 'day' : 'days'}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>{totalExercises} {totalExercises === 1 ? 'exercise' : 'exercises'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold">Workout Days</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Each day represents a workout session (e.g., "Monday - Push Day", "Leg Day")
            </p>
          </div>
          <Dialog
            open={isAddDayDialogOpen}
            onOpenChange={setIsAddDayDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 w-full sm:w-auto h-10 sm:h-8">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Workout Day</span>
                <span className="sm:hidden">Add Day</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add New Workout Day</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  A workout day is a collection of exercises you'll do together in one session.
                </p>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Day Name</label>
                  <Input
                    placeholder="e.g., Monday - Push Day, Leg Day, Upper Body"
                    value={newDayTitle}
                    onChange={(e) => setNewDayTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddDay();
                      }
                    }}
                    className="h-10 sm:h-9"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Use descriptive names like "Push Day", "Pull Day", or day of the week.
                  </p>
                </div>
                <Button
                  className="w-full h-10 sm:h-9"
                  onClick={handleAddDay}
                  disabled={!newDayTitle || addDay.isPending}
                >
                  {addDay.isPending ? "Adding..." : "Create Workout Day"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {(p?.days ?? []).length === 0 ? (
          <Card className="border-0 shadow-sm border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-3 rounded-full bg-muted mb-4">
                <Dumbbell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-2">Create Your First Workout Day</h3>
              <p className="text-sm text-muted-foreground mb-1 text-center max-w-md">
                A <strong>workout day</strong> is a set of exercises you do together (like "Push Day" or "Leg Day").
              </p>
              <p className="text-xs text-muted-foreground mb-6 text-center max-w-md">
                Once created, you can add exercises to it (like Bench Press, Squats, etc.).
              </p>
              <Button size="sm" onClick={() => setIsAddDayDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Workout Day
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {(p?.days ?? []).map((day: any, dayIndex: number) => (
              <Card 
                key={day.id} 
                className="border-0 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group border-2 border-transparent"
                onClick={() => setSelectedDayId(day.id)}
              >
                <CardHeader className="px-4 sm:px-4 pt-4 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                      {editingDayId === day.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingDayTitle}
                            onChange={(e) => setEditingDayTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveDayTitle(day.id);
                              } else if (e.key === "Escape") {
                                handleCancelEditDay();
                              }
                            }}
                            className="h-9 sm:h-8 text-sm font-semibold flex-1"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 shrink-0"
                            onClick={() => handleSaveDayTitle(day.id)}
                            disabled={updateDay.isPending || !editingDayTitle.trim()}
                          >
                            <Save className="h-4 w-4 sm:h-3 sm:w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-8 sm:w-8 shrink-0"
                            onClick={handleCancelEditDay}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base sm:text-lg font-semibold truncate">
                                {day.title}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditDay(day.id, day.title);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs font-normal">
                                {day.items?.length ?? 0} {day.items?.length === 1 ? 'exercise' : 'exercises'}
                              </Badge>
                              {(day.items ?? []).length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {day.items.reduce((sum: number, item: any) => sum + (item.sets || 0), 0)} total sets
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 sm:h-8 sm:w-8 opacity-70 hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px]">
                          <DropdownMenuItem
                            onClick={() => handleDuplicateDay(day.id)}
                            disabled={duplicateDay.isPending}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Day
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenCopyDialog(day.id)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Exercises To...
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteDay(day.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Day
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}

            {/* Exercise Drawer/Sheet */}
            {selectedDayId && (() => {
              const selectedDay = (p?.days ?? []).find((d: any) => d.id === selectedDayId);
              if (!selectedDay) return null;

              return (
                <Sheet open={!!selectedDayId} onOpenChange={(open) => !open && setSelectedDayId(null)}>
                  <SheetContent side="bottom" className="w-full max-h-[95vh] sm:max-h-[92vh] md:max-h-[85vh] overflow-y-auto p-0 flex flex-col">
                    <SheetHeader className="sticky top-0 bg-background z-10 pb-4 pt-6 px-6 border-b">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {editingDayId === selectedDay.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingDayTitle}
                                onChange={(e) => setEditingDayTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveDayTitle(selectedDay.id);
                                  } else if (e.key === "Escape") {
                                    handleCancelEditDay();
                                  }
                                }}
                                className="h-9 text-base font-semibold flex-1"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => handleSaveDayTitle(selectedDay.id)}
                                disabled={updateDay.isPending || !editingDayTitle.trim()}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={handleCancelEditDay}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <>
                              <SheetTitle className="text-xl sm:text-2xl">{selectedDay.title}</SheetTitle>
                              <SheetDescription className="mt-2">
                                {selectedDay.items?.length ?? 0} {selectedDay.items?.length === 1 ? 'exercise' : 'exercises'}
                                {(selectedDay.items ?? []).length > 0 && (
                                  <span className="ml-2">
                                    • {selectedDay.items.reduce((sum: number, item: any) => sum + (item.sets || 0), 0)} total sets
                                  </span>
                                )}
                              </SheetDescription>
                            </>
                          )}
                        </div>
                        {editingDayId !== selectedDay.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => handleStartEditDay(selectedDay.id, selectedDay.title)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-4">
                      {/* Add Exercise Button */}
                      <Button
                        className="w-full h-11 gap-2"
                        onClick={() => {
                          setTargetDayId(selectedDay.id);
                          setIsAddExerciseDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Exercise
                      </Button>

                      {/* Exercise List */}
                      {(selectedDay.items ?? []).length > 0 ? (
                        <div className="space-y-4">
                          {(selectedDay.items ?? []).map((item: any, itemIndex: number) => (
                            <Card key={item.id} className="border shadow-sm">
                              <CardContent className="p-5 sm:p-4 space-y-4">
                                {/* Exercise Header */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-base mb-2">
                                      {item.exercise?.name ?? item.exerciseId}
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                      {item.exercise?.muscleGroup && (
                                        <Badge variant="outline" className="text-xs">
                                          {item.exercise.muscleGroup}
                                        </Badge>
                                      )}
                                      {item.exercise?.equipment && (
                                        <Badge variant="outline" className="text-xs">
                                          {item.exercise.equipment}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 shrink-0"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Sets/Reps/Weight */}
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Sets</label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
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
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Reps</label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
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
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Weight (kg)</label>
                                    <Input
                                      type="number"
                                      className="h-10 text-base"
                                      value={item.weight ?? ""}
                                      placeholder="0"
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
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 px-4">
                          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <h3 className="font-semibold mb-2 text-lg">No exercises yet</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Add your first exercise to this workout day
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setTargetDayId(selectedDay.id);
                              setIsAddExerciseDialogOpen(true);
                            }}
                            className="h-11"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Exercise
                          </Button>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              );
            })()}
          </>
        )}
      </div>

      {/* Add Exercise Dialog - Responsive */}
      <Dialog
        open={isAddExerciseDialogOpen}
        onOpenChange={setIsAddExerciseDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">Add Exercise to Workout Day</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Search and select exercises to add to this workout session.
            </p>
          </DialogHeader>
          <div className="space-y-4 pt-4 flex-1 flex flex-col min-h-0">
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 sm:h-9 flex-shrink-0"
            />
            <div className="max-h-[50vh] sm:max-h-[400px] overflow-y-auto space-y-2 flex-1">
              {exercises.data?.map((ex) => (
                <Button
                  key={ex.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 sm:py-2.5"
                  onClick={() => handleAddExercise(ex.id)}
                >
                  <div className="flex items-start gap-2.5 sm:gap-2 text-left w-full">
                    <Dumbbell className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-xs">{ex.name}</p>
                      <div className="flex gap-1.5 mt-1.5 sm:mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] sm:text-[9px] px-2 py-0.5 sm:px-1.5 sm:py-0">
                          {ex.muscleGroup}
                        </Badge>
                        {ex.equipment && (
                          <Badge variant="outline" className="text-[10px] sm:text-[9px] px-2 py-0.5 sm:px-1.5 sm:py-0">
                            {ex.equipment}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
              {searchQuery && exercises.data?.length === 0 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-6 sm:py-4">
                  No exercises found.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy Exercises Dialog - Responsive */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Copy Exercises To...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Select a day to copy exercises to:
            </p>
            <div className="max-h-[50vh] sm:max-h-[300px] overflow-y-auto space-y-2">
              {(p?.days ?? [])
                .filter((d: any) => d.id !== copyFromDayId)
                .map((day: any) => (
                  <Button
                    key={day.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 sm:py-2.5"
                    onClick={() => handleCopyExercises(day.id)}
                    disabled={copyExercises.isPending}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{day.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {day.items?.length ?? 0} {day.items?.length === 1 ? 'exercise' : 'exercises'}
                        </p>
                      </div>
                      <Copy className="h-4 w-4 ml-2 shrink-0" />
                    </div>
                  </Button>
                ))}
              {(p?.days ?? []).filter((d: any) => d.id !== copyFromDayId).length === 0 && (
                <p className="text-center text-xs sm:text-sm text-muted-foreground py-6 sm:py-4">
                  No other days available.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
