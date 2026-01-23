"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateListViewProps } from "./TemplateList.types";
import { TemplateCardView } from "../TemplateCard/TemplateCard.view";

export function TemplateListView(props: TemplateListViewProps) {
  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 p-6 pt-5">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 pt-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.2em]">
              Training library
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Templates that match your week
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm">
              Start with a proven plan, then tweak exercises, sets, and days to
              fit your schedule.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {props.kind === "ready" ? (
              <Button asChild variant="outline" className="h-9">
                <Link href={props.editPrefsHref}>{props.editPrefsLabel}</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="h-9">
              <Link href={props.backHref}>Back</Link>
            </Button>
          </div>
        </div>

        {props.kind === "noProfile" ? (
          <Card className="border-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <CardTitle className="text-base">
                Get recommendations tuned to you
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              <p className="text-sm text-muted-foreground">
                Answer three quick questions and we&apos;ll highlight the best
                programs for your goal and schedule.
              </p>
              <Button asChild className="h-10">
                <Link href={props.onboardingHref}>Start onboarding</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">
                  {props.recommendedTitle}
                </CardTitle>
                <span className="text-muted-foreground text-xs">
                  Curated picks
                </span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 pb-5 md:grid-cols-2 lg:grid-cols-3">
              {props.recommendedCards.map((vm) => (
                <TemplateCardView key={vm.id} vm={vm} />
              ))}
            </CardContent>
          </Card>
        )}

        {props.kind === "ready" ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-base">All templates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 pb-5 md:grid-cols-2 lg:grid-cols-3">
              {props.allCards.map((vm) => (
                <TemplateCardView key={vm.id} vm={vm} />
              ))}
            </CardContent>
          </Card>
        ) : null}
    </div>
  );
}
