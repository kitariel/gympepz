import type { ReactNode } from "react";

import { BottomNavigation } from "@/components/navigation";
import { TrainBottomNav } from "@/components/train/TrainBottomNav";
import { TrainHeader } from "@/components/train/TrainHeader";
import { WorkoutSessionDock } from "@/components/train/WorkoutSessionDock";
import { TrainModeProvider } from "@/features/train/context/TrainModeContext";
import {
  ActiveWorkoutStatusSync,
  ActiveWorkoutConflictPrompt,
  SessionTakenOverBanner,
  OutboxSyncProvider,
  DeviceRegistration,
  TemplateCacheProvider,
} from "@/components/sync";

export default function TrainLayout({ children }: { children: ReactNode }) {
  return (
    <TrainModeProvider>
      {/* Sync components - invisible, handle background sync */}
      <OutboxSyncProvider />
      <DeviceRegistration />
      <TemplateCacheProvider />
      <ActiveWorkoutStatusSync />
      <ActiveWorkoutConflictPrompt />
      <SessionTakenOverBanner />

      <div className="min-h-dvh">
        <TrainHeader />
        <main className="pb-24 md:pb-0">{children}</main>
        <WorkoutSessionDock />
        <BottomNavigation />
        <TrainBottomNav variant="dock" />
      </div>
    </TrainModeProvider>
  );
}
