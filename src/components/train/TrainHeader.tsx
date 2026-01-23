"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useRouteContext } from "@/hooks/useRouteContext";
import { trainPath } from "@/lib/routes";
import { InstallPWAButton } from "@/components/pwa-install-button";

function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return isOnline;
}

export function TrainHeader() {
  const isOnline = useIsOnline();
  const routeContext = useRouteContext();
  const { activeProgram, hydrated } = useActiveProgram();

  const programName = useMemo(() => {
    if (!hydrated || !activeProgram) return null;
    return (activeProgram.name ?? "").trim() || null;
  }, [activeProgram, hydrated]);

  return (
    <header className="border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={'/'}
            // href={trainPath(routeContext)}
            className={cn(
              "text-sm font-semibold tracking-tight",
              "hover:opacity-90",
            )}
          >
            GymPepz
          </Link>
          {programName ? (
            <div className="min-w-0">
              <p className="text-muted-foreground truncate text-xs">
                {programName}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="text-xs font-medium text-foreground/80 transition hover:text-foreground"
          >
            Log in
          </Link>
          <InstallPWAButton />
          <Badge variant="secondary">Offline-first</Badge>
          {!isOnline ? <Badge variant="outline">Offline</Badge> : null}
        </div>
      </div>
    </header>
  );
}
