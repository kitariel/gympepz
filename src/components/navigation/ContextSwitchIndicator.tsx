"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavContext } from "@/hooks/useNavigationContext";

interface ContextSwitchIndicatorProps {
  currentContext: NavContext;
  portalBasePath: string;
  trainBasePath: string;
}

export function ContextSwitchIndicator({
  currentContext,
  portalBasePath,
  trainBasePath,
}: ContextSwitchIndicatorProps) {
  const router = useRouter();

  const handleSwitch = () => {
    if (currentContext === "train") {
      // Switch to portal
      router.push(portalBasePath);
    } else {
      // Switch to train
      router.push(trainBasePath);
    }
  };

  const isTrain = currentContext === "train";

  return (
    <button
      onClick={handleSwitch}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        "text-muted-foreground transition-all duration-200",
        "hover:bg-muted/60 hover:text-foreground",
        "active:scale-95",
      )}
      aria-label={
        isTrain ? "Switch to Portal navigation" : "Switch to Train navigation"
      }
    >
      {isTrain ? (
        <ChevronRight className="h-5 w-5" />
      ) : (
        <ChevronLeft className="h-5 w-5" />
      )}
    </button>
  );
}
