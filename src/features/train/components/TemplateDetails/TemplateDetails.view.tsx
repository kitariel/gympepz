"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateDetailsViewProps } from "./TemplateDetails.types";

export function TemplateDetailsView(props: TemplateDetailsViewProps) {
  if (props.kind === "notFound") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Template not found</h1>
        <Button asChild variant="outline" className="h-10">
          <Link href={props.backHref}>Back to templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{props.name}</h1>
          <p className="text-sm text-muted-foreground">{props.description}</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {props.daysPerWeek} days/wk
        </Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Weekly structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {props.days.map((day) => (
            <div key={day.label} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{day.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{day.items.length} exercises</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Day {day.dayIndex}
                </Badge>
              </div>
              <ul className="mt-2 space-y-1">
                {day.items.map((it, idx) => (
                  <li
                    key={`${day.dayIndex}-${idx}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="truncate">{it.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{it.setsText}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="h-10 flex-1" onClick={props.onUse}>
          Use this program
        </Button>
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href={props.backHref}>Back</Link>
        </Button>
      </div>
    </div>
  );
}

