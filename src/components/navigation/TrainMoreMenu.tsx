"use client";

import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Dumbbell,
  FolderOpen,
  Sparkles,
  Target,
} from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

interface TrainMoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePath: string; // "/portal/train" or "/train"
}

export function TrainMoreMenu({
  open,
  onOpenChange,
  basePath,
}: TrainMoreMenuProps) {
  const router = useRouter();

  const menuItems = [
    {
      href: `${basePath}/overview`,
      label: "Program overview",
      description: "View your weekly plan",
      icon: Dumbbell,
    },
    {
      href: `${basePath}/templates`,
      label: "Browse templates",
      description: "Find a starter program",
      icon: Sparkles,
    },
    {
      href: `${basePath}/plans`,
      label: "My saved plans",
      description: "View your custom programs",
      icon: FolderOpen,
    },
    {
      href: `${basePath}/build`,
      label: "Create program",
      description: "Build a custom plan",
      icon: Dumbbell,
    },
    {
      href: "/portal/goals",
      label: "Goals",
      description: "Track strength & progress",
      icon: Target,
    },
  ];

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="More">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => {
              onOpenChange(false);
              router.push(item.href);
            }}
            className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
          >
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <item.icon className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-muted-foreground text-xs">{item.description}</p>
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
