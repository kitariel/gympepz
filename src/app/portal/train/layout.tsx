import type { ReactNode } from "react";
import { TrainModeProvider } from "@/features/train/context/TrainModeContext";

export default function PortalTrainLayout({ children }: { children: ReactNode }) {
  return (
    <TrainModeProvider>
      <div className="flex flex-col h-full">
        {children}
      </div>
    </TrainModeProvider>
  );
}
