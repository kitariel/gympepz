"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { StorageIndicator } from "@/features/train/components/StorageIndicator";

type TrainShellProps = {
  children: ReactNode;
  className?: string;
};

export function TrainShell({ children, className }: TrainShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-6 p-6 pt-4", className)}>
      <StorageIndicator />
      {children}
    </div>
  );
}
