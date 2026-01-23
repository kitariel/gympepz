"use client";

import { cn } from "@/lib/utils";
import { useNavigationContext } from "@/hooks/useNavigationContext";
import { PortalNavContent } from "./PortalNavContent";
import { TrainNavContent } from "./TrainNavContent";

export function ContextAwareBottomNav() {
  const { navContext, trainBasePath, portalBasePath, canSwitchContext } =
    useNavigationContext();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 md:hidden">
      <div className="border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/80 relative border-t shadow-lg backdrop-blur">
        {/* Animated navigation container */}
        <div className="relative h-[calc(80px+env(safe-area-inset-bottom))] w-full overflow-hidden">
          {/* Portal navigation - slides left/right */}
          <div
            className={cn(
              "absolute inset-0 z-10 w-full transition-transform duration-300 ease-in-out",
              navContext === "portal" ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <PortalNavContent
              portalBasePath={portalBasePath}
              trainBasePath={trainBasePath}
            />
          </div>

          {/* Train navigation - slides left/right */}
          <div
            className={cn(
              "absolute inset-0 z-10 w-full transition-transform duration-300 ease-in-out",
              navContext === "train" ? "translate-x-0" : "translate-x-full",
            )}
          >
            <TrainNavContent
              basePath={trainBasePath}
              showContextSwitch={canSwitchContext}
              portalBasePath={portalBasePath}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
