"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateListViewProps } from "./TemplateList.types";
import { TemplateCardView } from "../TemplateCard/TemplateCard.view";

export function TemplateListView(props: TemplateListViewProps) {
  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-6 pt-4">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a starter program. You can customize later.
          </p>
        </div>
        <div className="flex gap-2">
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
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Get better recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Answer 3 quick questions and we’ll sort templates for you.
            </p>
            <Button asChild className="h-10">
              <Link href={props.onboardingHref}>Start onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">{props.recommendedTitle}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-4 pb-4 md:grid-cols-2">
            {props.recommendedCards.map((vm) => (
              <TemplateCardView key={vm.id} vm={vm} />
            ))}
          </CardContent>
        </Card>
      )}

      {props.kind === "ready" ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">All templates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-4 pb-4 md:grid-cols-2">
            {props.allCards.map((vm) => (
              <TemplateCardView key={vm.id} vm={vm} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

