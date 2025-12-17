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
    description: "Classic 6-day split targeting major muscle groups with dedicated push, pull, and leg days",
    daysCount: 6,
    level: "Intermediate",
    focus: "Hypertrophy",
    icon: Dumbbell,
  },
  {
    id: "upper-lower",
    name: "Upper/Lower Split",
    description: "4-day program alternating between upper and lower body workouts for balanced development",
    daysCount: 4,
    level: "Beginner",
    focus: "Strength",
    icon: Target,
  },
  {
    id: "full-body",
    name: "Full Body 3x",
    description: "Hit all major muscle groups three times per week for maximum frequency and recovery",
    daysCount: 3,
    level: "Beginner",
    focus: "General Fitness",
    icon: Zap,
  },
  {
    id: "bro-split",
    name: "Bro Split",
    description: "Classic 5-day bodybuilding split with one muscle group per day for maximum volume",
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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Start with a Template</h3>
        <p className="text-sm text-muted-foreground">
          Choose from proven workout programs or create your own from scratch
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={getLevelColor(template.level)}>
                    {template.level}
                  </Badge>
                  <Badge variant="outline">{template.daysCount} days/week</Badge>
                  <Badge variant="outline">{template.focus}</Badge>
                </div>

                <Button
                  className="w-full"
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
