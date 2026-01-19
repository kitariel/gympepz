"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTemplates } from "@/lib/program-templates/templates";
import { recommendTemplates } from "@/lib/recommender/recommendTemplates";
import { useTrainingProfile } from "@/hooks/useTrainingProfile";
import { TemplateCard } from "./TemplateCard";

export function TemplateList() {
  const { profile, hydrated } = useTrainingProfile();

  const all = useMemo(() => getTemplates(), []);
  const recommended = useMemo(() => {
    if (!profile) return [];
    return recommendTemplates(profile, all);
  }, [profile, all]);

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
          <Button asChild variant="outline" className="h-9">
            <Link href="/train/onboarding">
              {profile ? "Edit preferences" : "Set preferences"}
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-9">
            <Link href="/train">Back</Link>
          </Button>
        </div>
      </div>

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : profile ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Recommended for you</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-4 pb-4 md:grid-cols-2">
            {(recommended.length ? recommended : all).slice(0, 4).map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Get better recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Answer 3 quick questions and we’ll sort templates for you.
            </p>
            <Button asChild className="h-10">
              <Link href="/train/onboarding">Start onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">All templates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 pb-4 md:grid-cols-2">
          {all.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

