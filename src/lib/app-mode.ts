import type { Session } from "next-auth";

export type AppMode = "authenticated" | "guest";

/**
 * Single mode resolver used across the app.
 * - If session exists: authenticated mode
 * - Else: guest mode
 */
export function resolveAppMode(session: Session | null | undefined): AppMode {
  return session?.user ? "authenticated" : "guest";
}

