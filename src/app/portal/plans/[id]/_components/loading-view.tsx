/**
 * Loading state component for Plan Detail page
 */

import { Dumbbell } from "lucide-react";

export function LoadingView() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto animate-pulse">
          <Dumbbell className="text-primary h-8 w-8" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">
            Loading workout plan...
          </p>
          <p className="text-muted-foreground text-sm">
            Preparing your schedule
          </p>
        </div>
      </div>
    </div>
  );
}

