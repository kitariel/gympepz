"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

type WorkoutSessionDockVM =
  | { kind: "hidden" }
  | {
      kind: "visible";
      title: string;
      subtitle: string | null;
      onFinish: () => void;
      finishDisabled: boolean;
    };

function getNextSetSummary(input: {
  exercises: Array<{ id: string; name: string; order: number }>;
  sets: Array<{ exerciseId: string; setNumber: number; completed: boolean }>;
}): { exerciseName: string; setNumber: number } | null {
  const byExercise = new Map<string, Array<{ setNumber: number; completed: boolean }>>();
  for (const s of input.sets) {
    const arr = byExercise.get(s.exerciseId) ?? [];
    arr.push({ setNumber: s.setNumber, completed: s.completed });
    byExercise.set(s.exerciseId, arr);
  }

  const sortedExercises = input.exercises.slice().sort((a, b) => a.order - b.order);
  for (const ex of sortedExercises) {
    const sets = (byExercise.get(ex.id) ?? []).slice().sort((a, b) => a.setNumber - b.setNumber);
    const next = sets.find((s) => !s.completed);
    if (next) return { exerciseName: ex.name, setNumber: next.setNumber };
  }
  return null;
}

function WorkoutSessionDockView({ vm }: { vm: WorkoutSessionDockVM }) {
  if (vm.kind === "hidden") return null;

  return (
    <>
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+88px)] left-0 right-0 z-50 px-4 md:hidden">
        <Card className="border-border/60 bg-background/90 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{vm.title}</p>
              {vm.subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{vm.subtitle}</p>
              ) : null}
            </div>
            <Button asChild size="sm" className="h-9 shrink-0">
              <Link href="/train/log">Open</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-4 z-50 hidden md:block">
        <Card className="w-[320px] border-border/60 bg-background/70 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/50">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                )}
              >
                <Dumbbell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{vm.title}</p>
                {vm.subtitle ? (
                  <p className="truncate text-xs text-muted-foreground">{vm.subtitle}</p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="h-9 flex-1">
                <Link href="/train/log" className="flex items-center justify-center gap-2">
                  Open
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                className="h-9 flex-1"
                onClick={vm.onFinish}
                disabled={vm.finishDisabled}
              >
                Finish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export function WorkoutSessionDock() {
  const router = useRouter();
  const { draft, hydrated, finish } = useWorkoutDraft();

  const vm: WorkoutSessionDockVM = useMemo(() => {
    if (!hydrated || !draft) return { kind: "hidden" };

    const title =
      (draft.programName ?? "").trim() && (draft.programDayLabel ?? "").trim()
        ? `${draft.programName} — ${draft.programDayLabel}`
        : (draft.programName ?? "Workout").trim() || "Workout";

    const next = getNextSetSummary({
      exercises: draft.exercises,
      sets: draft.sets,
    });

    const subtitle = next ? `${next.exerciseName} • Set ${next.setNumber}` : null;

    return {
      kind: "visible",
      title,
      subtitle,
      onFinish: () => {
        const id = finish();
        router.push(
          id ? `/train/summary?logId=${encodeURIComponent(id)}` : "/train/history",
        );
      },
      finishDisabled: draft.sets.length === 0,
    };
  }, [draft, finish, hydrated, router]);

  return <WorkoutSessionDockView vm={vm} />;
}

