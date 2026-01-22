import type { RouteContext } from "@/hooks/useRouteContext";

/**
 * Build a train route path that respects the current route context.
 * Ensures navigation stays within portal or standalone as appropriate.
 *
 * @param context - "portal" or "standalone"
 * @param path - The path segment after /train (e.g., "log", "templates", "history")
 * @param params - Optional query parameters
 *
 * @example
 * trainPath("portal", "log") → "/portal/train/log"
 * trainPath("standalone", "templates") → "/train/templates"
 * trainPath("portal", "log", { day: "1" }) → "/portal/train/log?day=1"
 */
export function trainPath(
  context: RouteContext,
  path: string = "",
  params?: Record<string, string | number>
): string {
  const base = context === "portal" ? "/portal/train" : "/train";
  let url = path ? `${base}/${path}` : base;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, String(value));
    }
    url += `?${searchParams.toString()}`;
  }

  return url;
}

/**
 * Build a goals route path that respects the current route context.
 *
 * @param context - "portal" or "standalone"
 * @param path - The path segment after /goals (e.g., "new", "[goalId]")
 */
export function goalsPath(context: RouteContext, path: string = ""): string {
  const base = context === "portal" ? "/portal/goals" : "/goals";
  return path ? `${base}/${path}` : base;
}

/**
 * Get the base path for the current context.
 */
export function basePath(context: RouteContext): string {
  return context === "portal" ? "/portal" : "";
}
