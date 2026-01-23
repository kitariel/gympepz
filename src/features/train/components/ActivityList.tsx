"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { activityStorage, type StoredWorkout } from "@/lib/storage/activityStorage";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useSyncWorkouts } from "@/hooks/useSyncWorkouts";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workoutRepo } from "@/lib/storage/workoutRepo";

const FILTERS = ["all", "pending", "synced", "failed"] as const;

type Filter = (typeof FILTERS)[number];

type ActivityItem = {
  id: string;
  key: string;
  title: string;
  date: Date;
  dateText: string;
  exercises: number;
  setsDone: number;
  setsTotal: number;
  durationMinutes: number | null;
  volume: number | null;
  status: "pending" | "syncing" | "synced" | "failed";
  source: "local" | "cloud";
};

function formatDateTime(value: string | Date): string {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function computeVolume(stored: StoredWorkout): number | null {
  const total = stored.workout.sets.reduce((sum, set) => {
    const weight = toNumber(set.actualWeight);
    const reps = toNumber(set.actualReps);
    if (!weight || !reps) return sum;
    return sum + weight * reps;
  }, 0);
  return total > 0 ? Math.round(total) : null;
}

function buildLocalItem(stored: StoredWorkout): ActivityItem {
  const exercises = stored.workout.exercises.length;
  const setsDone = stored.workout.sets.filter((s) => s.completed).length;
  const setsTotal = stored.workout.sets.length;
  const startedAt = new Date(stored.workout.startedAt);
  const endedAt = stored.workout.endedAt ? new Date(stored.workout.endedAt) : null;
  const durationMinutes =
    endedAt ? Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)) : null;

  return {
    id: stored.id,
    key: `local-${stored.id}`,
    title: stored.workout.programName ?? "Workout",
    date: new Date(stored.workout.date),
    dateText: formatDateTime(stored.workout.date),
    exercises,
    setsDone,
    setsTotal,
    durationMinutes,
    volume: computeVolume(stored),
    status: stored.status,
    source: "local",
  };
}

export function ActivityList() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { isOnline } = useOnlineStatus();
  const { syncOfflineWorkouts, isSyncing } = useSyncWorkouts();

  const [filter, setFilter] = useState<Filter>("all");
  const [pending, setPending] = useState<StoredWorkout[]>([]);
  const [synced, setSynced] = useState<StoredWorkout[]>([]);

  const dbWorkoutsQuery = api.workoutLog.list.useQuery(
    { userId, limit: 30 },
    { enabled: Boolean(userId) && isOnline },
  );

  useEffect(() => {
    const refresh = () => {
      setPending(activityStorage.listPending());
      setSynced(activityStorage.listSynced());
    };
    refresh();
    if (activityStorage.listPending().length === 0) {
      const history = workoutRepo.getHistory().filter((w) => w.completed);
      for (const workout of history) {
        activityStorage.addPending(workout);
      }
      refresh();
    }
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (!detail?.key) return;
      if (["gympepz.pending_workouts", "gympepz.synced_workouts"].includes(detail.key)) {
        refresh();
      }
    };
    window.addEventListener("workout-storage-changed", handler);
    return () => window.removeEventListener("workout-storage-changed", handler);
  }, []);

  const localItems = useMemo(() => {
    const pendingItems = pending.map(buildLocalItem);
    const syncedItems = synced.map(buildLocalItem);
    return [...pendingItems, ...syncedItems];
  }, [pending, synced]);

  const syncedIdSet = useMemo(() => new Set(synced.map((item) => item.syncedId).filter(Boolean)), [synced]);

  const cloudItems = useMemo(() => {
    const items = dbWorkoutsQuery.data?.items ?? [];
    return items
      .filter((item) => !syncedIdSet.has(item.id))
      .map<ActivityItem>((item) => ({
        id: item.id,
        key: `cloud-${item.id}`,
        title: "Workout",
        date: new Date(item.date),
        dateText: formatDateTime(item.date),
        exercises: item._count.exercises,
        setsDone: item._count.exercises,
        setsTotal: item._count.exercises,
        durationMinutes: item.duration ?? null,
        volume: null,
        status: "synced",
        source: "cloud",
      }));
  }, [dbWorkoutsQuery.data?.items, syncedIdSet]);

  const allItems = useMemo(() => {
    const merged = [...localItems, ...cloudItems];
    return merged.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [localItems, cloudItems]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return allItems;
    return allItems.filter((item) => item.status === filter);
  }, [allItems, filter]);

  const statusCounts = useMemo(() => {
    return FILTERS.reduce((acc, key) => {
      acc[key] = allItems.filter((item) => (key === "all" ? true : item.status === key)).length;
      return acc;
    }, {} as Record<Filter, number>);
  }, [allItems]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 p-6 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground">
            {isOnline ? "Online" : "Offline"} • {pending.length} pending
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-9"
            disabled={!pending.length || isSyncing || !isOnline}
            onClick={() => void syncOfflineWorkouts()}
          >
            {isSyncing ? "Syncing..." : "Sync all"}
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-wrap gap-2 p-4">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                filter === key
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {key === "all" ? "All" : key[0]!.toUpperCase() + key.slice(1)}
              <span className="ml-1 text-[10px]">{statusCounts[key]}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item, index) => (
            <Card key={item.key + index} className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{item.dateText}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px]",
                      item.status === "pending" && "bg-amber-100 text-amber-700",
                      item.status === "syncing" && "bg-blue-100 text-blue-700",
                      item.status === "synced" && "bg-emerald-100 text-emerald-700",
                      item.status === "failed" && "bg-rose-100 text-rose-700",
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                <div className="text-sm text-muted-foreground">
                  {item.exercises} exercises • {item.setsDone}/{item.setsTotal} sets
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.durationMinutes ? `${item.durationMinutes} min` : "Duration N/A"}
                  {item.volume ? ` • ${item.volume.toLocaleString()} lbs volume` : ""}
                </div>
                <div className="flex gap-2 pt-2">
                  {item.status === "pending" || item.status === "failed" ? (
                    <Button
                      size="sm"
                      disabled={!isOnline || isSyncing}
                      onClick={() => void syncOfflineWorkouts()}
                    >
                      Sync now
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline">
                    View details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
