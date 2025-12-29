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
          
          // Gradient for each template
          const getTemplateGradient = (templateId: string) => {
            const gradients: Record<string, string> = {
              "ppl": "from-blue-500 via-cyan-500 to-teal-500",
              "upper-lower": "from-purple-500 via-pink-500 to-rose-500",
              "full-body": "from-orange-500 via-amber-500 to-yellow-500",
              "bro-split": "from-emerald-500 via-teal-500 to-cyan-500",
            };
            return gradients[templateId] ?? "from-gray-500 via-gray-600 to-gray-700";
          };

          const gradient = getTemplateGradient(template.id);

          return (
            <Card 
              key={template.id} 
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              {/* Image/Header Section */}
              <div className="relative aspect-[3/2] w-full overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
                
                {/* Icon Badge */}
                <div className="absolute left-4 top-4 z-10">
                  <div className={`p-3 rounded-xl ${iconBg} shadow-lg backdrop-blur-sm bg-white/20`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Template Info Overlay */}
                <div className="absolute inset-0 flex items-end">
                  <div className="w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5">
                    <CardTitle className="text-white font-bold text-xl mb-1.5 drop-shadow-lg">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-sm leading-relaxed drop-shadow">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </div>

              <CardContent className="px-5 pb-5 pt-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-3 py-1 border ${getLevelColor(template.level)} font-medium`}
                  >
                    {template.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 font-medium">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    {template.daysCount} {template.daysCount === 1 ? 'day' : 'days'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-3 py-1 font-medium">
                    {template.focus}
                  </Badge>
                </div>

                <Button
                  className="w-full h-11 text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-sm"
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
