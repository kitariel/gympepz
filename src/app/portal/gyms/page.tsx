"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GymsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gym discovery</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This section is currently being rebuilt as part of the clean restart.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            For now, you can use the new offline-first training flow.
          </p>
          <Button asChild className="h-10 w-full sm:w-auto">
            <Link href="/train">Go to Train</Link>
          </Button>
        </CardContent>
      </Card>

      <Button asChild variant="outline" className="h-10 w-full sm:w-auto">
        <Link href="/portal">Back to dashboard</Link>
      </Button>
    </div>
  );
}

