"use client";

import { useMemo, useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Save,
  Dumbbell,
  Calendar,
  Target,
  Wrench,
  Search,
  X,
  CheckCircle2,
  Moon,
} from "lucide-react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  subMonths,
  addMonths,
  isBefore,
  startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Item = {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
};

type WeekDay = {
  date: Date;
  dayName: string;
  dateNumber: number;
  isToday: boolean;
  isRestDay: boolean;
  items: Item[];
  isPast?: boolean;
};

type MonthDay = {
  date: Date;
  dateNumber: number;
  isToday: boolean;
  isRestDay: boolean;
  items: Item[];
  isCurrentMonth: boolean;
};

export default function WorkoutBuilderPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isQuickMode = searchParams?.get("mode") === "quick";

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedEquipment, setSelectedEquipment] = useState("All");
  const [selectedBodyPart, setSelectedBodyPart] = useState<
    "Push" | "Pull" | "Legs" | null
  >(null);

  // Plan state
  const [name, setName] = useState("");

  // View mode: 'week' or 'month'
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Current week/month tracking
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();

  // Quick mode: 7-day calendar state
  const [weekDays, setWeekDays] = useState<WeekDay[]>(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const todayStart = startOfDay(today);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dateStart = startOfDay(date);
      const isPast = isBefore(dateStart, todayStart) && !isSameDay(date, today);
      return {
        date,
        dayName: format(date, "EEE"),
        dateNumber: date.getDate(),
        isToday: isSameDay(date, today),
        isRestDay: false,
        items: [],
        isPast,
      };
    }).filter((day) => !day.isPast); // Filter out past days
  });

  // Month view: all days in month
  const [monthDays, setMonthDays] = useState<Map<string, MonthDay>>(() => {
    const map = new Map();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    days.forEach((date) => {
      const key = format(date, "yyyy-MM-dd");
      map.set(key, {
        date,
        dateNumber: date.getDate(),
        isToday: isSameDay(date, today),
        isRestDay: false,
        items: [],
        isCurrentMonth: true,
      });
    });
    return map;
  });

  // Update week days when currentWeekStart changes
  const updateWeekDays = (weekStart: Date) => {
    const todayStart = startOfDay(today);
    const updated = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dateStart = startOfDay(date);
      // Only include today and future dates
      const isPast = isBefore(dateStart, todayStart) && !isSameDay(date, today);
      const existingDay = weekDays.find((d) => isSameDay(d.date, date));
      return {
        date,
        dayName: format(date, "EEE"),
        dateNumber: date.getDate(),
        isToday: isSameDay(date, today),
        isRestDay: existingDay?.isRestDay ?? false,
        items: existingDay?.items ?? [],
        isPast,
      };
    }).filter((day) => !day.isPast); // Filter out past days
    setWeekDays(updated);
  };

  // Update month days when currentMonth changes
  const updateMonthDays = (month: Date) => {
    setMonthDays((prev) => {
      const newMap = new Map(prev);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      days.forEach((date) => {
        const key = format(date, "yyyy-MM-dd");
        const existing = prev.get(key);
        if (!existing) {
          newMap.set(key, {
            date,
            dateNumber: date.getDate(),
            isToday: isSameDay(date, today),
            isRestDay: false,
            items: [],
            isCurrentMonth: true,
          });
        } else {
          // Update isCurrentMonth flag
          newMap.set(key, {
            ...existing,
            isCurrentMonth: true,
          });
        }
      });
      return newMap;
    });
  };

  // Initialize month days when switching to month view or when currentMonth changes
  useEffect(() => {
    if (isQuickMode && viewMode === "month") {
      const newMap = new Map(monthDays);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      days.forEach((date) => {
        const key = format(date, "yyyy-MM-dd");
        const existing = monthDays.get(key);
        if (!existing) {
          newMap.set(key, {
            date,
            dateNumber: date.getDate(),
            isToday: isSameDay(date, today),
            isRestDay: false,
            items: [],
            isCurrentMonth: true,
          });
        }
      });
      setMonthDays(newMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuickMode, viewMode, currentMonth]);

  // Navigation handlers
  const goToPreviousWeek = () => {
    const newStart = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newStart);
    updateWeekDays(newStart);
  };

  const goToNextWeek = () => {
    const newStart = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newStart);
    updateWeekDays(newStart);
  };

  const goToPreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    updateMonthDays(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    updateMonthDays(newMonth);
  };

  const goToToday = () => {
    const todayWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentWeekStart(todayWeekStart);
    updateWeekDays(todayWeekStart);
    setCurrentMonth(today);
    updateMonthDays(today);
  };

  // Normal mode: flexible days state
  const [days, setDays] = useState<
    { title: string; items: Item[]; isRestDay?: boolean }[]
  >([{ title: "Push Day", items: [] }]);

  // Exercise selection dialog
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [targetDayIdx, setTargetDayIdx] = useState<number | string | null>(
    null,
  );
  const [selectedExerciseForConfig, setSelectedExerciseForConfig] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [exerciseConfig, setExerciseConfig] = useState({
    sets: 3,
    reps: 10,
    weight: undefined as number | undefined,
  });

  // Exercise query with filters
  const exercisesQuery = api.exercise.list.useQuery({
    q: searchQuery || undefined,
    muscleGroup: selectedMuscle !== "All" ? selectedMuscle : undefined,
    equipment: selectedEquipment !== "All" ? selectedEquipment : undefined,
    take: 100,
  });

  // Exercises for quick mode (week/month views) - already filtered by muscle/equipment in query
  const exercises = exercisesQuery.data ?? [];

  // Filter exercises by body part if selected (for normal mode only)
  const filteredExercisesNormal = useMemo(() => {
    const baseExercises = exercisesQuery.data ?? [];
    if (!selectedBodyPart) return baseExercises;

    return baseExercises.filter((ex) => {
      const muscle = ex.muscleGroup.toLowerCase();
      if (selectedBodyPart === "Push") {
        return (
          muscle.includes("chest") ||
          muscle.includes("shoulder") ||
          muscle.includes("triceps")
        );
      } else if (selectedBodyPart === "Pull") {
        return (
          muscle.includes("back") ||
          muscle.includes("biceps") ||
          muscle.includes("rear")
        );
      } else if (selectedBodyPart === "Legs") {
        return (
          muscle.includes("leg") ||
          muscle.includes("quad") ||
          muscle.includes("hamstring") ||
          muscle.includes("glute") ||
          muscle.includes("calf") ||
          muscle.includes("thigh")
        );
      }
      return true;
    });
  }, [exercisesQuery.data, selectedBodyPart]);

  const setActive = api.plan.setActive.useMutation();

  const create = api.plan.create.useMutation({
    onSuccess: (plan) => {
      // Set as active plan after creation
      if (userId) {
        setActive.mutate(
          { userId, planId: plan.id },
          {
            onSuccess: () => router.push("/portal/start"),
            onError: () => router.push("/portal/start"), // Still redirect even if setActive fails
          },
        );
      } else {
        router.push("/portal/start");
      }
    },
  });

  // Quick mode handlers - Week view
  const toggleRestDay = (dayIdx: number) => {
    setWeekDays((prev) => {
      const next = [...prev];
      next[dayIdx]!.isRestDay = !next[dayIdx]!.isRestDay;
      // Clear exercises if marked as rest day
      if (next[dayIdx]!.isRestDay) {
        next[dayIdx]!.items = [];
      }
      return next;
    });
  };

  // Month view handlers
  const toggleRestDayMonth = (dateKey: string) => {
    setMonthDays((prev) => {
      const newMap = new Map(prev);
      const day = newMap.get(dateKey);
      if (day) {
        const newIsRestDay = !day.isRestDay;
        newMap.set(dateKey, {
          ...day,
          isRestDay: newIsRestDay,
          items: newIsRestDay ? [] : day.items, // Clear exercises if marking as rest day
        });
      }
      return newMap;
    });
  };

  const openExerciseDialogMonth = (dateKey: string) => {
    setTargetDayIdx(dateKey); // Store dateKey as target
    setIsExerciseDialogOpen(true);
  };

  const addExerciseMonth = (exerciseId: string) => {
    const dateKey = targetDayIdx as unknown as string;
    if (!dateKey) return;
    setMonthDays((prev) => {
      const newMap = new Map(prev);
      const day = newMap.get(dateKey);
      if (day) {
        // Check if exercise already exists to prevent duplicates
        if (day.items.some((item) => item.exerciseId === exerciseId)) {
          return prev;
        }

        newMap.set(dateKey, {
          ...day,
          isRestDay: false, // Unmark as rest day if adding exercises
          items: [
            ...day.items,
            { exerciseId, sets: 3, reps: 10, weight: undefined },
          ],
        });
      }
      return newMap;
    });
    setIsExerciseDialogOpen(false);
    setSearchQuery("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
  };

  const updateItemMonth = (
    dateKey: string,
    itemIdx: number,
    field: "sets" | "reps" | "weight",
    value: number,
  ) => {
    setMonthDays((prev) => {
      const newMap = new Map(prev);
      const day = newMap.get(dateKey);
      if (day) {
        const updatedItems = [...day.items];
        updatedItems[itemIdx] = { ...updatedItems[itemIdx]!, [field]: value };
        newMap.set(dateKey, { ...day, items: updatedItems });
      }
      return newMap;
    });
  };

  const deleteItemMonth = (dateKey: string, itemIdx: number) => {
    setMonthDays((prev) => {
      const newMap = new Map(prev);
      const day = newMap.get(dateKey);
      if (day) {
        newMap.set(dateKey, {
          ...day,
          items: day.items.filter((_, i) => i !== itemIdx),
        });
      }
      return newMap;
    });
  };

  const openExerciseDialogQuick = (dayIdx: number) => {
    setTargetDayIdx(dayIdx);
    setIsExerciseDialogOpen(true);
  };

  const handleExerciseSelect = (exerciseId: string, exerciseName: string) => {
    // Set selected exercise and show config form
    setSelectedExerciseForConfig({ id: exerciseId, name: exerciseName });
    // Reset config to defaults
    setExerciseConfig({ sets: 3, reps: 10, weight: undefined });
  };

  const handleAddExerciseWithConfig = () => {
    if (!selectedExerciseForConfig || targetDayIdx === null) return;

    const exerciseId = selectedExerciseForConfig.id;

    // Check if it's normal mode (number index for days array) or quick mode
    if (!isQuickMode && typeof targetDayIdx === "number") {
      // Normal mode
      setDays((d) => {
        const next = [...d];
        const day = next[targetDayIdx];
        if (!day) return next;

        // Check if exercise already exists to prevent duplicates
        if (day.items.some((item) => item.exerciseId === exerciseId)) {
          return next;
        }

        day.items.push({
          exerciseId,
          sets: exerciseConfig.sets,
          reps: exerciseConfig.reps,
          weight: exerciseConfig.weight,
        });
        return next;
      });
      setIsExerciseDialogOpen(false);
      setSelectedExerciseForConfig(null);
      setSearchQuery("");
      setSelectedMuscle("All");
      setSelectedEquipment("All");
      setSelectedBodyPart(null);
    } else if (isQuickMode && typeof targetDayIdx === "string") {
      // Month view - use existing addExerciseMonth but with config
      setMonthDays((prev) => {
        const newMap = new Map(prev);
        const day = newMap.get(targetDayIdx);
        if (day) {
          // Check if exercise already exists to prevent duplicates
          if (day.items.some((item) => item.exerciseId === exerciseId)) {
            return prev;
          }

          newMap.set(targetDayIdx, {
            ...day,
            isRestDay: false,
            items: [
              ...day.items,
              {
                exerciseId,
                sets: exerciseConfig.sets,
                reps: exerciseConfig.reps,
                weight: exerciseConfig.weight,
              },
            ],
          });
        }
        return newMap;
      });
      setIsExerciseDialogOpen(false);
      setSelectedExerciseForConfig(null);
      setSearchQuery("");
      setSelectedMuscle("All");
      setSelectedEquipment("All");
    } else if (isQuickMode && typeof targetDayIdx === "number") {
      // Week view
      const dayIdx = targetDayIdx;
      setWeekDays((prev) => {
        const next = [...prev];
        const day = next[dayIdx];
        if (!day) return next;

        // Check if exercise already exists to prevent duplicates
        if (day.items.some((item: Item) => item.exerciseId === exerciseId)) {
          return next;
        }

        // Unmark as rest day if adding exercises
        day.isRestDay = false;
        day.items.push({
          exerciseId,
          sets: exerciseConfig.sets,
          reps: exerciseConfig.reps,
          weight: exerciseConfig.weight,
        });
        return next;
      });
      setIsExerciseDialogOpen(false);
      setSelectedExerciseForConfig(null);
      setSearchQuery("");
      setSelectedMuscle("All");
      setSelectedEquipment("All");
    }
  };

  const addExerciseQuick = (exerciseId: string) => {
    // This is now just for backward compatibility - will open config
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      handleExerciseSelect(exerciseId, exercise.name);
    }
  };

  const updateItemQuick = (
    dayIdx: number,
    itemIdx: number,
    field: "sets" | "reps" | "weight",
    value: number,
  ) => {
    setWeekDays((prev) => {
      const next = [...prev];
      const item = next[dayIdx]!.items[itemIdx]!;
      next[dayIdx]!.items[itemIdx] = { ...item, [field]: value };
      return next;
    });
  };

  const deleteItemQuick = (dayIdx: number, itemIdx: number) => {
    setWeekDays((prev) => {
      const next = [...prev];
      next[dayIdx]!.items = next[dayIdx]!.items.filter((_, i) => i !== itemIdx);
      return next;
    });
  };

  // Normal mode handlers
  const addDay = () => {
    setDays((d) => [...d, { title: "New Day", items: [] }]);
  };

  const deleteDay = (dayIdx: number) => {
    setDays((d) => d.filter((_, i) => i !== dayIdx));
  };

  const openExerciseDialog = (dayIdx: number) => {
    setTargetDayIdx(dayIdx);
    setIsExerciseDialogOpen(true);
  };

  const addExercise = (exerciseId: string) => {
    // For normal mode, use the config form approach
    const exercise = exercisesQuery.data?.find((e) => e.id === exerciseId);
    if (exercise) {
      handleExerciseSelect(exerciseId, exercise.name);
    }
  };

  const updateItem = (
    dayIdx: number,
    itemIdx: number,
    field: "sets" | "reps" | "weight",
    value: number,
  ) => {
    setDays((d) => {
      const next = [...d];
      const item = next[dayIdx]!.items[itemIdx]!;
      next[dayIdx]!.items[itemIdx] = { ...item, [field]: value };
      return next;
    });
  };

  const deleteItem = (dayIdx: number, itemIdx: number) => {
    setDays((d) => {
      const next = [...d];
      next[dayIdx]!.items = next[dayIdx]!.items.filter((_, i) => i !== itemIdx);
      return next;
    });
  };

  const save = async () => {
    if (!userId || !name) return;

    if (isQuickMode) {
      let workoutDays: Array<{ title: string; order: number; items: Item[] }> =
        [];

      if (viewMode === "week") {
        // Filter out rest days and convert to plan format
        workoutDays = weekDays
          .filter((day) => !day.isRestDay && day.items.length > 0)
          .map((day, idx) => ({
            title: `${day.dayName} - ${format(day.date, "MMM d")}`,
            order: idx,
            items: day.items.map((item) => ({
              exerciseId: item.exerciseId,
              sets: item.sets,
              reps: item.reps,
              weight: item.weight,
            })),
          }));
      } else {
        // Month view: collect all days with workouts
        const sortedDays = Array.from(monthDays.values())
          .filter(
            (day) =>
              day.isCurrentMonth && !day.isRestDay && day.items.length > 0,
          )
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map((day, idx) => ({
            title: `${format(day.date, "EEE")} - ${format(day.date, "MMM d")}`,
            order: idx,
            items: day.items.map((item) => ({
              exerciseId: item.exerciseId,
              sets: item.sets,
              reps: item.reps,
              weight: item.weight,
            })),
          }));
        workoutDays = sortedDays;
      }

      if (workoutDays.length === 0) {
        alert("Please add at least one workout day with exercises");
        return;
      }

      await create.mutateAsync({
        userId,
        name:
          name || (viewMode === "week" ? "My Weekly Plan" : "My Monthly Plan"),
        days: workoutDays,
      });
    } else {
      if (days.length === 0) return;
      await create.mutateAsync({
        userId,
        name,
        days: days.map((d, i) => ({
          title: d.title,
          order: i,
          items: d.items.map((item) => ({
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight,
          })),
        })),
      });
    }
  };

  const totalExercises = isQuickMode
    ? viewMode === "week"
      ? weekDays.reduce((sum, d) => sum + d.items.length, 0)
      : Array.from(monthDays.values()).reduce(
          (sum, d) => sum + d.items.length,
          0,
        )
    : days.reduce((sum, d) => sum + d.items.length, 0);

  const workoutDaysCount = isQuickMode
    ? viewMode === "week"
      ? weekDays.filter((d) => !d.isRestDay && d.items.length > 0).length
      : Array.from(monthDays.values()).filter(
          (d) => d.isCurrentMonth && !d.isRestDay && d.items.length > 0,
        ).length
    : days.length;

  const canSave = userId && name.trim() && workoutDaysCount > 0;

  // Quick Mode View
  if (isQuickMode) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Quick Workout Builder
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              Set up your week - add exercises or mark rest days
            </p>
          </div>
          <Button
            onClick={save}
            disabled={!canSave || create.isPending}
            className="w-full gap-2 sm:w-auto"
            size="sm"
          >
            <Save className="h-4 w-4" />
            {create.isPending ? "Saving..." : "Save Plan"}
          </Button>
        </div>

        {/* Plan Name */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-sm">Plan Name</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Input
              placeholder={
                viewMode === "week"
                  ? "Enter plan name (e.g., My Weekly Plan)"
                  : "Enter plan name (e.g., My Monthly Plan)"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
            />
          </CardContent>
        </Card>

        {/* View Toggle and Navigation */}
        <Card className="border-0 shadow-sm">
          <CardContent className="px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as "week" | "month")}
              >
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="week" className="flex-1 sm:flex-none">
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="flex-1 sm:flex-none">
                    Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                {viewMode === "week" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousWeek}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="h-8 text-xs"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextWeek}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousMonth}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[120px] px-2 text-center text-sm font-medium">
                      {format(currentMonth, "MMM yyyy")}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextMonth}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="ml-2 h-8 text-xs"
                    >
                      Today
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week View */}
        {viewMode === "week" && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold">
              Week of {format(currentWeekStart, "MMM d")}
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {weekDays.map((day, dayIdx) => {
                const exercise = exercises.find((e) => true); // For exercise lookup
                return (
                  <Card
                    key={dayIdx}
                    className={cn(
                      "border-0 shadow-sm transition-all",
                      day.isToday && "ring-2 ring-teal-500 ring-offset-2",
                      day.isRestDay && "bg-muted/50",
                    )}
                  >
                    <CardHeader className="px-4 pt-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-semibold">
                              {day.dayName}
                            </p>
                            {day.isToday && (
                              <Badge
                                variant="default"
                                className="px-1.5 py-0 text-[9px]"
                              >
                                Today
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {format(day.date, "MMM d")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={day.isRestDay}
                            onCheckedChange={() => toggleRestDay(dayIdx)}
                          />
                          <span className="text-muted-foreground text-xs">
                            Rest
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 pb-4">
                      {day.isRestDay ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Moon className="text-muted-foreground mb-2 h-8 w-8 opacity-50" />
                          <p className="text-muted-foreground text-sm font-medium">
                            Rest Day
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Add Exercise Button */}
                          <Dialog
                            open={
                              isExerciseDialogOpen && targetDayIdx === dayIdx
                            }
                            onOpenChange={(open) => {
                              if (!open) {
                                setIsExerciseDialogOpen(false);
                                setTargetDayIdx(null);
                                setSelectedExerciseForConfig(null);
                                setSearchQuery("");
                                setSelectedMuscle("All");
                                setSelectedEquipment("All");
                              }
                            }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 border-dashed"
                              onClick={() => openExerciseDialogQuick(dayIdx)}
                            >
                              <Plus className="h-4 w-4" />
                              Add Exercise
                            </Button>
                            <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto sm:max-h-[80vh] sm:w-full">
                              <DialogHeader>
                                <DialogTitle className="text-base sm:text-lg">
                                  Select Exercise for {day.dayName} (
                                  {format(day.date, "MMM d")})
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                {/* Search and Filters */}
                                <div className="space-y-3">
                                  <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                      placeholder="Search exercises..."
                                      value={searchQuery}
                                      onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                      }
                                      className="h-9 pr-10 pl-10"
                                    />
                                    {searchQuery && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                                        onClick={() => setSearchQuery("")}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <Select
                                      value={selectedMuscle}
                                      onValueChange={setSelectedMuscle}
                                    >
                                      <SelectTrigger className="h-9">
                                        <Target className="mr-2 h-3.5 w-3.5" />
                                        <SelectValue placeholder="Muscle Group" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="All">
                                          All Muscle Groups
                                        </SelectItem>
                                        <SelectItem value="Chest">
                                          Chest
                                        </SelectItem>
                                        <SelectItem value="Back">
                                          Back
                                        </SelectItem>
                                        <SelectItem value="Shoulders">
                                          Shoulders
                                        </SelectItem>
                                        <SelectItem value="Arms">
                                          Arms
                                        </SelectItem>
                                        <SelectItem value="Legs">
                                          Legs
                                        </SelectItem>
                                        <SelectItem value="Core">
                                          Core
                                        </SelectItem>
                                        <SelectItem value="Glutes">
                                          Glutes
                                        </SelectItem>
                                        <SelectItem value="Calves">
                                          Calves
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={selectedEquipment}
                                      onValueChange={setSelectedEquipment}
                                    >
                                      <SelectTrigger className="h-9">
                                        <Wrench className="mr-2 h-3.5 w-3.5" />
                                        <SelectValue placeholder="Equipment" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="All">
                                          All Equipment
                                        </SelectItem>
                                        <SelectItem value="Barbell">
                                          Barbell
                                        </SelectItem>
                                        <SelectItem value="Dumbbell">
                                          Dumbbell
                                        </SelectItem>
                                        <SelectItem value="Cable">
                                          Cable
                                        </SelectItem>
                                        <SelectItem value="Machine">
                                          Machine
                                        </SelectItem>
                                        <SelectItem value="Bodyweight">
                                          Bodyweight
                                        </SelectItem>
                                        <SelectItem value="Kettlebell">
                                          Kettlebell
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Exercise Configuration Form */}
                                {selectedExerciseForConfig ? (
                                  <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-semibold">
                                          {selectedExerciseForConfig.name}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                          Configure sets, reps, and weight
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() =>
                                          setSelectedExerciseForConfig(null)
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                      <div className="space-y-2">
                                        <label className="text-muted-foreground text-xs font-medium">
                                          Sets
                                        </label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="20"
                                          value={exerciseConfig.sets}
                                          onChange={(e) =>
                                            setExerciseConfig((prev) => ({
                                              ...prev,
                                              sets:
                                                parseInt(e.target.value) || 1,
                                            }))
                                          }
                                          className="h-9 text-center"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-muted-foreground text-xs font-medium">
                                          Reps
                                        </label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="50"
                                          value={exerciseConfig.reps}
                                          onChange={(e) =>
                                            setExerciseConfig((prev) => ({
                                              ...prev,
                                              reps:
                                                parseInt(e.target.value) || 1,
                                            }))
                                          }
                                          className="h-9 text-center"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-muted-foreground text-xs font-medium">
                                          Weight (kg)
                                        </label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          placeholder="Optional"
                                          value={exerciseConfig.weight ?? ""}
                                          onChange={(e) =>
                                            setExerciseConfig((prev) => ({
                                              ...prev,
                                              weight:
                                                e.target.value === ""
                                                  ? undefined
                                                  : parseFloat(
                                                      e.target.value,
                                                    ) || undefined,
                                            }))
                                          }
                                          className="h-9 text-center"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                      <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() =>
                                          setSelectedExerciseForConfig(null)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        className="flex-1"
                                        onClick={handleAddExerciseWithConfig}
                                        disabled={
                                          exerciseConfig.sets < 1 ||
                                          exerciseConfig.reps < 1
                                        }
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Exercise
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* Exercise List */}
                                    <div className="-mx-1 max-h-[300px] space-y-1.5 overflow-y-auto px-1 sm:max-h-[400px]">
                                      {exercises.length === 0 ? (
                                        <div className="text-muted-foreground py-8 text-center text-sm">
                                          <Dumbbell className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                          <p>No exercises found</p>
                                        </div>
                                      ) : (
                                        exercises.map((ex) => (
                                          <Button
                                            key={ex.id}
                                            variant="ghost"
                                            className="hover:bg-accent h-auto w-full touch-manipulation justify-start p-3"
                                            onClick={() =>
                                              handleExerciseSelect(
                                                ex.id,
                                                ex.name,
                                              )
                                            }
                                          >
                                            <div className="flex w-full items-start gap-3 text-left">
                                              <div className="shrink-0 rounded bg-teal-100 p-1.5 dark:bg-teal-900/30">
                                                <Dumbbell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium">
                                                  {ex.name}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                  <Badge
                                                    variant="secondary"
                                                    className="h-4 px-1.5 py-0 text-[9px]"
                                                  >
                                                    {ex.muscleGroup}
                                                  </Badge>
                                                  {ex.equipment && (
                                                    <Badge
                                                      variant="outline"
                                                      className="h-4 px-1.5 py-0 text-[9px]"
                                                    >
                                                      {ex.equipment}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                              <Plus className="text-muted-foreground h-4 w-4 shrink-0" />
                                            </div>
                                          </Button>
                                        ))
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Exercise Items */}
                          {day.items.length === 0 ? (
                            <div className="text-muted-foreground rounded-lg border border-dashed py-4 text-center text-xs">
                              <p>No exercises yet</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {day.items.map((item, itemIdx) => {
                                const exercise = exercises.find(
                                  (e) => e.id === item.exerciseId,
                                );
                                return (
                                  <div
                                    key={itemIdx}
                                    className="border-border/50 bg-muted/30 flex items-center gap-2 rounded-lg border p-2"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-medium">
                                        {exercise?.name ?? "Unknown Exercise"}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="bg-muted/50 flex items-center gap-1 rounded px-2 py-1">
                                        <span className="text-muted-foreground text-[10px]">
                                          Sets:
                                        </span>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="20"
                                          value={item.sets}
                                          onChange={(e) =>
                                            updateItemQuick(
                                              dayIdx,
                                              itemIdx,
                                              "sets",
                                              parseInt(e.target.value) || 0,
                                            )
                                          }
                                          className="h-7 w-12 border-0 bg-transparent p-0 text-center text-xs focus-visible:ring-0"
                                        />
                                      </div>
                                      <div className="bg-muted/50 flex items-center gap-1 rounded px-2 py-1">
                                        <span className="text-muted-foreground text-[10px]">
                                          Reps:
                                        </span>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="50"
                                          value={item.reps}
                                          onChange={(e) =>
                                            updateItemQuick(
                                              dayIdx,
                                              itemIdx,
                                              "reps",
                                              parseInt(e.target.value) || 0,
                                            )
                                          }
                                          className="h-7 w-12 border-0 bg-transparent p-0 text-center text-xs focus-visible:ring-0"
                                        />
                                      </div>
                                      {item.weight !== undefined &&
                                        item.weight !== null && (
                                          <div className="bg-muted/50 flex items-center gap-1 rounded px-2 py-1">
                                            <span className="text-muted-foreground text-[10px]">
                                              kg:
                                            </span>
                                            <Input
                                              type="number"
                                              min="0"
                                              step="0.5"
                                              value={item.weight}
                                              onChange={(e) =>
                                                updateItemQuick(
                                                  dayIdx,
                                                  itemIdx,
                                                  "weight",
                                                  parseFloat(e.target.value) ||
                                                    0,
                                                )
                                              }
                                              className="h-7 w-14 border-0 bg-transparent p-0 text-center text-xs focus-visible:ring-0"
                                            />
                                          </div>
                                        )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive h-7 w-7 shrink-0"
                                      onClick={() =>
                                        deleteItemQuick(dayIdx, itemIdx)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Month View */}
        {viewMode === "month" && (
          <div className="space-y-3">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-muted-foreground py-2 text-center text-xs font-medium"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const firstDayOfWeek = monthStart.getDay();
                const daysInMonth = eachDayOfInterval({
                  start: monthStart,
                  end: monthEnd,
                });
                const todayStart = startOfDay(today);

                // Filter out past dates - only show today and future dates
                const futureDays = daysInMonth.filter((date) => {
                  const dateStart = startOfDay(date);
                  return (
                    !isBefore(dateStart, todayStart) || isSameDay(date, today)
                  );
                });

                // Calculate how many empty cells we need at the start
                // Find the first visible day's position in the week
                const firstVisibleDay = futureDays[0];
                const firstVisibleDayOfWeek = firstVisibleDay
                  ? firstVisibleDay.getDay()
                  : firstDayOfWeek;

                // Add empty cells for days before first visible day
                const calendarDays = [
                  ...Array.from({ length: firstVisibleDayOfWeek }, () => null),
                  ...futureDays,
                ];

                return calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <div key={`empty-${index}`} className="aspect-square" />
                    );
                  }

                  const dateKey = format(date, "yyyy-MM-dd");
                  const day = monthDays.get(dateKey);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isToday = isSameDay(date, today);

                  if (!day && isCurrentMonth) {
                    // Initialize day if not exists
                    const newDay: MonthDay = {
                      date,
                      dateNumber: date.getDate(),
                      isToday,
                      isRestDay: false,
                      items: [],
                      isCurrentMonth: true,
                    };
                    monthDays.set(dateKey, newDay);
                  }

                  const dayData = monthDays.get(dateKey) ?? {
                    date,
                    dateNumber: date.getDate(),
                    isToday,
                    isRestDay: false,
                    items: [],
                    isCurrentMonth,
                  };

                  return (
                    <Card
                      key={dateKey}
                      className={cn(
                        "aspect-square cursor-pointer border-0 p-2 shadow-sm transition-all hover:shadow-md",
                        !isCurrentMonth && "opacity-40",
                        isToday && "ring-2 ring-teal-500 ring-offset-1",
                        dayData.isRestDay && "bg-muted/50",
                      )}
                    >
                      <CardContent className="flex h-full flex-col p-0">
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isToday && "font-bold text-teal-600",
                            )}
                          >
                            {date instanceof Date && !isNaN(date.getTime())
                              ? date.getDate()
                              : ""}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCurrentMonth) {
                                toggleRestDayMonth(dateKey);
                              }
                            }}
                            className={cn(
                              "hover:bg-muted rounded p-0.5 transition-colors",
                              dayData.isRestDay &&
                                "bg-teal-100 dark:bg-teal-900/30",
                            )}
                          >
                            <Moon
                              className={cn(
                                "h-3 w-3",
                                dayData.isRestDay
                                  ? "text-teal-600 dark:text-teal-400"
                                  : "text-muted-foreground/50",
                              )}
                            />
                          </button>
                        </div>
                        {dayData.items.length > 0 && (
                          <div className="flex flex-1 items-center justify-center">
                            <Badge
                              variant="secondary"
                              className="px-1 py-0 text-[8px]"
                            >
                              {dayData.items.length}{" "}
                              {dayData.items.length === 1 ? "ex" : "ex"}
                            </Badge>
                          </div>
                        )}
                        {isCurrentMonth && !dayData.isRestDay && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openExerciseDialogMonth(dateKey);
                            }}
                            className="mt-auto flex items-center justify-center pt-1"
                          >
                            <Plus className="text-muted-foreground hover:text-foreground h-3 w-3 transition-colors" />
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  );
                });
              })()}
            </div>

            {/* Selected Day Details (when a day is clicked, show in a card below) */}
            {(() => {
              // Find days with workouts for current month
              const daysWithWorkouts = Array.from(monthDays.values()).filter(
                (day) =>
                  day.isCurrentMonth && !day.isRestDay && day.items.length > 0,
              );

              if (daysWithWorkouts.length === 0) {
                return (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="text-muted-foreground py-8 text-center text-sm">
                      <p>Click on a day to add exercises</p>
                      <p className="mt-1 text-xs">
                        Or click the checkbox to mark as rest day
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold">Workout Days</h3>
                  <div className="grid gap-3">
                    {daysWithWorkouts.map((day) => {
                      const dateKey = format(day.date, "yyyy-MM-dd");
                      return (
                        <Card key={dateKey} className="border-0 shadow-sm">
                          <CardHeader className="px-4 pt-4 pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-sm">
                                  {format(day.date, "EEEE, MMM d")}
                                </CardTitle>
                                {day.isToday && (
                                  <Badge
                                    variant="default"
                                    className="mt-1 text-[9px]"
                                  >
                                    Today
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={day.isRestDay}
                                  onCheckedChange={() =>
                                    toggleRestDayMonth(dateKey)
                                  }
                                />
                                <span className="text-muted-foreground text-xs">
                                  Rest
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 px-4 pb-4">
                            {/* Add Exercise Button */}
                            <Dialog
                              open={
                                isExerciseDialogOpen && targetDayIdx === dateKey
                              }
                              onOpenChange={(open) => {
                                if (!open) {
                                  setIsExerciseDialogOpen(false);
                                  setTargetDayIdx(null);
                                  setSelectedExerciseForConfig(null);
                                  setSearchQuery("");
                                  setSelectedMuscle("All");
                                  setSelectedEquipment("All");
                                }
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 border-dashed"
                                onClick={() => openExerciseDialogMonth(dateKey)}
                              >
                                <Plus className="h-4 w-4" />
                                Add Exercise
                              </Button>
                              <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto sm:max-h-[80vh] sm:w-full">
                                <DialogHeader>
                                  <DialogTitle className="text-base sm:text-lg">
                                    Select Exercise for{" "}
                                    {format(day.date, "MMM d")}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  {/* Search and Filters - Same as week view */}
                                  <div className="space-y-3">
                                    <div className="relative">
                                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                      <Input
                                        placeholder="Search exercises..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                          setSearchQuery(e.target.value)
                                        }
                                        className="h-9 pr-10 pl-10"
                                      />
                                      {searchQuery && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                                          onClick={() => setSearchQuery("")}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                      <Select
                                        value={selectedMuscle}
                                        onValueChange={setSelectedMuscle}
                                      >
                                        <SelectTrigger className="h-9">
                                          <Target className="mr-2 h-3.5 w-3.5" />
                                          <SelectValue placeholder="Muscle Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="All">
                                            All Muscle Groups
                                          </SelectItem>
                                          <SelectItem value="Chest">
                                            Chest
                                          </SelectItem>
                                          <SelectItem value="Back">
                                            Back
                                          </SelectItem>
                                          <SelectItem value="Shoulders">
                                            Shoulders
                                          </SelectItem>
                                          <SelectItem value="Arms">
                                            Arms
                                          </SelectItem>
                                          <SelectItem value="Legs">
                                            Legs
                                          </SelectItem>
                                          <SelectItem value="Core">
                                            Core
                                          </SelectItem>
                                          <SelectItem value="Glutes">
                                            Glutes
                                          </SelectItem>
                                          <SelectItem value="Calves">
                                            Calves
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Select
                                        value={selectedEquipment}
                                        onValueChange={setSelectedEquipment}
                                      >
                                        <SelectTrigger className="h-9">
                                          <Wrench className="mr-2 h-3.5 w-3.5" />
                                          <SelectValue placeholder="Equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="All">
                                            All Equipment
                                          </SelectItem>
                                          <SelectItem value="Barbell">
                                            Barbell
                                          </SelectItem>
                                          <SelectItem value="Dumbbell">
                                            Dumbbell
                                          </SelectItem>
                                          <SelectItem value="Cable">
                                            Cable
                                          </SelectItem>
                                          <SelectItem value="Machine">
                                            Machine
                                          </SelectItem>
                                          <SelectItem value="Bodyweight">
                                            Bodyweight
                                          </SelectItem>
                                          <SelectItem value="Kettlebell">
                                            Kettlebell
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Exercise Configuration Form */}
                                  {selectedExerciseForConfig ? (
                                    <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-semibold">
                                            {selectedExerciseForConfig.name}
                                          </p>
                                          <p className="text-muted-foreground text-xs">
                                            Configure sets, reps, and weight
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                          onClick={() =>
                                            setSelectedExerciseForConfig(null)
                                          }
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        <div className="space-y-2">
                                          <label className="text-muted-foreground text-xs font-medium">
                                            Sets
                                          </label>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={exerciseConfig.sets}
                                            onChange={(e) =>
                                              setExerciseConfig((prev) => ({
                                                ...prev,
                                                sets:
                                                  parseInt(e.target.value) || 1,
                                              }))
                                            }
                                            className="h-9 text-center"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-muted-foreground text-xs font-medium">
                                            Reps
                                          </label>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={exerciseConfig.reps}
                                            onChange={(e) =>
                                              setExerciseConfig((prev) => ({
                                                ...prev,
                                                reps:
                                                  parseInt(e.target.value) || 1,
                                              }))
                                            }
                                            className="h-9 text-center"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-muted-foreground text-xs font-medium">
                                            Weight (kg)
                                          </label>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            placeholder="Optional"
                                            value={exerciseConfig.weight ?? ""}
                                            onChange={(e) =>
                                              setExerciseConfig((prev) => ({
                                                ...prev,
                                                weight:
                                                  e.target.value === ""
                                                    ? undefined
                                                    : parseFloat(
                                                        e.target.value,
                                                      ) || undefined,
                                              }))
                                            }
                                            className="h-9 text-center"
                                          />
                                        </div>
                                      </div>

                                      <div className="flex gap-2 pt-2">
                                        <Button
                                          variant="outline"
                                          className="flex-1"
                                          onClick={() =>
                                            setSelectedExerciseForConfig(null)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          className="flex-1"
                                          onClick={handleAddExerciseWithConfig}
                                          disabled={
                                            exerciseConfig.sets < 1 ||
                                            exerciseConfig.reps < 1
                                          }
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add Exercise
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      {/* Exercise List */}
                                      <div className="-mx-1 max-h-[300px] space-y-1.5 overflow-y-auto px-1 sm:max-h-[400px]">
                                        {exercises.length === 0 ? (
                                          <div className="text-muted-foreground py-8 text-center text-sm">
                                            <Dumbbell className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                            <p>No exercises found</p>
                                          </div>
                                        ) : (
                                          exercises.map((ex) => (
                                            <Button
                                              key={ex.id}
                                              variant="ghost"
                                              className="hover:bg-accent h-auto w-full justify-start p-3"
                                              onClick={() =>
                                                handleExerciseSelect(
                                                  ex.id,
                                                  ex.name,
                                                )
                                              }
                                            >
                                              <div className="flex w-full items-start gap-3 text-left">
                                                <div className="shrink-0 rounded bg-teal-100 p-1.5 dark:bg-teal-900/30">
                                                  <Dumbbell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                  <p className="text-sm font-medium">
                                                    {ex.name}
                                                  </p>
                                                  <div className="mt-1 flex items-center gap-2">
                                                    <Badge
                                                      variant="secondary"
                                                      className="h-4 px-1.5 py-0 text-[9px]"
                                                    >
                                                      {ex.muscleGroup}
                                                    </Badge>
                                                    {ex.equipment && (
                                                      <Badge
                                                        variant="outline"
                                                        className="h-4 px-1.5 py-0 text-[9px]"
                                                      >
                                                        {ex.equipment}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                </div>
                                                <Plus className="text-muted-foreground h-4 w-4 shrink-0" />
                                              </div>
                                            </Button>
                                          ))
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Exercise Items */}
                            {day.items.length > 0 && (
                              <div className="space-y-2">
                                {day.items.map((item, itemIdx) => {
                                  const exercise = exercises.find(
                                    (e) => e.id === item.exerciseId,
                                  );
                                  return (
                                    <div
                                      key={itemIdx}
                                      className="border-border/50 bg-muted/30 flex items-center gap-2 rounded-lg border p-2"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium">
                                          {exercise?.name ?? "Unknown Exercise"}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="bg-muted/50 flex items-center gap-1 rounded px-2 py-1">
                                          <span className="text-muted-foreground text-[10px]">
                                            Sets:
                                          </span>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={item.sets}
                                            onChange={(e) =>
                                              updateItemMonth(
                                                dateKey,
                                                itemIdx,
                                                "sets",
                                                parseInt(e.target.value) || 0,
                                              )
                                            }
                                            className="h-7 w-12 border-0 bg-transparent p-0 text-center text-xs focus-visible:ring-0"
                                          />
                                        </div>
                                        <div className="bg-muted/50 flex items-center gap-1 rounded px-2 py-1">
                                          <span className="text-muted-foreground text-[10px]">
                                            Reps:
                                          </span>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="50"
                                            value={item.reps}
                                            onChange={(e) =>
                                              updateItemMonth(
                                                dateKey,
                                                itemIdx,
                                                "reps",
                                                parseInt(e.target.value) || 0,
                                              )
                                            }
                                            className="h-7 w-12 border-0 bg-transparent p-0 text-center text-xs focus-visible:ring-0"
                                          />
                                        </div>
                                        {item.weight !== undefined &&
                                          item.weight !== null && (
                                            <div className="bg-muted/50 flex items-center gap-1 rounded px-2 py-1">
                                              <span className="text-muted-foreground text-[10px]">
                                                kg:
                                              </span>
                                              <Input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={item.weight}
                                                onChange={(e) =>
                                                  updateItemMonth(
                                                    dateKey,
                                                    itemIdx,
                                                    "weight",
                                                    parseFloat(
                                                      e.target.value,
                                                    ) || 0,
                                                  )
                                                }
                                                className="h-7 w-14 border-0 bg-transparent p-0 text-center text-xs focus-visible:ring-0"
                                              />
                                            </div>
                                          )}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive h-7 w-7 shrink-0"
                                        onClick={() =>
                                          deleteItemMonth(dateKey, itemIdx)
                                        }
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Summary */}
        <Card className="bg-muted/50 border-0 shadow-sm">
          <CardContent className="px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {workoutDaysCount} workout{" "}
                  {workoutDaysCount === 1 ? "day" : "days"}
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Dumbbell className="h-3.5 w-3.5" />
                  {totalExercises}{" "}
                  {totalExercises === 1 ? "exercise" : "exercises"}
                </span>
              </div>
              <Button
                onClick={save}
                disabled={!canSave || create.isPending}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {create.isPending ? "Saving..." : "Save Plan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal Mode View (existing code)
  return (
    <div className="flex-1 space-y-4 p-4 pt-4 sm:p-6">
      {/* Compact Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Workout Builder
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Create a custom workout plan
          </p>
        </div>
        <Button
          onClick={save}
          disabled={!canSave || create.isPending}
          className="w-full gap-2 sm:w-auto"
          size="sm"
        >
          <Save className="h-4 w-4" />
          {create.isPending ? "Saving..." : "Save Plan"}
        </Button>
      </div>

      {/* Plan Name - Compact */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-4 pb-4">
          <Input
            placeholder="Enter plan name (e.g., My Strength Program)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
          />
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {days.length} {days.length === 1 ? "day" : "days"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3 w-3" />
              {totalExercises} {totalExercises === 1 ? "exercise" : "exercises"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Workout Days</h3>
          <Button size="sm" onClick={addDay} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Day
          </Button>
        </div>

        {days.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Dumbbell className="text-muted-foreground mb-3 h-10 w-10 opacity-50" />
              <h3 className="mb-1 text-base font-semibold">
                No workout days yet
              </h3>
              <p className="text-muted-foreground mb-3 text-center text-xs">
                Add your first workout day to get started
              </p>
              <Button size="sm" onClick={addDay} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Day
              </Button>
            </CardContent>
          </Card>
        ) : (
          days.map((day, dayIdx) => (
            <Card key={dayIdx} className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={day.title}
                    onChange={(e) =>
                      setDays((prev) =>
                        prev.map((d, i) =>
                          i === dayIdx ? { ...d, title: e.target.value } : d,
                        ),
                      )
                    }
                    className="h-8 flex-1 text-sm font-semibold"
                    placeholder="Day title (e.g., Monday - Push)"
                  />
                  {days.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-8 w-8"
                      onClick={() => deleteDay(dayIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                {/* Add Exercise Button */}
                <Dialog
                  open={isExerciseDialogOpen && targetDayIdx === dayIdx}
                  onOpenChange={(open) => {
                    setIsExerciseDialogOpen(open);
                    if (!open) {
                      setTargetDayIdx(null);
                      setSelectedExerciseForConfig(null);
                      setSearchQuery("");
                      setSelectedMuscle("All");
                      setSelectedEquipment("All");
                      setSelectedBodyPart(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 border-dashed"
                      onClick={() => openExerciseDialog(dayIdx)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Exercise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto sm:max-h-[80vh] sm:w-full">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">
                        Select Exercise
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {/* Search and Filters */}
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                          <Input
                            placeholder="Search exercises..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 pr-10 pl-10"
                          />
                          {searchQuery && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                              onClick={() => setSearchQuery("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {/* Quick Body Part Filters */}
                        <div className="flex flex-wrap gap-2">
                          {(["Push", "Pull", "Legs"] as const).map(
                            (bodyPart) => (
                              <Button
                                key={bodyPart}
                                variant={
                                  selectedBodyPart === bodyPart
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="h-9 min-w-[80px] flex-1 touch-manipulation text-xs sm:h-8 sm:flex-none"
                                onClick={() => {
                                  if (selectedBodyPart === bodyPart) {
                                    setSelectedBodyPart(null);
                                    setSelectedMuscle("All");
                                  } else {
                                    setSelectedBodyPart(bodyPart);
                                    // Auto-set muscle filter based on body part
                                    if (bodyPart === "Push") {
                                      setSelectedMuscle("Chest");
                                    } else if (bodyPart === "Pull") {
                                      setSelectedMuscle("Back");
                                    } else if (bodyPart === "Legs") {
                                      setSelectedMuscle("Legs");
                                    }
                                  }
                                }}
                              >
                                {bodyPart}
                              </Button>
                            ),
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={selectedMuscle}
                            onValueChange={(value) => {
                              setSelectedMuscle(value);
                              // Clear body part if manually selecting muscle
                              if (value !== "All") setSelectedBodyPart(null);
                            }}
                          >
                            <SelectTrigger className="h-9">
                              <Target className="mr-2 h-3.5 w-3.5" />
                              <SelectValue placeholder="Muscle Group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">
                                All Muscle Groups
                              </SelectItem>
                              <SelectItem value="Chest">Chest</SelectItem>
                              <SelectItem value="Back">Back</SelectItem>
                              <SelectItem value="Shoulders">
                                Shoulders
                              </SelectItem>
                              <SelectItem value="Arms">Arms</SelectItem>
                              <SelectItem value="Legs">Legs</SelectItem>
                              <SelectItem value="Core">Core</SelectItem>
                              <SelectItem value="Glutes">Glutes</SelectItem>
                              <SelectItem value="Calves">Calves</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={selectedEquipment}
                            onValueChange={setSelectedEquipment}
                          >
                            <SelectTrigger className="h-9">
                              <Wrench className="mr-2 h-3.5 w-3.5" />
                              <SelectValue placeholder="Equipment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Equipment</SelectItem>
                              <SelectItem value="Barbell">Barbell</SelectItem>
                              <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                              <SelectItem value="Cable">Cable</SelectItem>
                              <SelectItem value="Machine">Machine</SelectItem>
                              <SelectItem value="Bodyweight">
                                Bodyweight
                              </SelectItem>
                              <SelectItem value="Kettlebell">
                                Kettlebell
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Exercise Configuration Form (Normal Mode) */}
                      {!isQuickMode &&
                      selectedExerciseForConfig &&
                      typeof targetDayIdx === "number" ? (
                        <div className="bg-muted/30 space-y-4 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">
                                {selectedExerciseForConfig.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Configure sets, reps, and weight
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setSelectedExerciseForConfig(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <label className="text-muted-foreground text-xs font-medium">
                                Sets
                              </label>
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={exerciseConfig.sets}
                                onChange={(e) =>
                                  setExerciseConfig((prev) => ({
                                    ...prev,
                                    sets: parseInt(e.target.value) || 1,
                                  }))
                                }
                                className="h-9 text-center"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-muted-foreground text-xs font-medium">
                                Reps
                              </label>
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={exerciseConfig.reps}
                                onChange={(e) =>
                                  setExerciseConfig((prev) => ({
                                    ...prev,
                                    reps: parseInt(e.target.value) || 1,
                                  }))
                                }
                                className="h-9 text-center"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-muted-foreground text-xs font-medium">
                                Weight (kg)
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="Optional"
                                value={exerciseConfig.weight ?? ""}
                                onChange={(e) =>
                                  setExerciseConfig((prev) => ({
                                    ...prev,
                                    weight:
                                      e.target.value === ""
                                        ? undefined
                                        : parseFloat(e.target.value) ||
                                          undefined,
                                  }))
                                }
                                className="h-9 text-center"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setSelectedExerciseForConfig(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={handleAddExerciseWithConfig}
                              disabled={
                                exerciseConfig.sets < 1 ||
                                exerciseConfig.reps < 1
                              }
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Exercise
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-[400px] space-y-1.5 overflow-y-auto">
                          {filteredExercisesNormal.length === 0 ? (
                            <div className="text-muted-foreground py-8 text-center text-sm">
                              <Dumbbell className="mx-auto mb-2 h-8 w-8 opacity-50" />
                              <p>No exercises found</p>
                            </div>
                          ) : (
                            filteredExercisesNormal.map((ex) => (
                              <Button
                                key={ex.id}
                                variant="ghost"
                                className="hover:bg-accent h-auto w-full touch-manipulation justify-start p-3"
                                onClick={() => {
                                  if (!isQuickMode) {
                                    handleExerciseSelect(ex.id, ex.name);
                                  } else {
                                    addExercise(ex.id);
                                  }
                                }}
                              >
                                <div className="flex w-full items-start gap-3 text-left">
                                  <div className="shrink-0 rounded bg-teal-100 p-1.5 dark:bg-teal-900/30">
                                    <Dumbbell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                      {ex.name}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className="h-4 px-1.5 py-0 text-[9px]"
                                      >
                                        {ex.muscleGroup}
                                      </Badge>
                                      {ex.equipment && (
                                        <Badge
                                          variant="outline"
                                          className="h-4 px-1.5 py-0 text-[9px]"
                                        >
                                          {ex.equipment}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Plus className="text-muted-foreground h-4 w-4 shrink-0" />
                                </div>
                              </Button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Exercise Items */}
                {day.items.length === 0 ? (
                  <div className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
                    <p>No exercises added yet</p>
                    <p className="mt-1 text-xs">
                      Click &quot;Add Exercise&quot; to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {day.items.map((item, itemIdx) => {
                      const exercise = (exercisesQuery.data ?? []).find(
                        (e) => e.id === item.exerciseId,
                      );
                      return (
                        <div
                          key={itemIdx}
                          className="border-border/50 bg-muted/30 hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-2.5 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {exercise?.name ?? "Unknown Exercise"}
                            </p>
                            {exercise && (
                              <Badge
                                variant="secondary"
                                className="mt-1 h-4 px-1.5 py-0 text-[9px]"
                              >
                                {exercise.muscleGroup}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                max="20"
                                value={item.sets}
                                onChange={(e) =>
                                  updateItem(
                                    dayIdx,
                                    itemIdx,
                                    "sets",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="h-8 w-14 text-center text-xs"
                              />
                              <span className="text-muted-foreground w-8 text-[10px]">
                                sets
                              </span>
                            </div>
                            <span className="text-muted-foreground">×</span>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={item.reps}
                                onChange={(e) =>
                                  updateItem(
                                    dayIdx,
                                    itemIdx,
                                    "reps",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="h-8 w-14 text-center text-xs"
                              />
                              <span className="text-muted-foreground w-10 text-[10px]">
                                reps
                              </span>
                            </div>
                            {item.weight !== undefined && (
                              <>
                                <span className="text-muted-foreground">@</span>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={item.weight}
                                    onChange={(e) =>
                                      updateItem(
                                        dayIdx,
                                        itemIdx,
                                        "weight",
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="h-8 w-16 text-center text-xs"
                                  />
                                  <span className="text-muted-foreground w-6 text-[10px]">
                                    kg
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8 shrink-0"
                            onClick={() => deleteItem(dayIdx, itemIdx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
