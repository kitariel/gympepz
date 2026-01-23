"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateCardVM } from "./TemplateCard.types";

interface TemplateCardViewProps {
  vm: TemplateCardVM;
  isRecommended?: boolean;
}

export function TemplateCardView({ vm, isRecommended }: TemplateCardViewProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-md",
        isRecommended
          ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
          : "border-border/50"
      )}
    >
      {isRecommended && (
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3" />
            <span className="text-[10px]">Recommended</span>
          </Badge>
        </div>
      )}

      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2 pr-20">
          <h3 className="font-semibold text-foreground leading-tight">
            {vm.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{vm.daysPerWeek} days per week</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {vm.description}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            asChild
            variant={isRecommended ? "default" : "outline"}
            size="sm"
            className="flex-1 h-9"
          >
            <Link href={vm.viewHref}>
              View Program
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
