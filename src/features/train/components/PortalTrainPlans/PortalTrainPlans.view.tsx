"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalTrainShell } from "@/features/train/components/PortalTrainShell";
import type { PortalTrainPlansViewProps } from "./PortalTrainPlans.types";

export function PortalTrainPlansView(props: PortalTrainPlansViewProps) {
  return (
    <PortalTrainShell className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved locally on this device. Create, edit, reuse anytime.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <Link
            href="/train"
            className="text-xs font-medium text-foreground/80 transition hover:text-foreground"
          >
            Single view
          </Link>
          <Button asChild className="h-10">
            <Link href={props.createHref} data-testid="plans-create">
              Create new
            </Link>
          </Button>
        </div>
      </div>

      {!props.hydrated ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : props.items.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pb-2 pt-4">
            <CardTitle className="text-base">No saved plans yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Create a plan to save it here.
            </p>
            <Button asChild className="h-10 w-full sm:w-auto">
              <Link href={props.createHref} data-testid="plans-create-first">
                Create your first plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {props.items.map((plan) => (
            <Card key={plan.id} className="border-0 shadow-sm">
              <CardHeader className="px-4 pb-2 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {plan.plan.days.filter((d) => !d.isRestDay && d.items.length > 0).length}{" "}
                    training days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-4 pb-4 sm:flex-row">
                <Button
                  className="h-10 flex-1"
                  onClick={() => props.onUse(plan.id)}
                  data-testid="plans-use"
                >
                  Use
                </Button>
                <Button asChild variant="outline" className="h-10 flex-1">
                  <Link href={props.getEditHref(plan.id)} data-testid="plans-edit">
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => props.onDuplicate(plan.id)}
                  data-testid="plans-duplicate"
                >
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => props.onDelete(plan.id)}
                  data-testid="plans-delete"
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button asChild variant="outline" className="h-10 w-full sm:w-auto">
        <Link href={props.backHref}>Back</Link>
      </Button>
    </PortalTrainShell>
  );
}
