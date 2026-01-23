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
      <CardContent className="space-y-2 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
            Body Stats
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 h-auto p-0 text-[10px]"
            onClick={() => router.push("/portal/train/history")}
          >
            Update
          </Button>
        </div>

        {/* Stats - Compact Inline */}
        <div className="bg-primary/5 flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
          <div className="flex flex-1 items-center gap-1.5">
            <Scale className="text-primary h-3 w-3 shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-primary text-sm font-bold">{weight}</span>
              <span className="text-muted-foreground text-[8px]">kg</span>
            </div>
          </div>

          {bodyFat && (
            <>
              <div className="bg-primary/20 h-3 w-px" />
              <div className="flex flex-1 items-center gap-1.5">
                <Percent className="text-primary h-3 w-3 shrink-0" />
                <div className="flex items-baseline gap-1">
                  <span className="text-primary text-sm font-bold">
                    {bodyFat}
                  </span>
                  <span className="text-muted-foreground text-[8px]">%</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
