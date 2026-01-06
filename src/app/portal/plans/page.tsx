"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlanCard } from "./_components/plan-card";
import { PlansStats } from "./_components/plans-stats";
import { PlansEmptyState } from "./_components/plans-empty-state";
import { CreatePlanDialog } from "./_components/create-plan-dialog";
import { RestDayDialog } from "./_components/rest-day-dialog";
import { usePlansData } from "./_hooks/use-plans-data";
import { usePlansMutations } from "./_hooks/use-plans-mutations";
import { usePlanHandlers } from "./_hooks/use-plan-handlers";
import { useTemplateCreation } from "./_hooks/use-template-creation";
import { TEMPLATE_DEFINITIONS } from "./_components/template-exercises";
import { Folder, Star, Sparkles } from "lucide-react";

export default function PlansPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [selectedPlanForStart, setSelectedPlanForStart] = useState<string | null>(null);

  // Data hooks
  const data = usePlansData(userId);
  const mutations = usePlansMutations();
  const templateCreation = useTemplateCreation(userId);

  // Event handlers
  const handlers = usePlanHandlers({
    userId,
    data,
    mutations,
    activePlan: data.activePlan,
    setShowRestDayDialog,
    setSelectedPlanForStart,
  });

  const filteredPlans = useMemo(() => {
    if (selectedTab === "active") {
      return data.plans.filter((p) => p.isActive);
    }
    return data.plans;
  }, [data.plans, selectedTab]);

  const handleCreateComplete = async () => {
    await data.list.refetch();
  };

  return (
    <div className="flex-1 space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6 md:pt-4">
      {/* Enhanced Header - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Training Programs
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Design your protocol or let the Coach build one for you
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/portal/ai-planner")}
            className="gap-2 h-9 text-xs sm:text-sm flex-1 sm:flex-initial min-w-[120px] sm:min-w-0 bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Ask Coach</span>
            <span className="xs:hidden">AI</span>
          </Button>
          <CreatePlanDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            userId={userId}
            onCreateComplete={handleCreateComplete}
            templateCreation={templateCreation}
            mutations={mutations}
            list={data.list}
          />
        </div>
      </div>

      {/* Enhanced Stats - Responsive Grid */}
      <PlansStats stats={data.stats} />

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="h-9 sm:h-10 w-full sm:w-auto">
          <TabsTrigger
            value="all"
            className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4"
          >
            <Folder className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">All</span>
            <span className="xs:hidden">All</span>
            <span className="hidden sm:inline"> ({data.plans.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial px-3 sm:px-4"
          >
            <Star className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Active</span>
            <span className="xs:hidden">Active</span>
            <span className="hidden sm:inline"> ({data.stats.active})</span>
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
                  onSetActive={() => handlers.handleSetActive(plan.id)}
                  onDuplicate={() => handlers.handleDuplicate(plan.id)}
                  onDelete={() => handlers.handleDelete(plan.id)}
                  onStartWorkout={() => handlers.handleStartWorkout(plan.id)}
                />
              ))}
            </div>
          ) : (
            <PlansEmptyState onCreateClick={() => setIsCreateDialogOpen(true)} />
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
                  onDuplicate={() => handlers.handleDuplicate(plan.id)}
                  onDelete={() => handlers.handleDelete(plan.id)}
                  onStartWorkout={() => handlers.handleStartWorkout(plan.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="bg-amber-500/10 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                  <Star className="text-amber-600 h-10 w-10 sm:h-12 sm:w-12 opacity-60 dark:text-amber-400" />
                </div>
                <h3 className="mb-2 text-base sm:text-lg font-bold">
                  No active plan
                </h3>
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
      <RestDayDialog
        open={showRestDayDialog}
        onOpenChange={setShowRestDayDialog}
        onAction={(action) =>
          handlers.handleRestDayChoice(action, selectedPlanForStart)
        }
        isRestDay={data.todaysWorkout.data?.todayWorkout?.isRestDay ?? false}
        workoutTitle={data.todaysWorkout.data?.todayWorkout?.title}
      />
    </div>
  );
}
