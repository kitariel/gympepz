/**
 * Loading state component for Start Workout page
 */

import { Dumbbell } from "lucide-react";

export function LoadingView() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center">
        <Dumbbell className="text-muted-foreground mx-auto mb-4 h-10 w-10 animate-spin sm:h-12 sm:w-12" />
        <p className="text-muted-foreground text-sm sm:text-base">
          Loading your workout...
        </p>
      </div>
    </div>
  );
}

