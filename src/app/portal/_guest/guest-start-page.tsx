"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { GuestModeBanner } from "@/app/portal/_guest/guest-mode-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  appendOfflineWorkoutLog,
  createSampleWeeklyPlanSnapshot,
  getWeekId,
  readGuestWorkoutSession,
  readWeeklyPlanSnapshot,
  uuid,
  writeGuestWorkoutSession,
  writeWeeklyPlanSnapshot,
  writeWorkoutBuilderDraft,
  readWorkoutBuilderDraft,
  clearGuestWorkoutSession,
  clearWorkoutBuilderDraft,
} from "@/lib/guest/storage";
import type {
  GuestWorkoutBuilderDraft,
  GuestWorkoutSession,
  OfflineWorkoutLog,
  WeeklyPlanSnapshot,
} from "@/lib/guest/types";

import { GuestStartHome } from "@/app/portal/_guest/start/start-home";
import { BuilderDetailsStep } from "@/app/portal/_guest/start/builder-details";
import { BuilderExercisesStep } from "@/app/portal/_guest/start/builder-exercises";
import { WorkoutOverview } from "@/app/portal/_guest/start/workout-overview";
import { WorkoutLogger } from "@/app/portal/_guest/start/workout-logger";
import { LeaveGuardDialog, type LeaveGuardChoice } from "@/app/portal/_guest/start/leave-guard-dialog";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function nowIso() {
  return new Date().toISOString();
}

function buildEmptyDraft(): GuestWorkoutBuilderDraft {
  return {
    id: uuid(),
    name: "",
    notes: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    exercises: [],
  };
}

function buildSession(partial?: Partial<GuestWorkoutSession>): GuestWorkoutSession {
  return {
    phase: "home",
    builder: null,
    activeLog: null,
    lastUpdatedAt: nowIso(),
    ...partial,
  };
}

