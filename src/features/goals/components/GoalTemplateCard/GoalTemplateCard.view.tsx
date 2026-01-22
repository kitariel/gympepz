"use client";

import { Dumbbell, Flame, Target, Scale, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GoalTemplateCardViewModel } from "./GoalTemplateCard.types";

const ICONS = {
  dumbbell: Dumbbell,
  flame: Flame,
  target: Target,
  scale: Scale,
} as const;

const ICON_STYLES: Record<
  keyof typeof ICONS,
  { bg: string; bgHover: string; icon: string; accent: string }
> = {
  dumbbell: {
    bg: "bg-blue-500/10",
    bgHover: "group-hover:bg-blue-500/20",
    icon: "text-blue-500",
    accent: "bg-blue-500",
  },
  flame: {
    bg: "bg-amber-500/10",
    bgHover: "group-hover:bg-amber-500/20",
    icon: "text-amber-500",
    accent: "bg-amber-500",
  },
  target: {
    bg: "bg-emerald-500/10",
    bgHover: "group-hover:bg-emerald-500/20",
    icon: "text-emerald-500",
    accent: "bg-emerald-500",
  },
  scale: {
    bg: "bg-violet-500/10",
    bgHover: "group-hover:bg-violet-500/20",
    icon: "text-violet-500",
    accent: "bg-violet-500",
  },
};

export function GoalTemplateCardView({
  name,
  description,
  targetLabel,
  icon,
  categoryLabel,
  onSelect,
}: GoalTemplateCardViewModel) {
  const Icon = ICONS[icon];
  const styles = ICON_STYLES[icon];

  return (
    <Card
      className={cn(
        "group relative cursor-pointer overflow-hidden transition-all duration-300",
        "border-border/50 hover:border-border",
        "hover:shadow-lg hover:-translate-y-0.5",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "active:scale-[0.98]",
      )}
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
      {/* Accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
          "opacity-0 group-hover:opacity-100",
          styles.accent,
        )}
      />

      <CardContent className="p-5">
        {/* Header with icon */}
        <div className="flex items-start gap-4 mb-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
              styles.bg,
              styles.bgHover,
            )}
          >
            <Icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", styles.icon)} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {categoryLabel}
            </span>
            <h3 className="font-semibold text-base truncate mt-0.5">{name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground/70" />
            <span className="text-xs font-medium text-muted-foreground">
              {targetLabel}
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-all duration-300",
              "text-muted-foreground group-hover:text-foreground",
            )}
          >
            <span className="opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              Use template
            </span>
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
                "bg-muted group-hover:bg-primary group-hover:text-primary-foreground",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
