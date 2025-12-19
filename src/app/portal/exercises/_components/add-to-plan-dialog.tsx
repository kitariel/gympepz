"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { Plus, Calendar } from "lucide-react";

interface AddToPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseId: string;
  exerciseName: string;
}

export function AddToPlanDialog({
  open,
  onOpenChange,
  exerciseId,
  exerciseName,
}: AddToPlanDialogProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);

  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  
  const plans = api.plan.listByUser.useQuery(
    { userId },
    { enabled: open && !!userId }
  );

  const plan = api.plan.get.useQuery(
    { id: selectedPlanId },
    { enabled: !!selectedPlanId && open }
  );

  const addExercise = api.plan.addExercise.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      setSelectedPlanId("");
      setSelectedDayId("");
      // Optionally navigate to the plan
      if (selectedPlanId) {
        router.push(`/portal/plans/${selectedPlanId}`);
      }
    },
  });

  const handleAdd = async () => {
    if (!selectedDayId || !exerciseId) return;
    await addExercise.mutateAsync({
      dayId: selectedDayId,
      exerciseId,
      sets,
      reps,
    });
  };

  const selectedPlan = plans.data?.find((p) => p.id === selectedPlanId);
  const availableDays = plan.data?.days ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {exerciseName} to Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {/* Plan Selection */}
          <div className="space-y-2">
            <Label>Select Plan</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a plan..." />
              </SelectTrigger>
              <SelectContent>
                {plans.data?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{plan.name}</span>
                      {plan.isActive && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Active)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedPlanId && plans.data?.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No plans yet.{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => router.push("/portal/workout-builder")}
                >
                  Create one now
                </Button>
              </p>
            )}
          </div>

          {/* Day Selection */}
          {selectedPlanId && (
            <div className="space-y-2">
              <Label>Select Workout Day</Label>
              <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a day..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDays.map((day: any) => (
                    <SelectItem key={day.id} value={day.id}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {day.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlanId && availableDays.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  This plan has no days yet.{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => router.push(`/portal/plans/${selectedPlanId}`)}
                  >
                    Add a day
                  </Button>
                </p>
              )}
            </div>
          )}

          {/* Sets & Reps */}
          {selectedDayId && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  max="20"
                  value={sets}
                  onChange={(e) => setSets(parseInt(e.target.value) || 3)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  type="number"
                  min="1"
                  max="50"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAdd}
              disabled={
                !selectedDayId ||
                addExercise.isPending ||
                sets < 1 ||
                reps < 1
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {addExercise.isPending ? "Adding..." : "Add to Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