export function GuestStartPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<WeeklyPlanSnapshot | null>(null);
  const [sessionState, setSessionState] = useState<GuestWorkoutSession>(() => buildSession());
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setSnapshot(readWeeklyPlanSnapshot());
    const persisted = readGuestWorkoutSession();
    const persistedDraft = readWorkoutBuilderDraft();
    if (persisted) {
      // If persisted builder is missing but draft exists, reattach it.
      const merged: GuestWorkoutSession = {
        ...persisted,
        builder: persisted.builder ?? persistedDraft ?? null,
      };
      setSessionState(merged);
    } else if (persistedDraft) {
      setSessionState(buildSession({ phase: "overview", builder: persistedDraft }));
    }
  }, []);

  // Persist session state changes
  useEffect(() => {
    writeGuestWorkoutSession({ ...sessionState, lastUpdatedAt: nowIso() });
    if (sessionState.builder) writeWorkoutBuilderDraft(sessionState.builder);
  }, [sessionState]);

  const canResume = Boolean(
    sessionState.activeLog ||
      sessionState.builder ||
      readGuestWorkoutSession() ||
      readWorkoutBuilderDraft(),
  );

  const go = (next: Partial<GuestWorkoutSession>) =>
    setSessionState((s) => buildSession({ ...s, ...next }));

  const createWorkout = () => {
    const draft = buildEmptyDraft();
    go({ phase: "builder_details", builder: draft, activeLog: null });
  };

  const useSamplePlan = () => {
    const sample = createSampleWeeklyPlanSnapshot(getWeekId());
    writeWeeklyPlanSnapshot(sample);
    setSnapshot(sample);

    // Pick first non-rest day with items; fallback first day.
    const pick =
      sample.days.find((d) => !d.isRestDay && d.items.length > 0) ?? sample.days[0];
    const exercises =
      pick?.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((it, idx) => ({
          exerciseId: it.exerciseId,
          name: it.name,
          order: idx,
          targetSets: it.sets ?? null,
          targetReps: it.reps ?? null,
          targetWeight: it.weight ?? null,
        })) ?? [];

    const draft: GuestWorkoutBuilderDraft = {
      id: uuid(),
      name: `Sample workout — ${pick?.title ?? "Workout"}`,
      notes: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      exercises,
    };
    go({ phase: "overview", builder: draft, activeLog: null });
  };

  const resume = () => {
    const persisted = readGuestWorkoutSession();
    const persistedDraft = readWorkoutBuilderDraft();
    if (persisted) {
      setSessionState({
        ...persisted,
        builder: persisted.builder ?? persistedDraft ?? null,
      });
      return;
    }
    if (persistedDraft) {
      go({ phase: "overview", builder: persistedDraft, activeLog: null });
      return;
    }
    // nothing
  };

  const toOverview = () => go({ phase: "overview" });

  const startWorkout = () => {
    if (!sessionState.builder) return;
    const now = nowIso();
    const log: OfflineWorkoutLog = {
      clientLogId: uuid(),
      planDayId: null,
      date: now,
      startTime: now,
      endTime: null,
      completed: false,
      notes: sessionState.builder.notes ?? null,
      synced: false,
      sets: [],
    };
    go({ phase: "logging", activeLog: log });
  };

  const updateActiveLog = (next: OfflineWorkoutLog) => {
    setSessionState((s) => ({ ...s, activeLog: next }));
  };

  const hasLoggedSets = Boolean(sessionState.activeLog && sessionState.activeLog.sets.length > 0);

  const requestLeave = (href?: string) => {
    if (hasLoggedSets) {
      setPendingHref(href ?? null);
      setLeaveOpen(true);
      return;
    }
    // No logged sets: allow leaving freely
    if (href) router.push(href);
    else router.push("/train");
  };

  const handleLeaveChoice = (choice: LeaveGuardChoice) => {
    if (choice === "keep_training") {
      setLeaveOpen(false);
      setPendingHref(null);
      return;
    }
    if (choice === "discard") {
      clearGuestWorkoutSession();
      clearWorkoutBuilderDraft();
      setSessionState(buildSession());
      setLeaveOpen(false);
      const href = pendingHref;
      setPendingHref(null);
      router.push(href ?? "/train");
      return;
    }
    // save_exit: persist current state (already persisted) and navigate
    setLeaveOpen(false);
    const href = pendingHref;
    setPendingHref(null);
    router.push(href ?? "/train");
  };

  const finishWorkout = () => {
    if (!sessionState.activeLog) return;
    const finished: OfflineWorkoutLog = {
      ...sessionState.activeLog,
      completed: true,
      endTime: nowIso(),
    };
    appendOfflineWorkoutLog(finished);
    clearGuestWorkoutSession();
    clearWorkoutBuilderDraft();
    setSessionState(buildSession({ phase: "home", builder: null, activeLog: null }));
    router.push("/train/history");
  };

  const saveAndExit = () => {
    // Keep sessionState persisted and go to logs
    router.push("/train/history");
  };

  return (
    <div className="flex-1 space-y-4 p-6 pt-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Start workout</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Build it first, review the overview, then start logging.
          </p>
        </div>
        <GuestModeBanner />
      </div>

      {sessionState.phase === "home" ? (
        <GuestStartHome
          canResume={canResume}
          onCreate={createWorkout}
          onSample={useSamplePlan}
          onResume={resume}
        />
      ) : null}

      {sessionState.phase === "builder_details" && sessionState.builder ? (
        <BuilderDetailsStep
          draft={sessionState.builder}
          onChange={(b) => go({ builder: b })}
          onNext={() => go({ phase: "builder_exercises" })}
          onCancel={() => {
            clearGuestWorkoutSession();
            clearWorkoutBuilderDraft();
            setSessionState(buildSession());
          }}
        />
      ) : null}

      {sessionState.phase === "builder_exercises" && sessionState.builder ? (
        <BuilderExercisesStep
          draft={sessionState.builder}
          onChange={(b) => go({ builder: b })}
          onBack={() => go({ phase: "builder_details" })}
          onNext={toOverview}
        />
      ) : null}

      {sessionState.phase === "overview" && sessionState.builder ? (
        <WorkoutOverview
          draft={sessionState.builder}
          onEdit={() => go({ phase: "builder_exercises" })}
          onStart={startWorkout}
        />
      ) : null}

      {sessionState.phase === "logging" && sessionState.builder && sessionState.activeLog ? (
        <WorkoutLogger
          builder={sessionState.builder}
          log={sessionState.activeLog}
          onUpdateLog={updateActiveLog}
          onFinish={finishWorkout}
          onSaveExit={saveAndExit}
          onRequestLeave={() => requestLeave("/portal")}
        />
      ) : null}

      {/* Simple footer nav (guarded) */}
      <div className="pt-2">
        <Button variant="ghost" className="w-full" onClick={() => requestLeave("/portal")}>
          Back to dashboard
        </Button>
      </div>

      <LeaveGuardDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onChoose={handleLeaveChoice}
      />
    </div>
  );
}

