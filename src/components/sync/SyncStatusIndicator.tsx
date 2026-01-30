"use client";

import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useOutboxSync } from "@/hooks/useOutboxSync";
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SyncStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function SyncStatusIndicator({
  className,
  showLabel = false,
}: SyncStatusIndicatorProps) {
  const { data: session } = useSession();
  const { isOnline } = useOnlineStatus();
  const {
    isSyncing,
    pendingCount,
    failedCount,
    lastSyncAt,
    lastError,
    syncNow,
    retryFailed,
    hasUnsyncedEvents,
  } = useOutboxSync();

  // Don't show for unauthenticated users
  if (!session?.user?.id) {
    return null;
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Determine status
  let status: "synced" | "syncing" | "pending" | "failed" | "offline" = "synced";
  let statusText = "Synced";
  let StatusIcon = Check;

  if (!isOnline) {
    status = "offline";
    statusText = "Offline";
    StatusIcon = CloudOff;
  } else if (isSyncing) {
    status = "syncing";
    statusText = "Syncing...";
    StatusIcon = RefreshCw;
  } else if (failedCount > 0) {
    status = "failed";
    statusText = `${failedCount} failed`;
    StatusIcon = AlertCircle;
  } else if (pendingCount > 0) {
    status = "pending";
    statusText = `${pendingCount} pending`;
    StatusIcon = Cloud;
  }

  const tooltipContent = (
    <div className="space-y-1 text-xs">
      <div className="font-medium">Sync Status</div>
      <div>Pending: {pendingCount}</div>
      <div>Failed: {failedCount}</div>
      <div>Last sync: {formatLastSync(lastSyncAt)}</div>
      {lastError && <div className="text-red-400">Error: {lastError}</div>}
      {!isOnline && <div className="text-yellow-400">You're offline</div>}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1.5 h-8 px-2",
              status === "failed" && "text-red-500",
              status === "syncing" && "text-blue-500",
              status === "pending" && "text-yellow-500",
              status === "offline" && "text-gray-500",
              className
            )}
            onClick={() => {
              if (status === "failed") {
                void retryFailed();
              } else if (status === "pending" || hasUnsyncedEvents) {
                void syncNow();
              }
            }}
            disabled={isSyncing || !isOnline}
          >
            <StatusIcon
              className={cn(
                "h-4 w-4",
                status === "syncing" && "animate-spin"
              )}
            />
            {showLabel && <span className="text-xs">{statusText}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
