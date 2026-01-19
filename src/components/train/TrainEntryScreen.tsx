"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

export function TrainEntryScreen() {
  const { profile, hydrated: profileHydrated } = useTrainingProfile();
  const { activeProgram, hydrated: programHydrated } = useActiveProgram();
  const { draft, hydrated: workoutHydrated, summary } = useWorkoutDraft();

  const hydrated = profileHydrated && programHydrated && workoutHydrated;

  const hasProfile = Boolean(profile);
  const hasProgram = Boolean(activeProgram);
  const hasDraft = Boolean(draft);

  const status = useMemo(() => {
    if (!hydrated) return "Loading…";
    if (hasDraft) return "Workout in progress";
    if (hasProgram) return "Program ready";
    if (hasProfile) return "Profile saved";
    return "New session";
  }, [hydrated, hasDraft, hasProgram, hasProfile]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Train</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Offline-first: pick a template, review the plan, then log your workout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{status}</Badge>
          <Badge variant="outline">{summary.total} sessions</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {!hydrated ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : hasDraft ? (
              <Button asChild className="h-10 w-full">
                <Link href="/train/log">Resume workout</Link>
              </Button>
            ) : hasProgram ? (
              <div className="space-y-2">
                <Button asChild className="h-10 w-full">
                  <Link href="/train/log">Start today’s workout</Link>
                </Button>
                <Button asChild variant="outline" className="h-10 w-full">
                  <Link href="/train/overview">View program overview</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Current program: <span className="font-medium">{activeProgram?.name}</span>
                </p>
              </div>
            ) : hasProfile ? (
              <Button asChild className="h-10 w-full">
                <Link href="/train/templates">See recommended templates</Link>
              </Button>
            ) : (
              <div className="space-y-2">
                <Button asChild className="h-10 w-full">
                  <Link href="/train/onboarding">Quick onboarding</Link>
                </Button>
                <Button asChild variant="outline" className="h-10 w-full">
                  <Link href="/train/templates">Browse templates</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Local workout history saved on this device.
            </p>
            <Button asChild variant="outline" className="h-10 w-full">
              <Link href="/train/history">View history</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Programs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            Use a template, or create and save your own plan.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="h-10 flex-1">
              <Link href="/train/templates">Browse templates</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 flex-1">
              <Link href="/train/build">Create my own plan</Link>
            </Button>
          </div>
          <div className="pt-1">
            <Button asChild variant="ghost" className="h-9 w-full">
              <Link href="/train/plans">My saved plans</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

