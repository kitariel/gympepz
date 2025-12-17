"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Zap, Target, TrendingUp } from "lucide-react";

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  daysCount: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  focus: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TEMPLATES: PlanTemplate[] = [
  {
    id: "ppl",
    name: "Push/Pull/Legs",
    description: "Classic 6-day split targeting major muscle groups",
    daysCount: 6,
    level: "Intermediate",
    focus: "Hypertrophy",
    icon: Dumbbell,
  },
  {
    id: "upper-lower",
    name: "Upper/Lower Split",
    description: "4-day program alternating upper and lower body",
    daysCount: 4,
    level: "Beginner",
    focus: "Strength",
    icon: Target,
  },
  {
    id: "full-body",
    name: "Full Body 3x",
    description: "Hit all major muscle groups three times per week",
    daysCount: 3,
    level: "Beginner",
    focus: "General Fitness",
    icon: Zap,
  },
  {
    id: "bro-split",
    name: "Bro Split",
    description: "5-day bodybuilding split with one muscle group per day",
    daysCount: 5,
    level: "Advanced",
    focus: "Bodybuilding",
    icon: TrendingUp,
  },
];

interface PlanTemplatesProps {
  onSelectTemplate: (template: PlanTemplate) => void;
}

export function PlanTemplates({ onSelectTemplate }: PlanTemplatesProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold mb-1">Start with a Template</h3>
        <p className="text-xs text-muted-foreground">
          Choose from proven workout programs or create your own
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:border-primary/50 transition-colors border-0 shadow-sm">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm mb-0.5">{template.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${getLevelColor(template.level)}`}>
                    {template.level}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {template.daysCount} days
                  </Badge>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                    {template.focus}
                  </Badge>
                </div>

                <Button
                  className="w-full h-8 text-xs"
                  variant="outline"
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
