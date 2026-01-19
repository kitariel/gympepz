"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainEntryScreenViewProps } from "./TrainEntryScreen.types";

function CtaButton({
  href,
  label,
  variant,
  className,
}: {
  href: string;
  label: string;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}) {
  return (
    <Button
      asChild
      variant={variant === "default" || variant == null ? undefined : variant}
      className={className}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export function TrainEntryScreenView(props: TrainEntryScreenViewProps) {
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
          <Badge variant="secondary">{props.statusText}</Badge>
          <Badge variant="outline">{props.sessionsText}</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {props.startCard.kind === "loading" ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : props.startCard.kind === "draft" ? (
              <CtaButton
                href={props.startCard.cta.href}
                label={props.startCard.cta.label}
                variant={props.startCard.cta.variant}
                className="h-10 w-full"
              />
            ) : props.startCard.kind === "program" ? (
              <div className="space-y-2">
                <CtaButton
                  href={props.startCard.primary.href}
                  label={props.startCard.primary.label}
                  variant={props.startCard.primary.variant}
                  className="h-10 w-full"
                />
                <CtaButton
                  href={props.startCard.secondary.href}
                  label={props.startCard.secondary.label}
                  variant={props.startCard.secondary.variant}
                  className="h-10 w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Current program: <span className="font-medium">{props.startCard.programName}</span>
                </p>
              </div>
            ) : props.startCard.kind === "profile" ? (
              <CtaButton
                href={props.startCard.cta.href}
                label={props.startCard.cta.label}
                variant={props.startCard.cta.variant}
                className="h-10 w-full"
              />
            ) : (
              <div className="space-y-2">
                <CtaButton
                  href={props.startCard.primary.href}
                  label={props.startCard.primary.label}
                  variant={props.startCard.primary.variant}
                  className="h-10 w-full"
                />
                <CtaButton
                  href={props.startCard.secondary.href}
                  label={props.startCard.secondary.label}
                  variant={props.startCard.secondary.variant}
                  className="h-10 w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            <p className="text-sm text-muted-foreground">Local workout history saved on this device.</p>
            <CtaButton
              href={props.historyHref}
              label="View history"
              variant="outline"
              className="h-10 w-full"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Programs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4">
          <p className="text-sm text-muted-foreground">Use a template, or create and save your own plan.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <CtaButton
              href={props.templatesHref}
              label="Browse templates"
              variant="default"
              className="h-10 flex-1"
            />
            <CtaButton
              href={props.buildHref}
              label="Create my own plan"
              variant="outline"
              className="h-10 flex-1"
            />
          </div>
          <div className="pt-1">
            <CtaButton
              href={props.plansHref}
              label="My saved plans"
              variant="ghost"
              className="h-9 w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

