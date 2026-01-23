"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export type NavContext = "portal" | "train";

export interface NavigationContextInfo {
  navContext: NavContext; // Which nav to show
  isInPortalWrapper: boolean; // Is under /portal/*
  trainBasePath: string; // "/portal/train" or "/train"
  portalBasePath: string; // "/portal"
  canSwitchContext: boolean; // Can switch between portal/train
}

/**
 * Determines the navigation context based on the current route.
 *
 * Rules:
 * - /portal/train/* → Train navigation (in portal wrapper)
 * - /portal/* → Portal navigation
 * - /train/* → Train navigation (standalone)
 *
 * @returns NavigationContextInfo with context details
 */
export function useNavigationContext(): NavigationContextInfo {
  const pathname = usePathname();

  return useMemo(() => {
    // Check if we're in a train route (including portal/train)
    const isTrainRoute =
      pathname.startsWith("/portal/train") || pathname.startsWith("/train");

    // Check if we're in portal wrapper
    const isInPortalWrapper = pathname.startsWith("/portal");

    // Determine navigation context
    const navContext: NavContext = isTrainRoute ? "train" : "portal";

    // Determine train base path
    const trainBasePath = isInPortalWrapper ? "/portal/train" : "/train";

    // Can switch context if we're in portal wrapper and on a train route
    // OR if we're in portal and not on a train route
    const canSwitchContext = isInPortalWrapper;

    return {
      navContext,
      isInPortalWrapper,
      trainBasePath,
      portalBasePath: "/portal",
      canSwitchContext,
    };
  }, [pathname]);
}
