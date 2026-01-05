/**
 * Loading state component for Start Workout page
 */

import { Dumbbell } from "lucide-react";

export function LoadingView() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Dumbbell className="text-muted-foreground mx-auto mb-4 h-12 w-12 animate-spin" />
        <p className="text-muted-foreground">Loading your workout...</p>
      </div>
    </div>
  );
}

