import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Dumbbell,
  LineChart,
  Shield,
  Zap,
} from "lucide-react";
import {
  FadeIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations";

export default async function Home() {
  const session = await auth();

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span>GymPepz</span>
          </div>
          <nav className="flex items-center gap-4">
            {session ? (
              <Link href="/portal">
                <Button>Go to Portal</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <FadeIn delay={0.1}>
                <h1 className="from-primary to-primary/50 bg-linear-to-r bg-clip-text pb-2 text-4xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl">
                  Master Your Fitness Journey
                </h1>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
                  Track your workouts, analyze your progress, and achieve your
                  goals with our intelligent fitness companion. Granular
                  tracking for serious athletes.
                </p>
              </FadeIn>
              <FadeIn delay={0.5}>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link href={session ? "/portal" : "/login"}>
                    <Button size="lg" className="h-12 px-8 text-base">
                      Start Training <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-8 text-base"
                    >
                      Learn more
                    </Button>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Decorative background elements */}
          <ScaleIn
            delay={0.2}
            className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
            aria-hidden="true"
          >
            <div
              className="from-primary/20 to-secondary/20 aspect-1108/632 w-277 bg-linear-to-r opacity-20"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
              }}
            />
          </ScaleIn>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/50 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-primary text-base leading-7 font-semibold">
                  Everything you need
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Built for Progressive Overload
                </p>
                <p className="text-muted-foreground mt-6 text-lg leading-8">
                  Stop guessing. Start tracking. Our tools help you visualize
                  your improvements and plan your next move.
                </p>
              </div>
            </FadeIn>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <StaggerContainer className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
                {/* Feature 1 */}
                <StaggerItem className="bg-card flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="bg-primary/10 mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Zap className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-lg leading-8 font-semibold">
                    Active Workout Mode
                  </h3>
                  <p className="text-muted-foreground mt-4 flex-auto text-base leading-7">
                    Log every set, rep, and weight in real-time. Our granular
                    tracking system ensures no detail is missed during your
                    session.
                  </p>
                </StaggerItem>

                {/* Feature 2 */}
                <StaggerItem className="bg-card flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="bg-primary/10 mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
                    <LineChart className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-lg leading-8 font-semibold">
                    Progress Analytics
                  </h3>
                  <p className="text-muted-foreground mt-4 flex-auto text-base leading-7">
                    Visualize your strength gains and body composition changes
                    over time with interactive charts and detailed history.
                  </p>
                </StaggerItem>

                {/* Feature 3 */}
                <StaggerItem className="bg-card flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md">
                  <div className="bg-primary/10 mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Calendar className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-lg leading-8 font-semibold">
                    Smart Scheduling
                  </h3>
                  <p className="text-muted-foreground mt-4 flex-auto text-base leading-7">
                    Organize your training with custom plans and days. Never
                    wonder &quot;what am I training today?&quot; again.
                  </p>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* Bento Grid / Tech Section (Optional "Nice" Touch) */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-8">
            <FadeIn>
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Data-Driven Training
                </h2>
                <p className="text-muted-foreground mt-6 text-lg leading-8">
                  Your data belongs to you. Export, analyze, and optimize your
                  routine with tools designed for longevity.
                </p>
              </div>
            </FadeIn>
            <StaggerContainer className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StaggerItem className="bg-card rounded-xl border p-6 shadow-sm sm:col-span-2">
                <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Volume Analysis</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Track total volume lifted per workout to ensure consistent
                  progressive overload.
                </p>
              </StaggerItem>
              <StaggerItem className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Injury Prevention</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Monitor RPE and rest times to train safely.
                </p>
              </StaggerItem>
              <StaggerItem className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Dumbbell className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Exercise Library</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Hundreds of exercises with proper form guides.
                </p>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-8">
            <ScaleIn>
              <div className="bg-primary relative isolate overflow-hidden px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
                <h2 className="text-primary-foreground mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to transform your physique?
                </h2>
                <p className="text-primary-foreground/80 mx-auto mt-6 max-w-xl text-lg leading-8">
                  Join now and start tracking your workouts like a pro.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Link href="/login">
                    <Button variant="secondary" size="lg" className="h-12 px-8">
                      Get Started for Free
                    </Button>
                  </Link>
                </div>
              </div>
            </ScaleIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/20 border-t py-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:px-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
              <Dumbbell className="h-3.5 w-3.5" />
            </div>
            <p className="text-muted-foreground text-center text-sm leading-loose md:text-left">
              © 2025 GymPepz. Built with ❤️ for fitness enthusiasts.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-muted-foreground text-sm hover:underline"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-muted-foreground text-sm hover:underline"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
