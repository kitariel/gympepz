"use client";

import { useMemo, useState } from "react";
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
    await create.mutateAsync({
      userId,
      name: newPlanName,
      days: [],
    });
    setNewPlanName("");
    setIsCreateDialogOpen(false);
    await list.refetch();
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
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your workout programs and training splits
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/portal/ai-planner")} className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generator
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Quick Create */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Create from Scratch</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter plan name (e.g., My Custom Split)"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreatePlan();
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
                    // TODO: Auto-populate with template exercises
                    console.log("Selected template:", template);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Folder className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Star className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Dumbbell className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalDays}</p>
                <p className="text-xs text-muted-foreground">Total Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
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

        <TabsContent value="all" className="space-y-4 mt-4">
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
                <Dumbbell className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-base font-semibold mb-1">No plans yet</h3>
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Create your first workout plan or generate one with AI
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Plan
                  </Button>
                  <Button size="sm" onClick={() => router.push("/portal/ai-planner")} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Generator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-4">
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
                <Star className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-base font-semibold mb-1">No active plan</h3>
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Set a plan as active to start tracking your workouts
                </p>
                <Button variant="outline" size="sm" onClick={() => setSelectedTab("all")}>
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
