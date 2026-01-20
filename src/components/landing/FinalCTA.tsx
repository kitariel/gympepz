import Link from "next/link";

import { Button } from "@/components/ui/button";

type FinalCTAProps = {
  ctaHref: string;
};

export default function FinalCTA({ ctaHref }: FinalCTAProps) {
  return (
    <section className="w-full py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border-2 bg-background p-8 text-center shadow-xl sm:p-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to train smarter?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start logging workouts in seconds. No credit card required.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-14 px-8 text-base font-medium">
              <Link href={ctaHref}>Start Training Free</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ Works offline</span>
            <span>✓ Copy sets instantly</span>
            <span>✓ Track progress</span>
          </div>
        </div>
      </div>
    </section>
  );
}
