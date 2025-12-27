"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, BarChart3, Target, Scale } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";

interface QuickActionsProps {
  activePlanId?: string;
}

export function QuickActions({ activePlanId }: QuickActionsProps) {
  const router = useRouter();

  const handleStartWorkout = () => {
    if (activePlanId) {
      router.push(`/portal/log?quickStart=${activePlanId}`);
    } else {
      router.push("/portal/log");
    }
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
        Actions
      </SidebarGroupLabel>
      <SidebarGroupContent className="px-3 gap-2 grid grid-cols-2">
        <Button
          className="w-full col-span-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          onClick={handleStartWorkout}
        >
          <Play className="h-4 w-4 mr-2 fill-current" />
          Start Workout
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs justify-start"
          onClick={() => router.push("/portal/log?tab=analytics")}
        >
          <BarChart3 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          Analytics
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs justify-start"
          onClick={() => router.push("/portal/plans")}
        >
          <Target className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          Plans
        </Button>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
