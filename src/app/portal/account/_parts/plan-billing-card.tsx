"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export function PlanBillingCard({ userId }: { userId: string }) {
  const plansQuery = api.plan.listByUser.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const planCount = Array.isArray(plansQuery.data) ? plansQuery.data.length : 0;
  const activePlanCount = Array.isArray(plansQuery.data)
    ? plansQuery.data.filter((p) => (p as { isActive?: boolean }).isActive)
        .length
    : 0;

  return (
    <Card className="bg-card text-card-foreground from-primary to-primary/80 rounded-xl border border-none shadow-sm">
      <CardHeader className="border-b py-4">
        <div>
          <div className="text-sm font-semibold">Plan and billing</div>
          <div className="text-muted-foreground text-xs">Current plan and benefits</div>
        </div>
      </CardHeader>
      <CardContent className="text-card-foreground rounded-b-xl pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-medium">Current plan</div>
            <div className="text-muted-foreground text-xs">Free plan • {planCount} workout plans, {activePlanCount} active</div>
          </div>
          <Button type="button" variant="outline" size="sm">Upgrade plan</Button>
        </div>
      </CardContent>
    </Card>
  );
}
