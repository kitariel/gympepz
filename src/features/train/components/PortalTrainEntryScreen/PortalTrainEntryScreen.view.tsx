"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  Dumbbell,
  FolderOpen,
  History,
  Play,
  Sparkles,
  ExternalLink,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTrainMode } from "@/features/train/context/TrainModeContext";
import { PortalTrainShell } from "@/features/train/components/PortalTrainShell";
import type { TrainEntryScreenViewProps } from "../TrainEntryScreen/TrainEntryScreen.types";

function CtaButton({
  href,
  label,
  variant,
  className,
  icon,
}: {
  href: string;
  label: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      asChild
      variant={variant === "default" || variant == null ? undefined : variant}
      className={cn("touch-target h-12", className)}
    >
      <Link href={href}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

function OnlineOfflineToggle() {
  const { isOnline, isSyncing, toggleMode } = useTrainMode();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void toggleMode()}
      disabled={isSyncing}
      className={cn(
        "gap-2 transition-colors",
        isOnline
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
          : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400"
      )}
    >
      {isSyncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      {isSyncing ? "Syncing..." : isOnline ? "Online" : "Offline"}
    </Button>
  );
}

function HeroCard({
  startCard,
}: {
  startCard: TrainEntryScreenViewProps["startCard"];
}) {
  if (startCard.kind === "loading") {
    return (
      <Card elevation="hero" className="animate-pulse">
        <CardContent className="space-y-4 p-6">
          <div className="bg-muted h-6 w-32 rounded" />
          <div className="bg-muted h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (startCard.kind === "draft") {
    return (
      <Card elevation="hero" className="animate-fade-up overflow-hidden">
        <CardContent className="relative space-y-4 p-6">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-500/10" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
                <Play className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Workout in progress
                </p>
                <p className="text-muted-foreground text-xs">
                  {startCard.programName}
                  {startCard.dayLabel ? ` - ${startCard.dayLabel}` : ""}
                </p>
              </div>
            </div>
          </div>
          <CtaButton
            href={startCard.cta.href}
            label={startCard.cta.label}
            variant={startCard.cta.variant}
            className="w-full bg-emerald-500 text-lg font-semibold hover:bg-emerald-600"
            icon={<Play className="mr-2 h-5 w-5" />}
          />
        </CardContent>
      </Card>
    );
  }

  if (startCard.kind === "program") {
    return (
      <Card elevation="hero" className="animate-fade-up overflow-hidden">
        <CardContent className="relative space-y-4 p-6">
          <div className="bg-primary/10 absolute -top-8 -right-8 h-32 w-32 rounded-full" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/15 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Dumbbell className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{startCard.programName}</p>
                  <p className="text-muted-foreground text-sm">
                    {startCard.dayLabel ?? "Today's workout"}
                  </p>
                </div>
              </div>
              {startCard.setsProgress ? (
                <Badge variant="secondary" className="shrink-0">
                  {startCard.setsProgress}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <CtaButton
              href={startCard.primary.href}
              label={startCard.primary.label}
              variant={startCard.primary.variant}
              className="flex-1 text-base font-semibold"
              icon={<Play className="mr-2 h-5 w-5" />}
            />
            <CtaButton
              href={startCard.secondary.href}
              label={startCard.secondary.label}
              variant={startCard.secondary.variant}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (startCard.kind === "profile") {
    return (
      <Card elevation="hero" className="animate-fade-up overflow-hidden">
        <CardContent className="relative space-y-4 p-6">
          <div className="bg-accent/10 absolute -top-8 -right-8 h-32 w-32 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="bg-accent/15 flex h-12 w-12 items-center justify-center rounded-xl">
                <Sparkles className="text-accent h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Profile ready</p>
                <p className="text-muted-foreground text-sm">
                  Let&apos;s find you a program
                </p>
              </div>
            </div>
          </div>
          <CtaButton
            href={startCard.cta.href}
            label={startCard.cta.label}
            variant={startCard.cta.variant}
            className="w-full text-base font-semibold"
            icon={<Sparkles className="mr-2 h-5 w-5" />}
          />
        </CardContent>
      </Card>
    );
  }

  // New user
  return (
    <Card elevation="hero" className="animate-fade-up overflow-hidden">
      <CardContent className="relative space-y-4 p-6">
        <div className="bg-primary/10 absolute -top-8 -right-8 h-32 w-32 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="bg-primary/15 flex h-12 w-12 items-center justify-center rounded-xl">
              <Dumbbell className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">Welcome to Go-Train</p>
              <p className="text-muted-foreground text-sm">
                Start your fitness journey
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CtaButton
            href={startCard.primary.href}
            label={startCard.primary.label}
            variant={startCard.primary.variant}
            className="flex-1 text-base font-semibold"
          />
          <CtaButton
            href={startCard.secondary.href}
            label={startCard.secondary.label}
            variant={startCard.secondary.variant}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RecentWorkoutsSection({
  workouts,
  historyHref,
}: {
  workouts: TrainEntryScreenViewProps["recentWorkouts"];
  historyHref: string;
}) {
  if (workouts.length === 0) return null;

  return (
    <div className="animate-fade-up space-y-3 delay-100">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent</h2>
        <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
          <Link href={historyHref}>
            View all
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
      <div className="space-y-2">
        {workouts.map((w) => (
          <Card key={w.id} elevation="subtle">
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                  <History className="text-muted-foreground h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{w.dateText}</p>
                  {w.dayLabel ? (
                    <p className="text-muted-foreground text-xs">
                      {w.dayLabel}
                    </p>
                  ) : null}
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {w.setsCount} sets
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProgramsSection({
  templatesHref,
  buildHref,
  plansHref,
}: {
  templatesHref: string;
  buildHref: string;
  plansHref: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-fade-up space-y-3 delay-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <h2 className="text-sm font-semibold">Programs</h2>
        <ChevronRight
          className={cn(
            "text-muted-foreground h-4 w-4 transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>

      {expanded ? (
        <div className="space-y-2">
          <Card elevation="subtle">
            <CardContent className="p-0">
              <Link
                href={templatesHref}
                className="hover:bg-muted/50 flex items-center gap-3 p-3 transition-colors"
              >
                <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                  <Sparkles className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Browse templates</p>
                  <p className="text-muted-foreground text-xs">
                    Find a starter program
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardContent className="p-0">
              <Link
                href={buildHref}
                className="hover:bg-muted/50 flex items-center gap-3 p-3 transition-colors"
              >
                <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                  <Dumbbell className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Create my own</p>
                  <p className="text-muted-foreground text-xs">
                    Build a custom program
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardContent className="p-0">
              <Link
                href={plansHref}
                className="hover:bg-muted/50 flex items-center gap-3 p-3 transition-colors"
              >
                <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                  <FolderOpen className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">My saved plans</p>
                  <p className="text-muted-foreground text-xs">
                    View your custom programs
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card elevation="subtle">
          <CardContent className="p-0">
            <Link
              href={templatesHref}
              className="hover:bg-muted/50 flex items-center gap-3 p-3 transition-colors"
            >
              <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                <Sparkles className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Browse templates</p>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function PortalTrainEntryScreenView(props: TrainEntryScreenViewProps) {
  const { isOnline } = useTrainMode();

  return (
    <PortalTrainShell>
      {props.syncError ? (
        <Alert variant="destructive" className="animate-fade-up">
          <AlertTitle>{props.syncError.title}</AlertTitle>
          <AlertDescription>
            <p>{props.syncError.message}</p>
            {props.syncError.onAction ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={props.syncError.onAction}
              >
                {props.syncError.actionLabel ?? "Try again"}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Train</h1>
          <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
            {isOnline ? "Synced workouts" : "Offline mode"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <Link href="/train">
              Single view
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
          <OnlineOfflineToggle />
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{props.statusText}</Badge>
        <Badge variant="outline">{props.sessionsText}</Badge>
      </div>

      {/* Hero card */}
      <HeroCard startCard={props.startCard} />

      {/* Recent workouts */}
      <RecentWorkoutsSection
        workouts={props.recentWorkouts}
        historyHref={props.historyHref}
      />

      {/* Programs (collapsible) */}
      <ProgramsSection
        templatesHref={props.templatesHref}
        buildHref={props.buildHref}
        plansHref={props.plansHref}
      />
    </PortalTrainShell>
  );
}
