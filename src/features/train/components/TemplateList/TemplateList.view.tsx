"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Settings, ArrowLeft, Dumbbell, Calendar, Target } from "lucide-react";
import type { TemplateListViewProps } from "./TemplateList.types";
import { TemplateCardView } from "../TemplateCard/TemplateCard.view";

export function TemplateListView(props: TemplateListViewProps) {
  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-5xl p-6 pt-5">
        <div className="space-y-6">
          {/* Skeleton header */}
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-80 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          {/* Skeleton cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 p-6 pt-5">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
            <Link href={props.backHref}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Training Library
              </p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Workout Templates
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm">
              Choose a proven program that fits your schedule. Customize exercises, sets, and rest days to match your goals.
            </p>
          </div>

          {props.kind === "ready" && (
            <Button asChild variant="outline" size="sm" className="h-9 w-fit">
              <Link href={props.editPrefsHref}>
                <Settings className="h-4 w-4 mr-2" />
                {props.editPrefsLabel}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* No Profile - Onboarding CTA */}
      {props.kind === "noProfile" && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">
                    Get personalized recommendations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Answer a few quick questions about your goals and schedule, and we&apos;ll highlight the best programs for you.
                  </p>
                </div>
              </div>
              <Button asChild className="w-fit shrink-0">
                <Link href={props.onboardingHref}>
                  <Target className="h-4 w-4 mr-2" />
                  Start Onboarding
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Section */}
      {props.kind === "ready" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold">{props.recommendedTitle}</h2>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Based on your profile
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {props.recommendedCards.map((vm) => (
              <TemplateCardView key={vm.id} vm={vm} isRecommended />
            ))}
          </div>
        </section>
      )}

      {/* All Templates Section */}
      {props.kind === "ready" && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">All Templates</h2>
            <span className="text-xs text-muted-foreground">
              ({props.allCards.length} programs)
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {props.allCards.map((vm) => (
              <TemplateCardView key={vm.id} vm={vm} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
