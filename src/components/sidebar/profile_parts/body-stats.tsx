"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Scale, Percent } from "lucide-react";

interface BodyStatsProps {
  weight?: number;
  bodyFat?: number;
}

export function BodyStats({ weight, bodyFat }: BodyStatsProps) {
  const router = useRouter();

  if (!weight) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
            Body Stats
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-[10px] text-primary hover:text-primary/80"
            onClick={() => router.push("/portal/log?tab=progress")}
          >
            Update
          </Button>
        </div>

        {/* Stats - Compact Inline */}
        <div className="flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20 rounded-lg px-2 py-1.5 gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            <Scale className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                {weight}
              </span>
              <span className="text-[8px] text-muted-foreground">kg</span>
            </div>
          </div>
          
          {bodyFat && (
            <>
              <div className="h-3 w-px bg-teal-200 dark:bg-teal-800" />
              <div className="flex items-center gap-1.5 flex-1">
                <Percent className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0" />
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                    {bodyFat}
                  </span>
                  <span className="text-[8px] text-muted-foreground">%</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
