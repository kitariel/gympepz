"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgramTemplate } from "@/lib/program-templates/types";

export function TemplateCard({ template }: { template: ProgramTemplate }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{template.name}</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {template.daysPerWeek} days/wk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-9 flex-1">
            <Link href={`/train/template/${template.id}`}>View</Link>
          </Button>
          <Button asChild variant="outline" className="h-9 flex-1">
            <Link href={`/train/template/${template.id}`}>Use</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

