"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PR {
  id: string;
  exercise?: {
    name: string;
  };
  prType: string;
  value: number;
  reps?: number;
}

interface RecentPRsProps {
  prs: PR[];
}

export function RecentPRs({ prs }: RecentPRsProps) {
  const router = useRouter();

  if (!prs || prs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-primary" />
          Personal Records
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-[10px] text-primary hover:text-primary/80"
          onClick={() => router.push("/portal/train/history")}
        >
          View All
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        {prs.map((pr) => (
          <div
            key={pr.id}
            className={cn(
              "group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer",
              "bg-muted/50 hover:bg-muted",
              "border border-transparent hover:border-primary/20"
            )}
            onClick={() => router.push("/portal/train/history")}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate text-foreground">
                  {pr.exercise?.name ?? "Exercise"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {pr.prType === "max_weight"
                    ? `${pr.value} kg × ${pr.reps ?? 1} reps`
                    : `${pr.value} kg`}
                </div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="ml-2 shrink-0 group-hover:scale-105 transition-transform"
            >
              <span className="text-[9px] font-bold">PR</span>
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
