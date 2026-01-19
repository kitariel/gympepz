import Image from "next/image";

export default function WeeklyPlanSection() {
  return (
    <section id="planning" className="w-full py-14 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Build your plan manually—or generate one with AI
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              GymPepz supports both workflows: full manual control when you want
              it, and AI-generated structure when you want a faster start.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm font-semibold">Manual planning</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Build days your way</li>
                  <li>Choose exercises, sets, reps, order</li>
                  <li>Keep full control of structure</li>
                </ul>
              </div>
              <div className="rounded-xl border bg-background p-4">
                <p className="text-sm font-semibold">AI planning</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Personalized to goals and fitness level</li>
                  <li>Organized week you can execute immediately</li>
                  <li>Edit anytime—your plan stays yours</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-muted/20 md:justify-self-end">
            <Image
              src="/images/placeholder-mobile.png"
              alt="Plan builder and weekly schedule view"
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
