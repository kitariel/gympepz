import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PortalTrainShellProps = {
  children: ReactNode;
  className?: string;
};

export function PortalTrainShell({ children, className }: PortalTrainShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-6 p-6 pt-4", className)}>
      {children}
    </div>
  );
}
