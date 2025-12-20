"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Zap, Target, TrendingUp, Calendar, ArrowRight } from "lucide-react";

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
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "Intermediate":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "Advanced":
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getIconColor = (templateId: string) => {
    switch (templateId) {
      case "ppl":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "upper-lower":
        return "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400";
      case "full-body":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      case "bro-split":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-1.5">Start with a Template</h3>
        <p className="text-sm text-muted-foreground">
          Choose from proven workout programs designed by fitness experts
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          const iconBg = getIconColor(template.id);
          return (
            <Card 
              key={template.id} 
              className="group hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-primary/30 cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="px-5 pt-5 pb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold mb-1.5">{template.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2.5 py-1 border ${getLevelColor(template.level)} font-medium`}
                  >
                    {template.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2.5 py-1 font-medium">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    {template.daysCount} {template.daysCount === 1 ? 'day' : 'days'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium">
                    {template.focus}
                  </Badge>
                </div>

                <Button
                  className="w-full h-10 text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template);
                  }}
                >
                  Use This Template
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
