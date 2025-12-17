"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function WorkoutLogList() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedPlanDayId, setSelectedPlanDayId] = useState<string>("");

  const handlePlanChange = (val: string) => {
    setSelectedPlanId(val);
    setSelectedPlanDayId("");
  };

  const logs = api.workoutLog.list.useQuery(
    { userId, limit: 10 },
    { enabled: !!userId },
  );
  const plans = api.plan.listByUser.useQuery(
    { userId },
    { enabled: !!userId && isOpen },
  );
  const createLog = api.workoutLog.create.useMutation({
    onSuccess: (log) => {
      setIsOpen(false);
      router.push(`/portal/log/workout/${log.id}`);
    },
  });

  const handleStartWorkout = async () => {
    await createLog.mutateAsync({
      userId,
      planDayId: selectedPlanDayId || undefined,
      date: new Date(),
    });
  };

  const selectedPlan = plans.data?.find((p) => p.id === selectedPlanId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recent Workouts</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a Workout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Select a plan and day to start, or leave blank for an empty
                  workout.
                </p>

                <div className="grid gap-2">
                  <Select
                    value={selectedPlanId}
                    onValueChange={handlePlanChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Plan (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Empty Workout)</SelectItem>
                      {plans.data?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPlan && (
                    <Select
                      value={selectedPlanDayId}
                      onValueChange={setSelectedPlanDayId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPlan.days
                          .sort((a, b) => a.order - b.order)
                          .map((day) => (
                            <SelectItem key={day.id} value={day.id}>
                              {day.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <Button
                onClick={handleStartWorkout}
                className="w-full"
                disabled={
                  createLog.isPending ||
                  (!!selectedPlanId &&
                    selectedPlanId !== "none" &&
                    !selectedPlanDayId)
                }
              >
                {createLog.isPending
                  ? "Creating..."
                  : selectedPlanId && selectedPlanId !== "none"
                    ? "Start Plan Workout"
                    : "Start Empty Workout"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {logs.data?.items.map((log) => (
          <Card
            key={log.id}
            className="hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => router.push(`/portal/log/workout/${log.id}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold">
                {log.planDay?.title ?? "Untitled Workout"}
              </CardTitle>
              <span className="text-muted-foreground text-sm">
                {format(new Date(log.date), "PPP")}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>
                  {log.duration ? `${log.duration} mins` : "In Progress"}
                </span>
                <span>{log._count?.exercises ?? 0} Exercises</span>
              </div>
              {log.notes && (
                <p className="text-muted-foreground mt-2 line-clamp-1 text-sm">
                  {log.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {logs.data?.items.length === 0 && (
          <div className="text-muted-foreground py-12 text-center">
            No workouts logged yet. Start one today!
          </div>
        )}
      </div>
    </div>
  );
}
