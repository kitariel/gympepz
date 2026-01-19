"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, ChevronRight } from "lucide-react";

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
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-yellow-500" />
              Recent PRs
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[10px] text-primary hover:text-primary/80"
              onClick={() => router.push("/train/history")}
            >
              View All
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          
          <div className="space-y-1.5">
            {prs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20 hover:from-yellow-100/70 hover:to-amber-100/70 dark:hover:from-yellow-950/30 dark:hover:to-amber-950/30 transition-all cursor-pointer group"
                onClick={() => router.push("/train/history")}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate text-foreground">
                    {pr.exercise?.name ?? "Exercise"}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {pr.prType === "max_weight"
                      ? `${pr.value} kg × ${pr.reps ?? 1} reps`
                      : `${pr.value} kg`}
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 shrink-0 group-hover:scale-105 transition-transform"
                >
                  <Award className="h-2.5 w-2.5 mr-1" />
                  <span className="text-[9px] font-semibold">PR</span>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
