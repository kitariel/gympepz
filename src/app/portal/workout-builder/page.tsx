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

  // Plan state
  const [name, setName] = useState("");

  // View mode: 'week' or 'month'
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  // Current week/month tracking
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
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
  const [days, setDays] = useState<{ title: string; items: Item[]; isRestDay?: boolean }[]>([
    { title: "Push Day", items: [] },
  ]);

  // Exercise selection dialog
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [targetDayIdx, setTargetDayIdx] = useState<number | string | null>(null);

  // Exercise query with filters
  const exercisesQuery = api.exercise.list.useQuery({
    q: searchQuery || undefined,
    muscleGroup: selectedMuscle !== "All" ? selectedMuscle : undefined,
    equipment: selectedEquipment !== "All" ? selectedEquipment : undefined,
    take: 100,
  });

  const exercises = exercisesQuery.data ?? [];

  const setActive = api.plan.setActive.useMutation();
  
  const create = api.plan.create.useMutation({
    onSuccess: (plan) => {
      // Set as active plan after creation
      if (userId) {
        setActive.mutate({ userId, planId: plan.id }, {
          onSuccess: () => router.push("/portal/start"),
          onError: () => router.push("/portal/start"), // Still redirect even if setActive fails
        });
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
    setTargetDayIdx(dateKey as any); // Store dateKey as target
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
          items: [...day.items, { exerciseId, sets: 3, reps: 10, weight: undefined }],
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
    value: number
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

  const addExerciseQuick = (exerciseId: string) => {
    if (targetDayIdx === null) return;
    
    // Check if it's month view (string key) or week view (number index)
    if (typeof targetDayIdx === "string") {
      addExerciseMonth(exerciseId);
    } else {
      setWeekDays((prev) => {
        const next = [...prev];
        const day = next[targetDayIdx];
        if (!day) return next;
        
        // Check if exercise already exists to prevent duplicates
        if (day.items.some((item) => item.exerciseId === exerciseId)) {
          return next;
        }
        
        // Unmark as rest day if adding exercises
        day.isRestDay = false;
        day.items.push({
          exerciseId,
          sets: 3,
          reps: 10,
          weight: undefined,
        });
        return next;
      });
      setIsExerciseDialogOpen(false);
      setSearchQuery("");
      setSelectedMuscle("All");
      setSelectedEquipment("All");
    }
  };

  const updateItemQuick = (
    dayIdx: number,
    itemIdx: number,
    field: "sets" | "reps" | "weight",
    value: number
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
    if (targetDayIdx === null) return;
    setDays((d) => {
      const next = [...d];
      next[targetDayIdx]!.items.push({
        exerciseId,
        sets: 3,
        reps: 10,
        weight: undefined,
      });
      return next;
    });
    setIsExerciseDialogOpen(false);
    setSearchQuery("");
    setSelectedMuscle("All");
    setSelectedEquipment("All");
  };

  const updateItem = (
    dayIdx: number,
    itemIdx: number,
    field: "sets" | "reps" | "weight",
    value: number
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
      let workoutDays: Array<{ title: string; order: number; items: any[] }> = [];

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
          .filter((day) => day.isCurrentMonth && !day.isRestDay && day.items.length > 0)
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
        name: name || (viewMode === "week" ? "My Weekly Plan" : "My Monthly Plan"),
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
      : Array.from(monthDays.values()).reduce((sum, d) => sum + d.items.length, 0)
    : days.reduce((sum, d) => sum + d.items.length, 0);

  const workoutDaysCount = isQuickMode
    ? viewMode === "week"
      ? weekDays.filter((d) => !d.isRestDay && d.items.length > 0).length
      : Array.from(monthDays.values()).filter(
          (d) => d.isCurrentMonth && !d.isRestDay && d.items.length > 0
        ).length
    : days.length;

  const canSave = userId && name.trim() && workoutDaysCount > 0;

  // Quick Mode View
  if (isQuickMode) {
    return (
      <div className="flex-1 space-y-4 p-6 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quick Workout Builder</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Set up your week - add exercises or mark rest days
            </p>
          </div>
          <Button
            onClick={save}
            disabled={!canSave || create.isPending}
            className="gap-2"
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
          <CardContent className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "week" | "month")}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
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
                    <div className="text-sm font-medium min-w-[120px] text-center">
                      {format(currentMonth, "MMMM yyyy")}
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
                      className="h-8 text-xs ml-2"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {weekDays.map((day, dayIdx) => {
              const exercise = exercises.find((e) => true); // For exercise lookup
              return (
                <Card
                  key={dayIdx}
                  className={cn(
                    "border-0 shadow-sm transition-all",
                    day.isToday && "ring-2 ring-teal-500 ring-offset-2",
                    day.isRestDay && "bg-muted/50"
                  )}
                >
                  <CardHeader className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-base">{day.dayName}</p>
                          {day.isToday && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0">
                              Today
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(day.date, "MMM d")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={day.isRestDay}
                          onCheckedChange={() => toggleRestDay(dayIdx)}
                        />
                        <span className="text-xs text-muted-foreground">Rest</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-3">
                    {day.isRestDay ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Moon className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Rest Day
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Add Exercise Button */}
                        <Dialog
                          open={isExerciseDialogOpen && targetDayIdx === dayIdx}
                          onOpenChange={(open) => {
                            if (!open) {
                              setIsExerciseDialogOpen(false);
                              setTargetDayIdx(null);
                              setSearchQuery("");
                              setSelectedMuscle("All");
                              setSelectedEquipment("All");
                            }
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed gap-2"
                            onClick={() => openExerciseDialogQuick(dayIdx)}
                          >
                            <Plus className="h-4 w-4" />
                            Add Exercise
                          </Button>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Select Exercise for {day.dayName} ({format(day.date, "MMM d")})
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              {/* Search and Filters */}
                              <div className="space-y-3">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search exercises..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-10 h-9"
                                  />
                                  {searchQuery && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                      onClick={() => setSearchQuery("")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <Select
                                    value={selectedMuscle}
                                    onValueChange={setSelectedMuscle}
                                  >
                                    <SelectTrigger className="h-9">
                                      <Target className="h-3.5 w-3.5 mr-2" />
                                      <SelectValue placeholder="Muscle Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="All">All Muscle Groups</SelectItem>
                                      <SelectItem value="Chest">Chest</SelectItem>
                                      <SelectItem value="Back">Back</SelectItem>
                                      <SelectItem value="Shoulders">Shoulders</SelectItem>
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
                                      <Wrench className="h-3.5 w-3.5 mr-2" />
                                      <SelectValue placeholder="Equipment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="All">All Equipment</SelectItem>
                                      <SelectItem value="Barbell">Barbell</SelectItem>
                                      <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                                      <SelectItem value="Cable">Cable</SelectItem>
                                      <SelectItem value="Machine">Machine</SelectItem>
                                      <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                                      <SelectItem value="Kettlebell">Kettlebell</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Exercise List */}
                              <div className="max-h-[400px] overflow-y-auto space-y-1.5">
                                {exercises.length === 0 ? (
                                  <div className="text-center py-8 text-muted-foreground text-sm">
                                    <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No exercises found</p>
                                  </div>
                                ) : (
                                  exercises.map((ex) => (
                                    <Button
                                      key={ex.id}
                                      variant="ghost"
                                      className="w-full justify-start h-auto p-3 hover:bg-accent"
                                      onClick={() => addExerciseQuick(ex.id)}
                                    >
                                      <div className="flex items-start gap-3 w-full text-left">
                                        <div className="p-1.5 rounded bg-teal-100 dark:bg-teal-900/30 shrink-0">
                                          <Dumbbell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm">{ex.name}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                              variant="secondary"
                                              className="text-[9px] px-1.5 py-0 h-4"
                                            >
                                              {ex.muscleGroup}
                                            </Badge>
                                            {ex.equipment && (
                                              <Badge
                                                variant="outline"
                                                className="text-[9px] px-1.5 py-0 h-4"
                                              >
                                                {ex.equipment}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                        <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                                      </div>
                                    </Button>
                                  ))
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Exercise Items */}
                        {day.items.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground text-xs border border-dashed rounded-lg">
                            <p>No exercises yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {day.items.map((item, itemIdx) => {
                              const exercise = exercises.find((e) => e.id === item.exerciseId);
                              return (
                                <div
                                  key={itemIdx}
                                  className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs truncate">
                                      {exercise?.name ?? "Unknown Exercise"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
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
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-10 h-7 text-center text-xs"
                                    />
                                    <span className="text-[10px] text-muted-foreground">×</span>
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
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      className="w-10 h-7 text-center text-xs"
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive shrink-0"
                                    onClick={() => deleteItemQuick(dayIdx, itemIdx)}
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
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const firstDayOfWeek = monthStart.getDay();
                const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const todayStart = startOfDay(today);
                
                // Filter out past dates - only show today and future dates
                const futureDays = daysInMonth.filter((date) => {
                  const dateStart = startOfDay(date);
                  return !isBefore(dateStart, todayStart) || isSameDay(date, today);
                });
                
                // Calculate how many empty cells we need at the start
                // Find the first visible day's position in the week
                const firstVisibleDay = futureDays[0];
                const firstVisibleDayOfWeek = firstVisibleDay ? firstVisibleDay.getDay() : firstDayOfWeek;
                
                // Add empty cells for days before first visible day
                const calendarDays = [
                  ...Array(firstVisibleDayOfWeek).fill(null),
                  ...futureDays,
                ];

                return calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
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

                  const dayData = monthDays.get(dateKey) || {
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
                        "border-0 shadow-sm aspect-square p-2 hover:shadow-md transition-all cursor-pointer",
                        !isCurrentMonth && "opacity-40",
                        isToday && "ring-2 ring-teal-500 ring-offset-1",
                        dayData.isRestDay && "bg-muted/50"
                      )}
                    >
                      <CardContent className="p-0 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isToday && "text-teal-600 font-bold"
                            )}
                          >
                            {date.getDate()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCurrentMonth) {
                                toggleRestDayMonth(dateKey);
                              }
                            }}
                            className={cn(
                              "p-0.5 rounded hover:bg-muted transition-colors",
                              dayData.isRestDay && "bg-teal-100 dark:bg-teal-900/30"
                            )}
                          >
                            <Moon
                              className={cn(
                                "h-3 w-3",
                                dayData.isRestDay
                                  ? "text-teal-600 dark:text-teal-400"
                                  : "text-muted-foreground/50"
                              )}
                            />
                          </button>
                        </div>
                        {dayData.items.length > 0 && (
                          <div className="flex-1 flex items-center justify-center">
                            <Badge variant="secondary" className="text-[8px] px-1 py-0">
                              {dayData.items.length} {dayData.items.length === 1 ? "ex" : "ex"}
                            </Badge>
                          </div>
                        )}
                        {isCurrentMonth && !dayData.isRestDay && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openExerciseDialogMonth(dateKey);
                            }}
                            className="mt-auto pt-1 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
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
                (day) => day.isCurrentMonth && (!day.isRestDay && day.items.length > 0)
              );

              if (daysWithWorkouts.length === 0) {
                return (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-8 text-center text-muted-foreground text-sm">
                      <p>Click on a day to add exercises</p>
                      <p className="text-xs mt-1">Or click the checkbox to mark as rest day</p>
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
                                  <Badge variant="default" className="text-[9px] mt-1">
                                    Today
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={day.isRestDay}
                                  onCheckedChange={() => toggleRestDayMonth(dateKey)}
                                />
                                <span className="text-xs text-muted-foreground">Rest</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 pb-4 space-y-2">
                            {/* Add Exercise Button */}
                            <Dialog
                              open={isExerciseDialogOpen && targetDayIdx === dateKey}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setIsExerciseDialogOpen(false);
                                  setTargetDayIdx(null);
                                  setSearchQuery("");
                                  setSelectedMuscle("All");
                                  setSelectedEquipment("All");
                                }
                              }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed gap-2"
                                onClick={() => openExerciseDialogMonth(dateKey)}
                              >
                                <Plus className="h-4 w-4" />
                                Add Exercise
                              </Button>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Select Exercise for {format(day.date, "MMM d")}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  {/* Search and Filters - Same as week view */}
                                  <div className="space-y-3">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="Search exercises..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-10 h-9"
                                      />
                                      {searchQuery && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                          onClick={() => setSearchQuery("")}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <Select
                                        value={selectedMuscle}
                                        onValueChange={setSelectedMuscle}
                                      >
                                        <SelectTrigger className="h-9">
                                          <Target className="h-3.5 w-3.5 mr-2" />
                                          <SelectValue placeholder="Muscle Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="All">All Muscle Groups</SelectItem>
                                          <SelectItem value="Chest">Chest</SelectItem>
                                          <SelectItem value="Back">Back</SelectItem>
                                          <SelectItem value="Shoulders">Shoulders</SelectItem>
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
                                          <Wrench className="h-3.5 w-3.5 mr-2" />
                                          <SelectValue placeholder="Equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="All">All Equipment</SelectItem>
                                          <SelectItem value="Barbell">Barbell</SelectItem>
                                          <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                                          <SelectItem value="Cable">Cable</SelectItem>
                                          <SelectItem value="Machine">Machine</SelectItem>
                                          <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                                          <SelectItem value="Kettlebell">Kettlebell</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Exercise List */}
                                  <div className="max-h-[400px] overflow-y-auto space-y-1.5">
                                    {exercises.length === 0 ? (
                                      <div className="text-center py-8 text-muted-foreground text-sm">
                                        <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No exercises found</p>
                                      </div>
                                    ) : (
                                      exercises.map((ex) => (
                                        <Button
                                          key={ex.id}
                                          variant="ghost"
                                          className="w-full justify-start h-auto p-3 hover:bg-accent"
                                          onClick={() => addExerciseQuick(ex.id)}
                                        >
                                          <div className="flex items-start gap-3 w-full text-left">
                                            <div className="p-1.5 rounded bg-teal-100 dark:bg-teal-900/30 shrink-0">
                                              <Dumbbell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-sm">{ex.name}</p>
                                              <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                  variant="secondary"
                                                  className="text-[9px] px-1.5 py-0 h-4"
                                                >
                                                  {ex.muscleGroup}
                                                </Badge>
                                                {ex.equipment && (
                                                  <Badge
                                                    variant="outline"
                                                    className="text-[9px] px-1.5 py-0 h-4"
                                                  >
                                                    {ex.equipment}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                                          </div>
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Exercise Items */}
                            {day.items.length > 0 && (
                              <div className="space-y-2">
                                {day.items.map((item, itemIdx) => {
                                  const exercise = exercises.find((e) => e.id === item.exerciseId);
                                  return (
                                    <div
                                      key={itemIdx}
                                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-xs truncate">
                                          {exercise?.name ?? "Unknown Exercise"}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1">
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
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          className="w-10 h-7 text-center text-xs"
                                        />
                                        <span className="text-[10px] text-muted-foreground">×</span>
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
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          className="w-10 h-7 text-center text-xs"
                                        />
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive shrink-0"
                                        onClick={() => deleteItemMonth(dateKey, itemIdx)}
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
        <Card className="border-0 shadow-sm bg-muted/50">
          <CardContent className="px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {workoutDaysCount} workout {workoutDaysCount === 1 ? "day" : "days"}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Dumbbell className="h-3.5 w-3.5" />
                  {totalExercises} {totalExercises === 1 ? "exercise" : "exercises"}
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
    <div className="flex-1 space-y-4 p-6 pt-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout Builder</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create a custom workout plan
          </p>
        </div>
        <Button
          onClick={save}
          disabled={!canSave || create.isPending}
          className="gap-2"
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
        <CardContent className="px-4 pb-4 space-y-2.5">
          <Input
            placeholder="Enter plan name (e.g., My Strength Program)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
          />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              <Dumbbell className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-base font-semibold mb-1">No workout days yet</h3>
              <p className="text-xs text-muted-foreground mb-3 text-center">
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
                          i === dayIdx ? { ...d, title: e.target.value } : d
                        )
                      )
                    }
                    className="h-8 text-sm font-semibold flex-1"
                    placeholder="Day title (e.g., Monday - Push)"
                  />
                  {days.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteDay(dayIdx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {/* Add Exercise Button */}
                <Dialog
                  open={isExerciseDialogOpen && targetDayIdx === dayIdx}
                  onOpenChange={(open) => {
                    setIsExerciseDialogOpen(open);
                    if (!open) {
                      setTargetDayIdx(null);
                      setSearchQuery("");
                      setSelectedMuscle("All");
                      setSelectedEquipment("All");
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed gap-2"
                      onClick={() => openExerciseDialog(dayIdx)}
                    >
                      <Plus className="h-4 w-4" />
                      Add Exercise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Exercise</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {/* Search and Filters */}
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search exercises..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-9"
                          />
                          {searchQuery && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                              onClick={() => setSearchQuery("")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={selectedMuscle}
                            onValueChange={setSelectedMuscle}
                          >
                            <SelectTrigger className="h-9">
                              <Target className="h-3.5 w-3.5 mr-2" />
                              <SelectValue placeholder="Muscle Group" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Muscle Groups</SelectItem>
                              <SelectItem value="Chest">Chest</SelectItem>
                              <SelectItem value="Back">Back</SelectItem>
                              <SelectItem value="Shoulders">Shoulders</SelectItem>
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
                              <Wrench className="h-3.5 w-3.5 mr-2" />
                              <SelectValue placeholder="Equipment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All">All Equipment</SelectItem>
                              <SelectItem value="Barbell">Barbell</SelectItem>
                              <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                              <SelectItem value="Cable">Cable</SelectItem>
                              <SelectItem value="Machine">Machine</SelectItem>
                              <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                              <SelectItem value="Kettlebell">Kettlebell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Exercise List */}
                      <div className="max-h-[400px] overflow-y-auto space-y-1.5">
                        {exercises.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No exercises found</p>
                          </div>
                        ) : (
                          exercises.map((ex) => (
                            <Button
                              key={ex.id}
                              variant="ghost"
                              className="w-full justify-start h-auto p-3 hover:bg-accent"
                              onClick={() => addExercise(ex.id)}
                            >
                              <div className="flex items-start gap-3 w-full text-left">
                                <div className="p-1.5 rounded bg-teal-100 dark:bg-teal-900/30 shrink-0">
                                  <Dumbbell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{ex.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-[9px] px-1.5 py-0 h-4"
                                    >
                                      {ex.muscleGroup}
                                    </Badge>
                                    {ex.equipment && (
                                      <Badge
                                        variant="outline"
                                        className="text-[9px] px-1.5 py-0 h-4"
                                      >
                                        {ex.equipment}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Exercise Items */}
                {day.items.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                    <p>No exercises added yet</p>
                    <p className="text-xs mt-1">Click "Add Exercise" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {day.items.map((item, itemIdx) => {
                      const exercise = exercises.find((e) => e.id === item.exerciseId);
                      return (
                        <div
                          key={itemIdx}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {exercise?.name ?? "Unknown Exercise"}
                            </p>
                            {exercise && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 mt-1"
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
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-14 h-8 text-center text-xs"
                              />
                              <span className="text-[10px] text-muted-foreground w-8">
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
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-14 h-8 text-center text-xs"
                              />
                              <span className="text-[10px] text-muted-foreground w-10">
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
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 h-8 text-center text-xs"
                                  />
                                  <span className="text-[10px] text-muted-foreground w-6">
                                    kg
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive shrink-0"
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
