"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrainBuildPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customize (v1)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is the placeholder for template customization. Next step is editing exercises and volume.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Coming next</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4">
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Rename program</li>
            <li>Swap exercises (from library)</li>
            <li>Edit sets/reps targets</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="h-10 flex-1">
          <Link href="/train/overview">Back to overview</Link>
        </Button>
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href="/train/templates">Templates</Link>
        </Button>
      </div>
    </div>
  );
}

