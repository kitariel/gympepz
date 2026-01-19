import Link from "next/link";

import { Button } from "@/components/ui/button";

type FinalCTAProps = {
  ctaHref: string;
};

export default function FinalCTA({ ctaHref }: FinalCTAProps) {
  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-2xl border bg-background p-6 sm:p-8">
          <div className="grid gap-4">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href={ctaHref}>Start Training</Link>
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Manual plans • AI personalization • Real-time logging • Progress analytics
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
