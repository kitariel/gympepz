"use client";

import { Dumbbell, Flame, Target, Scale } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GoalTemplateCardViewModel } from "./GoalTemplateCard.types";

const ICONS = {
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  scale: Scale,
} as const;

export function GoalTemplateCardView({
  name,
  description,
  targetLabel,
  icon,
  categoryLabel,
  onSelect,
}: GoalTemplateCardViewModel) {
  const Icon = ICONS[icon];

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {categoryLabel}
            </span>
            <h3 className="truncate font-semibold">{name}</h3>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
        <p className="text-xs font-medium text-foreground">{targetLabel}</p>
      </CardContent>
    </Card>
  );
}
