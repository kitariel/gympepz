"use client";

import { useMemo, useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlanCard } from "./_components/plan-card";
import { PlanTemplates } from "./_components/plan-templates";
import { Plus, Dumbbell, Star, Folder, Sparkles } from "lucide-react";
import { TEMPLATE_DEFINITIONS } from "./_components/template-exercises";

export default function PlansPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [selectedPlanForStart, setSelectedPlanForStart] = useState<string | null>(null);

  const list = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });
  const create = api.plan.create.useMutation();
  const duplicate = api.plan.duplicate.useMutation();
  const deletePlan = api.plan.delete.useMutation();
  const setActive = api.plan.setActive.useMutation();

  const plans = list.data ?? [];
  const activePlan = plans.find((p) => p.isActive);
  const filteredPlans = useMemo(() => {
    if (selectedTab === "active") {
      return plans.filter((p) => p.isActive);
    }
    return plans;
  }, [plans, selectedTab]);

  // Get today's workout to check if it has exercises
  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId },
    { enabled: !!userId && !!activePlan },
  );
  
  const toggleRestDay = api.plan.toggleRestDay.useMutation();

  const stats = useMemo(() => {
    return {
      total: plans.length,
      active: plans.filter((p) => p.isActive).length,
      totalDays: plans.reduce((sum, p) => sum + (p.daysCount || 0), 0),
    };
  }, [plans]);

  const handleCreatePlan = async () => {
    if (!userId || !newPlanName) return;
    const newPlan = await create.mutateAsync({
      userId,
      name: newPlanName,
      days: [],
    });
    setNewPlanName("");
    setIsCreateDialogOpen(false);
    await list.refetch();

    // Show success and guide user
    if (newPlan) {
      // Auto-set first plan as active if no active plan exists
      const plansList = await list.refetch();
      const hasActivePlan = plansList.data?.some((p) => p.isActive);
      if (!hasActivePlan) {
        await setActive.mutateAsync({ userId, planId: newPlan.id });
      }
    }
  };

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const exercises = api.exercise.list.useQuery(
    { take: 500 }, // Get all exercises to match template names
    { enabled: !!selectedTemplate },
  );

  const handleCreateFromTemplate = async (templateId: string) => {
    if (!userId || !newPlanName) return;

    const template = TEMPLATE_DEFINITIONS[templateId];
    if (!template) {
      // Fallback to empty plan
      await handleCreatePlan();
      return;
    }

    // Resolve exercise names to IDs (handle equipment prefixes)
    // Exercise names might be "Bench Press" or "Barbell Bench Press", so match flexibly
    const findExerciseId = (name: string): string | null => {
      const searchName = name.toLowerCase().trim();
      // Try exact match first
      let found = (exercises.data ?? []).find(
        (ex) => ex.name.toLowerCase() === searchName,
      );

      if (found) return found.id;

      // Try partial match (in case of equipment prefix: "Barbell Bench Press" matches "Bench Press")
      found = (exercises.data ?? []).find((ex) => {
        const exName = ex.name.toLowerCase();
        return exName.includes(searchName) || searchName.includes(exName);
      });

      // If still not found, try reverse match (search name contains exercise name)
      found ??= (exercises.data ?? []).find((ex) => {
        const exName = ex.name.toLowerCase();
        // Check if search name is at the end (e.g., "Bench Press" matches "Barbell Bench Press")
        return exName.endsWith(searchName) || exName.includes(` ${searchName}`);
      });

      return found?.id ?? null;
    };

    const days = template.days.map((day, idx) => ({
      title: day.title,
      order: idx,
      items: day.exerciseNames
        .map((exDef) => {
          const exerciseId = findExerciseId(exDef.name);
          if (!exerciseId) {
            // Skip if exercise not found (user can add manually later)
            return null;
          }
          return {
            exerciseId,
            sets: exDef.sets,
            reps: exDef.reps,
            weight: exDef.weight,
          };
        })
        .filter((item) => item !== null),
    }));

    const newPlan = await create.mutateAsync({
      userId,
      name: newPlanName,
      days: days.map((day) => ({
        title: day.title,
        order: day.order,
        items: day.items.filter((item) => item !== null) as {
          exerciseId: string;
          reps: number;
          sets: number;
          weight?: number;
        }[],
      })),
    });
    setNewPlanName("");
    setSelectedTemplate(null);
    setIsCreateDialogOpen(false);
    await list.refetch();

    // Auto-set first plan as active if no active plan exists
    const plansList = await list.refetch();
    const hasActivePlan = plansList.data?.some((p) => p.isActive);
    if (!hasActivePlan && newPlan) {
      await setActive.mutateAsync({ userId, planId: newPlan.id });
    }

    // Navigate to the new plan for editing
    router.push(`/portal/plans/${newPlan.id}`);
  };

  const handleDuplicate = async (planId: string) => {
    await duplicate.mutateAsync({ id: planId });
    await list.refetch();
  };

  const handleDelete = async (planId: string) => {
    await deletePlan.mutateAsync({ id: planId });
    await list.refetch();
  };

  const handleSetActive = async (planId: string) => {
    if (!userId) return;
    await setActive.mutateAsync({ userId, planId });
    await list.refetch();
  };

  const handleStartWorkout = async (planId: string) => {
    // Check if this plan is the active plan
    const isActivePlan = activePlan?.id === planId;
    
    if (isActivePlan) {
      // Check if today is a rest day first
      if (todaysWorkout.data?.todayWorkout?.isRestDay) {
        // It's a rest day - show rest day message
        setSelectedPlanForStart(planId);
        setShowRestDayDialog(true);
        return;
      }
      
      // Check if today's workout has exercises
      const hasExercises = todaysWorkout.data?.todayWorkout?.exercises && 
                          todaysWorkout.data.todayWorkout.exercises.length > 0;
      
      if (!hasExercises && todaysWorkout.data?.todayWorkout) {
        // No exercises - show rest day dialog
        setSelectedPlanForStart(planId);
        setShowRestDayDialog(true);
        return;
      }
    }
    
    // Navigate to quick start workout
    router.push(`/portal/log?quickStart=${planId}`);
  };

  const handleRestDayChoice = async (action: 'skip' | 'add' | 'mark') => {
    setShowRestDayDialog(false);
    
    if (action === 'skip') {
      // User confirms it's a rest day
      setSelectedPlanForStart(null);
      return;
    } else if (action === 'mark') {
      // User wants to mark today as rest day
      if (todaysWorkout.data?.todayWorkout?.id) {
        await toggleRestDay.mutateAsync({ id: todaysWorkout.data.todayWorkout.id });
        await todaysWorkout.refetch();
      }
      setSelectedPlanForStart(null);
      return;
    } else {
      // User wants to add exercises - redirect to plan editor
      if (selectedPlanForStart) {
        router.push(`/portal/plans/${selectedPlanForStart}`);
        setSelectedPlanForStart(null);
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6 md:pt-4">
      {/* Enhanced Header - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Workout Plans</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage your workout programs and training splits
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/portal/ai-planner")}
            className="gap-2 h-9 text-xs sm:text-sm flex-1 sm:flex-initial min-w-[120px] sm:min-w-0"
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">AI Generator</span>
            <span className="xs:hidden">AI</span>
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 h-9 text-xs sm:text-sm flex-1 sm:flex-initial min-w-[120px] sm:min-w-0">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Quick Create */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Create from Scratch</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter plan name (e.g., My Custom Split)"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void handleCreatePlan();
                        }
                      }}
                    />
                    <Button
                      onClick={handleCreatePlan}
                      disabled={!newPlanName || create.isPending}
                    >
                      {create.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </div>

                {/* Templates */}
                <PlanTemplates
                  onSelectTemplate={(template) => {
                    setNewPlanName(template.name);
                    setSelectedTemplate(template.id);
                    // Pre-load exercises when template is selected
                  }}
                />
                {selectedTemplate && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="text-muted-foreground text-sm">
                      Template selected:{" "}
                      {TEMPLATE_DEFINITIONS[selectedTemplate]?.name}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedTemplate(null);
                          setNewPlanName("");
                        }}
                      >
                        Clear Template
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() =>
                          handleCreateFromTemplate(selectedTemplate)
                        }
                        disabled={
                          !newPlanName ||
                          create.isPending ||
                          exercises.isLoading ||
                          !exercises.data
                        }
                      >
                        {create.isPending
                          ? "Creating..."
                          : exercises.isLoading
                            ? "Loading..."
                            : `Create Plan with Template`}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats - Responsive Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-3 sm:p-4">
            <CardContent className="px-0 pt-0 pb-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">Total Plans</p>
                </div>
                <div className="bg-blue-500/20 rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform">
                  <Folder className="text-blue-600 h-4 w-4 sm:h-5 sm:w-5 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3 sm:p-4">
            <CardContent className="px-0 pt-0 pb-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">Active Plans</p>
                </div>
                <div className="bg-amber-500/20 rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform">
                  <Star className="text-amber-600 h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-3 sm:p-4">
            <CardContent className="px-0 pt-0 pb-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalDays}</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">Total Days</p>
                </div>
                <div className="bg-purple-500/20 rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform">
                  <Dumbbell className="text-purple-600 h-4 w-4 sm:h-5 sm:w-5 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="h-9 sm:h-10 w-full sm:w-auto">
          <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4">
            <Folder className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">All</span>
            <span className="xs:hidden">All</span>
            <span className="hidden sm:inline"> ({plans.length})</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4">
            <Star className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Active</span>
            <span className="xs:hidden">Active</span>
            <span className="hidden sm:inline"> ({stats.active})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  id={plan.id}
                  name={plan.name}
                  daysCount={plan.daysCount || 0}
                  isActive={plan.isActive}
                  createdAt={new Date(plan.createdAt as unknown as string)}
                  updatedAt={new Date(plan.updatedAt as unknown as string)}
                  onSetActive={() => handleSetActive(plan.id)}
                  onDuplicate={() => handleDuplicate(plan.id)}
                  onDelete={() => handleDelete(plan.id)}
                  onStartWorkout={() => handleStartWorkout(plan.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                <div className="bg-muted/50 rounded-full p-4 mb-4">
                  <Dumbbell className="text-muted-foreground h-12 w-12 opacity-60" />
                </div>
                <h3 className="mb-2 text-lg font-bold">No plans yet</h3>
                <p className="text-muted-foreground mb-6 text-center text-sm max-w-md">
                  Create your first workout plan or generate one with AI
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2 h-10"
                  >
                    <Plus className="h-4 w-4" />
                    Create Plan
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push("/portal/ai-planner")}
                    className="gap-2 h-10"
                  >
                    <Sparkles className="h-4 w-4" />
                    AI Generator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-4">
          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  id={plan.id}
                  name={plan.name}
                  daysCount={plan.daysCount || 0}
                  isActive={true}
                  createdAt={new Date(plan.createdAt as unknown as string)}
                  updatedAt={new Date(plan.updatedAt as unknown as string)}
                  onDuplicate={() => handleDuplicate(plan.id)}
                  onDelete={() => handleDelete(plan.id)}
                  onStartWorkout={() => handleStartWorkout(plan.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="bg-amber-500/10 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                  <Star className="text-amber-600 h-10 w-10 sm:h-12 sm:w-12 opacity-60 dark:text-amber-400" />
                </div>
                <h3 className="mb-2 text-base sm:text-lg font-bold">No active plan</h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-center text-xs sm:text-sm max-w-md">
                  Set a plan as active to start tracking your workouts
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTab("all")}
                  className="h-10 text-xs sm:text-sm w-full sm:w-auto"
                >
                  View All Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Rest Day / No Exercises Dialog */}
      <Dialog open={showRestDayDialog} onOpenChange={setShowRestDayDialog}>
        <DialogContent>
          <DialogHeader>
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <>
                <DialogTitle>It&apos;s Your Rest Day Today</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data.todayWorkout.title
                    ? `Today is scheduled as a rest day for "${todaysWorkout.data.todayWorkout.title}". Take time to recover and let your muscles heal.`
                    : "Today is scheduled as a rest day. Take time to recover and let your muscles heal."}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>No Exercises for Today&apos;s Workout</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data?.todayWorkout?.title
                    ? `Today's workout "${todaysWorkout.data.todayWorkout.title}" doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?`
                    : "Today's workout doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?"}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 mt-4">
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <Button
                variant="default"
                onClick={() => handleRestDayChoice('skip')}
                className="w-full"
              >
                Got It
              </Button>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => handleRestDayChoice('skip')}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={() => handleRestDayChoice('add')}
                    className="flex-1"
                  >
                    Add Exercises
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRestDayChoice('mark')}
                  className="w-full"
                >
                  Mark Today as Rest Day
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
