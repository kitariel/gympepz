"use client";

import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSyncWorkouts } from "@/hooks/useSyncWorkouts";
import { toast } from "sonner";

export function SyncCard() {
  const {
    syncOfflineWorkouts,
    hasUnsyncedWorkouts,
    unsyncedCount,
    isSyncing,
    error,
  } = useSyncWorkouts();

  const handleSync = async () => {
    try {
      const result = await syncOfflineWorkouts();
      if (result.synced > 0) {
        toast.success(
          `Synced ${result.synced} workout${result.synced > 1 ? "s" : ""}`,
          { duration: 3000 },
        );
      }
      if (result.failed > 0) {
        toast.warning(
          `${result.failed} workout${result.failed > 1 ? "s" : ""} failed to sync`,
          { duration: 4000 },
        );
      }
      if (result.synced === 0 && result.failed === 0) {
        toast.info("No workouts to sync", { duration: 2000 });
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to sync workouts",
        { duration: 4000 },
      );
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-teal-600" />
            Sync Workouts
          </CardTitle>
          {hasUnsyncedWorkouts && (
            <Badge variant="secondary" className="text-xs">
              {unsyncedCount} pending
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Sync your offline workouts to the cloud
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {hasUnsyncedWorkouts ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You have <strong>{unsyncedCount}</strong> workout
              {unsyncedCount > 1 ? "s" : ""} saved offline that can be synced
              to your account.
            </p>
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full"
              size="sm"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>All workouts are synced</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Sync error: {error.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
