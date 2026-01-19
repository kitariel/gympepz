"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function GuestModeBanner() {
  const { isOnline } = useOnlineStatus();

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Badge variant="secondary">Guest mode</Badge>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Using GymPepz without an account</p>
          <p className="text-xs text-muted-foreground">
            {isOnline
              ? "Your session is temporary. Create an account to save your progress."
              : "Offline • You can keep logging in this session."}
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="h-9">
        <Link href="/login">Save your progress</Link>
      </Button>
    </div>
  );
}

