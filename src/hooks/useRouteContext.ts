"use client";

import { usePathname } from "next/navigation";

export type RouteContext = "portal" | "standalone";

/**
 * Detects whether the current route is within the portal or standalone.
 * Use this to ensure navigation stays within the correct context.
 */
export function useRouteContext(): RouteContext {
  const pathname = usePathname();
  return pathname.startsWith("/portal") ? "portal" : "standalone";
}
