"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Star } from "lucide-react";

export function PlanBillingCard({ userId: _userId }: { userId: string }) {
  const planCount = 0;
  const activePlanCount = 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-teal-600" />
          Plan and Billing
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Current plan and benefits
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                Free Plan
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {planCount} plans
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {activePlanCount} active
              </span>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
            Upgrade plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
