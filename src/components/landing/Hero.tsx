import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type HeroProps = {
  ctaHref: string;
};

export default function Hero({ ctaHref }: HeroProps) {
  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                A complete training system—manual plans or AI-built.
              </h1>
              <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Plan your week, execute workouts in real time, log every set, and
                track progress with analytics—so your training stays structured
                and measurable.
              </p>
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-foreground font-medium">
                  Create plans manually
                </span>{" "}
                or generate personalized plans with AI
              </li>
              <li>
                Real-time workout execution and detailed logging (sets, reps,
                weights)
              </li>
              <li>Progress analytics with strength and performance tracking</li>
              <li>Mobile-first responsive design • Secure authentication</li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href={ctaHref}>Start Training</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                <Link href="#planning">See how it works</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-muted/20">
              <Image
                src="/images/placeholder-mobile.png"
                alt="GymPepz mobile workout logging screenshot"
                width={390}
                height={780}
                sizes="(min-width: 768px) 384px, 100vw"
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
