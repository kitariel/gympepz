"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Target } from "lucide-react";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const router = useRouter();
  const pathname = usePathname();
  const isAnalyticsActive = pathname?.startsWith("/portal/train/history");
  const isTemplatesActive = pathname?.startsWith("/portal/train/templates");

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupContent className="space-y-2 px-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 text-xs font-medium transition-all",
              isAnalyticsActive &&
                "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
            )}
            onClick={() => router.push("/portal/train/history")}
          >
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Analytics
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 text-xs font-medium transition-all",
              isTemplatesActive &&
                "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20"
            )}
            onClick={() => router.push("/portal/train/templates")}
          >
            <Target className="mr-1.5 h-3.5 w-3.5" />
            Templates
          </Button>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
