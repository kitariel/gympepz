"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function GuestModeBanner() {
  const { isOnline } = useOnlineStatus();

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="guest-mode-banner"
    >
      <div className="flex items-start gap-3">
        <Badge variant="secondary">Guest mode</Badge>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Using Go-Train without an account</p>
          <p className="text-xs text-muted-foreground">
            {isOnline
              ? "Saved locally on this device. Create an account to sync and back up."
              : "Offline • Saved locally on this device."}
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="h-9" data-testid="guest-sync-cta">
        <Link href="/login">Sync & back up</Link>
      </Button>
    </div>
  );
}
