"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTemplateById } from "@/lib/program-templates/templates";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

function nowIso(): string {
  return new Date().toISOString();
}

export function TemplateDetails({ templateId }: { templateId: string }) {
  const router = useRouter();
  const { selectTemplate, saveActiveProgram } = useActiveProgram();
  const { clearDraft } = useWorkoutDraft();

  const template = useMemo(() => getTemplateById(templateId), [templateId]);

  if (!template) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 p-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Template not found</h1>
        <Button asChild variant="outline" className="h-10">
          <Link href="/train/templates">Back to templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {template.daysPerWeek} days/wk
        </Badge>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Weekly structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {template.plan.days
            .slice()
            .sort((a, b) => a.day - b.day)
            .map((day) => (
              <div key={day.label} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{day.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {day.items.length} exercises
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Day {day.day}
                  </Badge>
                </div>
                <ul className="mt-2 space-y-1">
                  {day.items
                    .slice()
                    .sort((x, y) => x.order - y.order)
                    .map((it) => (
                      <li
                        key={`${day.label}-${it.order}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="truncate">
                          {it.nameFallback ?? "Exercise"}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {it.sets}×{it.reps}
                          {it.weight ? ` • ${it.weight}` : ""}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="h-10 flex-1"
          onClick={() => {
            // Switching programs should reset the active workout draft
            clearDraft();
            selectTemplate(template.id);
            saveActiveProgram({
              templateId: template.id,
              name: template.name,
              createdAt: nowIso(),
              updatedAt: nowIso(),
              plan: template.plan,
            });
            router.push("/train/overview");
          }}
        >
          Use this program
        </Button>
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href="/train/templates">Back</Link>
        </Button>
      </div>
    </div>
  );
}

