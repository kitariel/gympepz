"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import {
  Plus,
  Clock,
  Dumbbell,
  MoreVertical,
  Copy,
  Calendar as CalendarIcon,
  RotateCcw,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Play,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function WorkoutLogList() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedPlanDayId, setSelectedPlanDayId] = useState<string>("");
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [rescheduleWorkoutId, setRescheduleWorkoutId] = useState<string | null>(
    null,
  );
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
    undefined,
  );

  // Check for recent completed workout
  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  const logs = api.workoutLog.list.useQuery(
    { userId, limit: 20 },
    { enabled: !!userId },
  );

  // Always fetch plans to determine active plan for "Next Up"
  const plans = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });

  const activePlan = plans.data?.find((p) => p.isActive);

  // Logic to find next workout
  const nextDay = useMemo(() => {
    if (!activePlan || !logs.data) return null;

    // Get all day IDs for the active plan
    const activePlanDayIds = new Set(activePlan.days.map((d) => d.id));

    // Find last COMPLETED log for this plan
    const lastLogForPlan = logs.data.items.find(
      (log) =>
        log.planDayId && activePlanDayIds.has(log.planDayId) && log.completed,
    );

    const sortedDays = [...activePlan.days].sort((a, b) => a.order - b.order);

    if (!lastLogForPlan) {
      return sortedDays[0];
    }

    // Find the day object for the last log to get its order
    const lastDay = activePlan.days.find(
      (d) => d.id === lastLogForPlan.planDayId,
    );
    const lastOrder = lastDay?.order ?? -1;

    const next = sortedDays.find((d) => d.order > lastOrder);

    return next ?? sortedDays[0];
  }, [activePlan, logs.data]);

  const handlePlanChange = (val: string) => {
    setSelectedPlanId(val);
    setSelectedPlanDayId("");
  };
  const createLog = api.workoutLog.create.useMutation({
    onSuccess: (log) => {
      setIsOpen(false);
      router.push(`/portal/log/workout/${log.id}`);
    },
  });

  const handleStartWorkout = async () => {
    // Check if there's a recent completed workout
    if (recentWorkoutCheck.data?.hasRecentWorkout) {
      setShowWarningDialog(true);
      return;
    }

    await createLog.mutateAsync({
      userId,
      planDayId: selectedPlanDayId || undefined,
      date: new Date(),
    });
  };

  const handleConfirmStart = async () => {
    setShowWarningDialog(false);
    await createLog.mutateAsync({
      userId,
      planDayId: selectedPlanDayId || undefined,
      date: new Date(),
    });
  };

  const utils = api.useUtils();
  const duplicateMutation = api.workoutLog.duplicate.useMutation({
    onSuccess: (log) => {
      void utils.workoutLog.list.invalidate();
      router.push(`/portal/log/workout/${log.id}`);
    },
  });

  const rescheduleMutation = api.workoutLog.reschedule.useMutation({
    onSuccess: () => {
      void utils.workoutLog.list.invalidate();
      setRescheduleWorkoutId(null);
      setRescheduleDate(undefined);
    },
  });

  const handleDuplicate = (logId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMutation.mutate({ id: logId });
  };

  const handleReschedule = (logId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const log = logs.data?.items.find((l) => l.id === logId);
    if (log) {
      setRescheduleDate(new Date());
      setRescheduleWorkoutId(logId);
    }
  };

  const handleReuseAndReschedule = (logId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const log = logs.data?.items.find((l) => l.id === logId);
    if (log) {
      // Duplicate first, then reschedule
      duplicateMutation.mutate(
        { id: logId, date: new Date() },
        {
          onSuccess: (newLog) => {
            setRescheduleDate(new Date());
            setRescheduleWorkoutId(newLog.id);
          },
        },
      );
    }
  };

  const handleRescheduleConfirm = () => {
    if (rescheduleWorkoutId && rescheduleDate) {
      rescheduleMutation.mutate({
        id: rescheduleWorkoutId,
        date: rescheduleDate,
      });
    }
  };

  // Determine workout status
  const getWorkoutStatus = (
    log: NonNullable<typeof logs.data>["items"][number],
  ) => {
    const now = new Date();
    const workoutDate = new Date(log.date);
    const hoursSinceStart =
      (now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60);
    const hasExercises = (log._count?.exercises ?? 0) > 0;

    if (log.completed) {
      return {
        type: "done" as const,
        label: "Done",
        icon: CheckCircle2,
        color: "bg-primary/10 text-primary border-primary/20",
      };
    }

    // In progress if not completed, has exercises, and started recently (within 24 hours)
    if (!log.completed && hasExercises && hoursSinceStart < 24) {
      return {
        type: "in_progress" as const,
        label: "In Workout",
        icon: PlayCircle,
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      };
    }

    // Skipped if not completed and (no exercises or old)
    if (!log.completed && (!hasExercises || hoursSinceStart >= 24)) {
      return {
        type: "skipped" as const,
        label: "Skipped",
        icon: XCircle,
        color: "bg-muted text-muted-foreground border-transparent",
      };
    }

    return null;
  };

  const selectedPlan = plans.data?.find((p) => p.id === selectedPlanId);

  // Set default selection when dialog opens
  if (isOpen && !selectedPlanId && activePlan) {
    setSelectedPlanId(activePlan.id);
    if (nextDay) {
      setSelectedPlanDayId(nextDay.id);
    }
  }

  return (
    <div className="space-y-4">
      {/* Next Workout Card */}
      {activePlan && nextDay && (
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-background text-primary border-primary/30"
                >
                  Next Up
                </Badge>
                <span className="text-muted-foreground text-xs">
                  From: {activePlan.name}
                </span>
              </div>
            </div>
            <CardTitle className="mt-2 flex items-center gap-2 text-lg">
              {nextDay.title}
              <Target className="text-primary h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Button
              onClick={async () => {
                if (recentWorkoutCheck.data?.hasRecentWorkout) {
                  setShowWarningDialog(true);
                  return;
                }
                await createLog.mutateAsync({
                  userId,
                  planDayId: nextDay.id,
                  date: new Date(),
                });
              }}
              className="w-full gap-2 sm:w-auto"
              disabled={createLog.isPending}
            >
              <Play className="h-4 w-4" />
              {createLog.isPending ? "Starting..." : "Start This Workout"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Workouts</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            View and manage your workout history
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
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

                  {selectedPlan?.days && (
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
                    ? "Start Workout"
                    : "Create Freeform Workout"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {logs.data?.items.map((log) => {
          const status = getWorkoutStatus(log);
          const StatusIcon = status?.icon;

          return (
            <Card
              key={log.id}
              className="group ring-border hover:ring-primary/20 bg-card cursor-pointer border-0 shadow-sm ring-1 transition-all hover:shadow-md"
              onClick={() => router.push(`/portal/log/workout/${log.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 px-4 pt-4 pb-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="mr-2 flex items-center justify-between">
                    <span className="text-muted-foreground/70 text-[10px] font-semibold tracking-wider uppercase">
                      {(() => {
                        const date = new Date(log.date);
                        // Extract UTC date components to avoid timezone shifts
                        const utcDate = new Date(Date.UTC(
                          date.getUTCFullYear(),
                          date.getUTCMonth(),
                          date.getUTCDate()
                        ));
                        return format(utcDate, "EEEE, MMM d");
                      })()}
                    </span>
                    {status && StatusIcon && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-5 px-1.5 py-0.5 text-[10px] sm:hidden",
                          status.color,
                        )}
                      >
                        <StatusIcon className="mr-1 h-2.5 w-2.5" />
                        {status.label}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <CardTitle
                      className="cursor-pointer truncate text-base leading-tight font-bold"
                      onClick={() =>
                        router.push(`/portal/log/workout/${log.id}`)
                      }
                    >
                      {log.planDay?.title ?? "Untitled Workout"}
                    </CardTitle>
                    {status && StatusIcon && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "hidden h-5 px-1.5 py-0.5 text-[10px] sm:flex",
                          status.color,
                        )}
                      >
                        <StatusIcon className="mr-1 h-2.5 w-2.5" />
                        {status.label}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="-mt-1 -mr-2 flex shrink-0 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreVertical className="text-muted-foreground h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleDuplicate(log.id, e)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleReschedule(log.id, e)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleReuseAndReschedule(log.id, e)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reuse & Reschedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent
                className="cursor-pointer px-4 pb-4"
                onClick={() => router.push(`/portal/log/workout/${log.id}`)}
              >
                {log.notes && (
                  <p className="text-muted-foreground mb-3 line-clamp-1 text-xs italic">
                    &quot;{log.notes}&quot;
                  </p>
                )}

                <div className="border-border/50 mt-1 flex items-center justify-between border-t pt-1 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Dumbbell className="h-3.5 w-3.5" />
                      <span>{log._count?.exercises ?? 0}</span>
                      <span className="text-muted-foreground/60 ml-0.5 hidden text-[10px] tracking-wider uppercase sm:inline">
                        Exercises
                      </span>
                    </div>

                    {log.duration && (
                      <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{log.duration}</span>
                        <span className="text-muted-foreground/60 ml-0.5 hidden text-[10px] tracking-wider uppercase sm:inline">
                          Mins
                        </span>
                      </div>
                    )}
                  </div>

                  {log.totalVolume && (
                    <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      <span className="text-muted-foreground/60 text-[10px] tracking-wider uppercase">
                        Vol
                      </span>
                      <span>
                        {Math.round(log.totalVolume).toLocaleString()} kg
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {logs.data?.items.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-6 py-12">
              <div className="bg-muted mb-4 rounded-full p-4">
                <Dumbbell className="text-muted-foreground h-10 w-10" />
              </div>
              <h3 className="mb-2 text-base font-semibold">
                No workouts logged yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
                Start your first workout to begin tracking your fitness journey.
                You can start from a plan or create a freeform workout.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="sm"
                  onClick={() => router.push("/portal/start")}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Workout
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/portal/plans")}
                  className="gap-2"
                >
                  <Target className="h-4 w-4" />
                  Create Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rest Warning Dialog */}
      <WorkoutRestWarning
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowWarningDialog(false)}
        recentWorkout={recentWorkoutCheck.data?.workout ?? null}
      />

      {/* Reschedule Dialog */}
      <Dialog
        open={!!rescheduleWorkoutId}
        onOpenChange={(open) => !open && setRescheduleWorkoutId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !rescheduleDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate
                      ? format(rescheduleDate, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRescheduleWorkoutId(null);
                  setRescheduleDate(undefined);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleConfirm}
                disabled={!rescheduleDate || rescheduleMutation.isPending}
              >
                {rescheduleMutation.isPending
                  ? "Rescheduling..."
                  : "Reschedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
