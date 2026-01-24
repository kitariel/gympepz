"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PortalTrainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portal/train] render error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6 pt-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          We hit an unexpected error while loading your training screen.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => reset()} className="h-9">
          Try again
        </Button>
        <Button asChild variant="outline" className="h-9">
          <Link href="/portal/train">Back to Train</Link>
        </Button>
      </div>
    </div>
  );
}
