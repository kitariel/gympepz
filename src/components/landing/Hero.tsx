import Image from "next/image";
import Link from "next/link";
import { Dumbbell, History, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";

type HeroProps = {
  ctaHref: string;
};

export default function Hero({ ctaHref }: HeroProps) {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Train smarter.
                <br />
                Track everything.
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                The workout tracker that remembers your last set, copies your
                weights, and times your rest—so you can focus on lifting.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-8 text-base font-medium">
                <Link href={ctaHref}>Start Training Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-medium"
              >
                <Link href="#features">See Features</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <Dumbbell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">Copy Sets</p>
                  <p className="text-sm text-muted-foreground">
                    Tap to copy your last weight & reps
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">See Previous</p>
                  <p className="text-sm text-muted-foreground">
                    Know what you lifted last time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">Track Progress</p>
                  <p className="text-sm text-muted-foreground">
                    See strength gains over time
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:justify-self-end">
            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-2 shadow-2xl">
              <Image
                src="/images/placeholder-mobile.png"
                alt="GymPepz workout logging interface"
                width={390}
                height={780}
                sizes="(min-width: 1024px) 448px, (min-width: 640px) 384px, 100vw"
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

