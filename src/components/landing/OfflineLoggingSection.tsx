import Image from "next/image";

import { Badge } from "@/components/ui/badge";

export default function OfflineLoggingSection() {
  return (
    <section className="w-full border-y bg-muted/20 py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-3">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Execute workouts in real time—online or offline
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Track sets, reps, and weights as you train. If the gym signal
              drops, keep going—your workout is saved locally and can sync when
              you’re back online.
            </p>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              Then review progress analytics to see strength and performance
              trends across weeks and lifts.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-background md:justify-self-end">
            <div className="absolute left-3 top-3 z-10">
              <Badge variant="outline" className="bg-background">
                Offline logging: On
              </Badge>
            </div>
            <Image
              src="/images/placeholder-mobile.png"
              alt="Workout execution and logging screen"
              width={390}
              height={780}
              sizes="(min-width: 768px) 384px, 100vw"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
