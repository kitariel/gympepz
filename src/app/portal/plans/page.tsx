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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

  const handleStartWorkout = (planId: string) => {
    // Navigate to quick start workout
    router.push(`/portal/log?quickStart=${planId}`);
  };

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout Plans</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Manage your workout programs and training splits
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/portal/ai-planner")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Generator
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
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

      {/* Compact Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="px-4 pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Folder className="text-primary h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-muted-foreground text-xs">Total Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="px-4 pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Star className="text-primary h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.active}</p>
                <p className="text-muted-foreground text-xs">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="px-4 pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 rounded-lg p-2">
                <Dumbbell className="text-secondary-foreground h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalDays}</p>
                <p className="text-muted-foreground text-xs">Total Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="h-9">
          <TabsTrigger value="all" className="gap-1.5 text-xs sm:text-sm">
            <Folder className="h-3.5 w-3.5" />
            All ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-1.5 text-xs sm:text-sm">
            <Star className="h-3.5 w-3.5" />
            Active ({stats.active})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {filteredPlans.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Dumbbell className="text-muted-foreground mb-3 h-10 w-10 opacity-50" />
                <h3 className="mb-1 text-base font-semibold">No plans yet</h3>
                <p className="text-muted-foreground mb-3 text-center text-xs">
                  Create your first workout plan or generate one with AI
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Plan
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push("/portal/ai-planner")}
                    className="gap-2"
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
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Star className="text-muted-foreground mb-3 h-10 w-10 opacity-50" />
                <h3 className="mb-1 text-base font-semibold">No active plan</h3>
                <p className="text-muted-foreground mb-3 text-center text-xs">
                  Set a plan as active to start tracking your workouts
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTab("all")}
                >
                  View All Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
