/**
 * Plan header component with title and stats
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Dumbbell, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Plan } from "../_types";

interface PlanHeaderProps {
  plan: Plan | null | undefined;
  totalExercises: number;
}

export function PlanHeader({ plan, totalExercises }: PlanHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 mt-1 hover:bg-muted/80 transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {plan?.name ?? "Untitled Plan"}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
              Build and organize your weekly workout schedule
            </p>
          </div>
          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-bold text-foreground">
                  {plan?.days?.length ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">Workout Days</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Dumbbell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-foreground">{totalExercises}</div>
                <div className="text-xs text-muted-foreground">
                  Total Exercises
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/portal/log`)}
          className="h-9 gap-2 shrink-0"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">View Logs</span>
          <span className="sm:hidden">Logs</span>
        </Button>
      </div>
    </div>
  );
}

