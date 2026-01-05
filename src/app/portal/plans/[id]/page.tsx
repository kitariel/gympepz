"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WeeklyScheduleBoard } from "./_components/weekly-schedule-board";
import { LoadingView } from "./_components/loading-view";
import { PlanHeader } from "./_components/plan-header";
import { PlanNameEditor } from "./_components/plan-name-editor";
import { AddDayDialog } from "./_components/add-day-dialog";
import { AddExerciseDialog } from "./_components/add-exercise-dialog";
import { CopyExercisesDialog } from "./_components/copy-exercises-dialog";
import { ExerciseSheet } from "./_components/exercise-sheet";
import { usePlanDetailData } from "./_hooks/use-plan-detail-data";
import { usePlanDetailMutations } from "./_hooks/use-plan-detail-mutations";
import { useDayOrderManagement } from "./_hooks/use-day-order-management";
import { usePlanDetailHandlers } from "./_hooks/use-plan-detail-handlers";
import type { PlanDay } from "./_types";

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);

  // State management
  const [planName, setPlanName] = useState("");
  const [isAddDayDialogOpen, setIsAddDayDialogOpen] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState("");
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [targetDayId, setTargetDayId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState("");
  const [copyFromDayId, setCopyFromDayId] = useState<string | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // Data hooks
  const data = usePlanDetailData(id, isAddExerciseDialogOpen, searchQuery);
  const mutations = usePlanDetailMutations();
  const { localDays, setLocalDays } = useDayOrderManagement(data.planData);

  // Event handlers
  const handlers = usePlanDetailHandlers({
    planId: id,
    userId,
    data,
    mutations,
    localDays,
    setLocalDays,
  });

  // Get current day of week (0 = Sunday, 6 = Saturday)
  const currentDayOfWeek = new Date().getDay();

  // Initialize plan name from data
  useEffect(() => {
    if (data.planData?.name && !planName) {
      setPlanName(data.planData.name);
    }
  }, [data.planData?.name, planName]);

  // Exercise query is now handled by the hook with enabled flag

  // Handlers
  const handleAddDay = async () => {
    const result = await handlers.handleAddDay(newDayTitle);
    if (result?.shouldOpenDialog) {
      setIsAddDayDialogOpen(true);
      return;
    }
    setNewDayTitle("");
    setIsAddDayDialogOpen(false);
  };

  const handleAddDayFromSlot = async (slot: number, dayName?: string) => {
    setNewDayTitle(dayName ? `${dayName} Workout` : "");
    await handlers.handleAddDay("", slot, dayName);
  };

  const handleAddExercise = async (exerciseId: string) => {
    if (!targetDayId) return;
    await handlers.handleAddExercise(exerciseId, targetDayId);
    setIsAddExerciseDialogOpen(false);
    setSearchQuery("");
  };

  const handleStartEditDay = (dayId: string, currentTitle: string) => {
    setEditingDayId(dayId);
    setEditingDayTitle(currentTitle);
  };

  const handleSaveDayTitle = async (dayId: string) => {
    await handlers.handleSaveDayTitle(dayId, editingDayTitle);
    setEditingDayId(null);
    setEditingDayTitle("");
  };

  const handleCancelEditDay = () => {
    setEditingDayId(null);
    setEditingDayTitle("");
  };

  const handleOpenCopyDialog = (dayId: string) => {
    setCopyFromDayId(dayId);
    setIsCopyDialogOpen(true);
  };

  const handleCopyExercises = async (targetDayId: string) => {
    if (!copyFromDayId) return;
    await handlers.handleCopyExercises(copyFromDayId, targetDayId);
    setIsCopyDialogOpen(false);
    setCopyFromDayId(null);
  };

  const selectedDay = data.planData?.days?.find(
    (d: PlanDay) => d.id === selectedDayId,
  );

  if (data.plan.isLoading) {
    return <LoadingView />;
  }

  return (
    <div className="flex-1 space-y-6 overflow-x-hidden p-4 pt-4 sm:space-y-6 sm:p-6">
      {/* Plan Header */}
      <PlanHeader
        plan={data.planData}
        totalExercises={data.totalExercises}
      />

      {/* Plan Name Editor */}
      <PlanNameEditor
        planName={planName}
        currentPlanName={data.planData?.name}
        onPlanNameChange={setPlanName}
        onSave={() => handlers.handleSaveName(planName)}
        isSaving={mutations.updateMeta.isPending}
      />

      {/* Weekly Schedule */}
      <div className="space-y-5 w-full max-w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Weekly Schedule
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Drag days to reorder • Click empty slots to add workouts • Scroll
              horizontally to view all days
            </p>
          </div>
        </div>

        <WeeklyScheduleBoard
          localDays={localDays}
          currentDayOfWeek={currentDayOfWeek}
          onDragEnd={handlers.handleDragEnd}
          onAddDay={handleAddDayFromSlot}
          onEditDay={(dayId) => {
            const day = data.planData?.days?.find((d) => d.id === dayId);
            if (day) handleStartEditDay(dayId, day.title);
          }}
          onSaveDayTitle={handleSaveDayTitle}
          onCancelEdit={handleCancelEditDay}
          onDeleteDay={handlers.handleDeleteDay}
          onDuplicateDay={handlers.handleDuplicateDay}
          onOpenCopyDialog={handleOpenCopyDialog}
          onOpenDrawer={(dayId) => setSelectedDayId(dayId)}
          onToggleRestDay={handlers.handleToggleRestDay}
          editingDayId={editingDayId}
          editingDayTitle={editingDayTitle}
          onEditingDayTitleChange={setEditingDayTitle}
          updateDay={mutations.updateDay}
          plan={data.planData}
        />
      </div>

      {/* Add Day Dialog */}
      <AddDayDialog
        open={isAddDayDialogOpen}
        onOpenChange={setIsAddDayDialogOpen}
        dayTitle={newDayTitle}
        onDayTitleChange={setNewDayTitle}
        onAdd={handleAddDay}
        isAdding={mutations.addDay.isPending}
      />

      {/* Exercise Sheet */}
      {selectedDay && selectedDayId && (
        <ExerciseSheet
          open={!!selectedDayId}
          onOpenChange={(open) => !open && setSelectedDayId(null)}
          day={selectedDay}
          editingDayId={editingDayId}
          editingDayTitle={editingDayTitle}
          onEditingDayTitleChange={setEditingDayTitle}
          onStartEdit={handleStartEditDay}
          onSaveDayTitle={handleSaveDayTitle}
          onCancelEdit={handleCancelEditDay}
          onAddExercise={() => {
            setTargetDayId(selectedDay.id);
            setIsAddExerciseDialogOpen(true);
          }}
          onDeleteItem={handlers.handleDeleteItem}
          onUpdateItem={handlers.handleUpdateItem}
          onRefetch={() => data.plan.refetch()}
          onExerciseDragEnd={(e) =>
            handlers.handleExerciseDragEnd(e, selectedDay.id)
          }
          isUpdatingDay={mutations.updateDay.isPending}
        />
      )}

      {/* Add Exercise Dialog */}
      <AddExerciseDialog
        open={isAddExerciseDialogOpen}
        onOpenChange={setIsAddExerciseDialogOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        exercises={data.exercises.data}
        onAddExercise={handleAddExercise}
      />

      {/* Copy Exercises Dialog */}
      <CopyExercisesDialog
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        sourceDayId={copyFromDayId}
        days={data.planData?.days ?? []}
        onCopy={handleCopyExercises}
        isCopying={mutations.copyExercises.isPending}
      />
    </div>
  );
}
