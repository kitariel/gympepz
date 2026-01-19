import type { ReactNode } from "react";

import { TrainBottomNav } from "../../components/train/TrainBottomNav";
import { TrainHeader } from "../../components/train/TrainHeader";
import { WorkoutSessionDock } from "../../components/train/WorkoutSessionDock";

export default function TrainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <TrainHeader />
      <main className="pb-24">{children}</main>
      <WorkoutSessionDock />
      <TrainBottomNav />
    </div>
  );
}
