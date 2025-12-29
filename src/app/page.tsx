import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "./_components/faq-section";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Dumbbell,
  LineChart,
  Zap,
  Sparkles,
  Target,
  Award,
  TrendingUp,
  UserPlus,
  FileText,
  CheckCircle2,
  Lock,
  Play,
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
      {/* Navigation - Enhanced */}
      <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur-xl shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5 text-xl font-bold tracking-tighter transition-opacity hover:opacity-80">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">GymPepz</span>
          </Link>
          <nav className="flex items-center gap-3">
            {session ? (
              <Link href="/portal">
                <Button className="shadow-lg shadow-primary/20">Go to Portal</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-primary/5">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button className="shadow-lg shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section - Premium Design */}
        <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-32 lg:pb-40">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <FadeIn delay={0.1}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI-Powered Fitness Platform</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <h1 className="bg-gradient-to-br from-foreground via-foreground to-foreground/40 bg-clip-text pb-2 text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl">
                  Transform Your Training with{" "}
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                    AI-Powered
                  </span>{" "}
                  Workout Plans
                </h1>
              </FadeIn>
              <FadeIn delay={0.3}>
                <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-lg leading-relaxed sm:text-xl">
                  Track every set, analyze your progress, and achieve your goals with intelligent workout planning designed for serious athletes.
                </p>
              </FadeIn>
              <FadeIn delay={0.5}>
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href={session ? "/portal" : "/login"}>
                    <Button size="lg" className="group h-14 px-10 text-lg font-semibold w-full sm:w-auto shadow-2xl shadow-primary/30 transition-all hover:shadow-primary/40 hover:scale-105">
                      Start Training Free
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-14 px-10 text-lg font-semibold w-full sm:w-auto border-2 hover:bg-primary/5 hover:border-primary/50 transition-all hover:scale-105"
                    >
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </FadeIn>
              <FadeIn delay={0.7}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
                  <div className="flex items-center gap-2.5 rounded-full bg-muted/50 px-4 py-2 backdrop-blur-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-foreground">100% Free</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-full bg-muted/50 px-4 py-2 backdrop-blur-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-foreground">No Credit Card</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-full bg-muted/50 px-4 py-2 backdrop-blur-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-foreground">Privacy First</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Enhanced Decorative Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <ScaleIn delay={0.2} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform-gpu">
              <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-3xl opacity-30" />
            </ScaleIn>
            <ScaleIn delay={0.3} className="absolute top-1/4 right-1/4 transform-gpu">
              <div className="h-[400px] w-[400px] rounded-full bg-gradient-to-br from-secondary/15 to-transparent blur-3xl opacity-25" />
            </ScaleIn>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))]" />
          </div>
        </section>

        {/* Features Section - Premium Cards */}
        <section id="features" className="relative bg-gradient-to-b from-muted/30 to-background py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-8">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Everything you need
                </Badge>
                <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  Built for{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Progressive Overload
                  </span>
                </h2>
                <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
                  Stop guessing. Start tracking. Our tools help you visualize your improvements and plan your next move.
                </p>
              </div>
            </FadeIn>
            <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:max-w-none">
              <StaggerContainer className="grid max-w-xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
                {/* Feature 1: AI Workout Planner */}
                <StaggerItem className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Card className="relative bg-card/80 backdrop-blur-sm flex flex-col rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <Sparkles className="text-primary h-7 w-7" />
                    </div>
                    <h3 className="text-xl leading-8 font-bold">
                      AI Workout Planner
                    </h3>
                    <p className="text-muted-foreground mt-4 flex-auto text-base leading-relaxed">
                      Get personalized workout plans tailored to your goals, experience, and equipment.
                    </p>
                  </Card>
                </StaggerItem>

                {/* Feature 2: Granular Tracking */}
                <StaggerItem className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Card className="relative bg-card/80 backdrop-blur-sm flex flex-col rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <Dumbbell className="text-primary h-7 w-7" />
                    </div>
                    <h3 className="text-xl leading-8 font-bold">
                      Granular Tracking
                    </h3>
                    <p className="text-muted-foreground mt-4 flex-auto text-base leading-relaxed">
                      Log every set, rep, and weight. Track RPE, rest times, and volume for complete analysis.
                    </p>
                  </Card>
                </StaggerItem>

                {/* Feature 3: Progress Analytics */}
                <StaggerItem className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Card className="relative bg-card/80 backdrop-blur-sm flex flex-col rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <LineChart className="text-primary h-7 w-7" />
                    </div>
                    <h3 className="text-xl leading-8 font-bold">
                      Progress Analytics
                    </h3>
                    <p className="text-muted-foreground mt-4 flex-auto text-base leading-relaxed">
                      Visualize your strength gains with interactive charts. See volume trends, PRs, and body composition changes.
                    </p>
                  </Card>
                </StaggerItem>

                {/* Feature 4: Weekly Planning */}
                <StaggerItem className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Card className="relative bg-card/80 backdrop-blur-sm flex flex-col rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <Calendar className="text-primary h-7 w-7" />
                    </div>
                    <h3 className="text-xl leading-8 font-bold">
                      Weekly Planning
                    </h3>
                    <p className="text-muted-foreground mt-4 flex-auto text-base leading-relaxed">
                      Organize your training with drag-and-drop weekly schedules. Never wonder what to train.
                    </p>
                  </Card>
                </StaggerItem>

                {/* Feature 5: Exercise Library */}
                <StaggerItem className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Card className="relative bg-card/80 backdrop-blur-sm flex flex-col rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <Target className="text-primary h-7 w-7" />
                    </div>
                    <h3 className="text-xl leading-8 font-bold">
                      Exercise Library
                    </h3>
                    <p className="text-muted-foreground mt-4 flex-auto text-base leading-relaxed">
                      Access 500+ exercises with instructions, muscle groups, and equipment filters.
                    </p>
                  </Card>
                </StaggerItem>

                {/* Feature 6: Smart Insights */}
                <StaggerItem className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <Card className="relative bg-card/80 backdrop-blur-sm flex flex-col rounded-3xl border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
                      <Award className="text-primary h-7 w-7" />
                    </div>
                    <h3 className="text-xl leading-8 font-bold">
                      Smart Insights
                    </h3>
                    <p className="text-muted-foreground mt-4 flex-auto text-base leading-relaxed">
                      Automatic PR detection, streak tracking, and personalized recommendations.
                    </p>
                  </Card>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* How It Works Section - Enhanced */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-8">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  Simple Process
                </Badge>
                <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                  How It Works
                </h2>
                <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                  Get started in three simple steps
                </p>
              </div>
            </FadeIn>
            <StaggerContainer className="relative mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-12 sm:grid-cols-3">
              {/* Connecting Lines - Hidden on mobile */}
              <div className="absolute top-24 left-0 right-0 hidden sm:block" aria-hidden="true">
                <div className="mx-auto flex max-w-4xl items-center justify-center gap-8">
                  <div className="h-0.5 w-full bg-gradient-to-r from-primary/50 to-primary/20" />
                  <div className="h-0.5 w-full bg-gradient-to-r from-primary/20 to-primary/50" />
                </div>
              </div>

              {/* Step 1 */}
              <StaggerItem className="relative z-10">
                <Card className="border-2 p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-3xl font-bold text-primary-foreground shadow-xl shadow-primary/20">
                    1
                  </div>
                  <div className="mb-5 flex justify-center">
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <UserPlus className="text-primary h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Sign Up</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Quick registration with email or Google. No credit card required.
                  </p>
                </Card>
              </StaggerItem>

              {/* Step 2 */}
              <StaggerItem className="relative z-10">
                <Card className="border-2 p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-3xl font-bold text-primary-foreground shadow-xl shadow-primary/20">
                    2
                  </div>
                  <div className="mb-5 flex justify-center">
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <FileText className="text-primary h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Create Your Plan</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Use our AI planner or build your workout manually. Customize to your goals.
                  </p>
                </Card>
              </StaggerItem>

              {/* Step 3 */}
              <StaggerItem className="relative z-10">
                <Card className="border-2 p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-3xl font-bold text-primary-foreground shadow-xl shadow-primary/20">
                    3
                  </div>
                  <div className="mb-5 flex justify-center">
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <TrendingUp className="text-primary h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Track & Improve</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Log your workouts and watch your progress. See gains over time.
                  </p>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Screenshots/Demo Section - Enhanced */}
        <section className="relative bg-gradient-to-b from-muted/30 to-background py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-8">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Badge>
                <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                  See GymPepz in Action
                </h2>
                <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                  Experience the power of data-driven training
                </p>
              </div>
            </FadeIn>
            <StaggerContainer className="mx-auto mt-20 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Dashboard Preview */}
              <StaggerItem className="group">
                <Card className="overflow-hidden border-2 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-8">
                      <div className="aspect-video bg-gradient-to-br from-background to-background/80 rounded-xl flex items-center justify-center border-2 border-border/50 backdrop-blur-sm shadow-inner transition-all duration-300 group-hover:border-primary/30">
                        <div className="text-center">
                          <div className="mb-3 flex justify-center">
                            <div className="rounded-xl bg-primary/10 p-4 shadow-lg transition-transform duration-300 group-hover:scale-110">
                              <BarChart3 className="mx-auto h-10 w-10 text-primary" />
                            </div>
                          </div>
                          <span className="text-foreground font-semibold text-sm">Dashboard View</span>
                          <p className="text-muted-foreground text-xs mt-1">Track your progress</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Weekly Schedule Preview */}
              <StaggerItem className="group">
                <Card className="overflow-hidden border-2 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-8">
                      <div className="aspect-video bg-gradient-to-br from-background to-background/80 rounded-xl flex items-center justify-center border-2 border-border/50 backdrop-blur-sm shadow-inner transition-all duration-300 group-hover:border-primary/30">
                        <div className="text-center">
                          <div className="mb-3 flex justify-center">
                            <div className="rounded-xl bg-primary/10 p-4 shadow-lg transition-transform duration-300 group-hover:scale-110">
                              <Calendar className="mx-auto h-10 w-10 text-primary" />
                            </div>
                          </div>
                          <span className="text-foreground font-semibold text-sm">Weekly Schedule</span>
                          <p className="text-muted-foreground text-xs mt-1">Plan your training</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Analytics Preview */}
              <StaggerItem className="group">
                <Card className="overflow-hidden border-2 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-8">
                      <div className="aspect-video bg-gradient-to-br from-background to-background/80 rounded-xl flex items-center justify-center border-2 border-border/50 backdrop-blur-sm shadow-inner transition-all duration-300 group-hover:border-primary/30">
                        <div className="text-center">
                          <div className="mb-3 flex justify-center">
                            <div className="rounded-xl bg-primary/10 p-4 shadow-lg transition-transform duration-300 group-hover:scale-110">
                              <LineChart className="mx-auto h-10 w-10 text-primary" />
                            </div>
                          </div>
                          <span className="text-foreground font-semibold text-sm">Progress Charts</span>
                          <p className="text-muted-foreground text-xs mt-1">Visualize gains</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Social Proof Section - Premium */}
        <section className="relative py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-8">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold">
                  <Award className="mr-1.5 h-3.5 w-3.5" />
                  Trusted by Athletes
                </Badge>
                <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                  Loved by Athletes{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Worldwide
                  </span>
                </h2>
                <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
                  Join thousands of athletes achieving their fitness goals
                </p>
              </div>
            </FadeIn>

            {/* Stats - Enhanced */}
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
              <FadeIn delay={0.1}>
                <Card className="border-2 p-8 text-center shadow-lg">
                  <div className="mb-2 text-5xl font-extrabold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">1,000+</div>
                  <div className="text-foreground font-semibold">Active Users</div>
                  <p className="text-muted-foreground text-sm mt-1">Growing daily</p>
                </Card>
              </FadeIn>
              <FadeIn delay={0.2}>
                <Card className="border-2 p-8 text-center shadow-lg">
                  <div className="mb-2 text-5xl font-extrabold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">500+</div>
                  <div className="text-foreground font-semibold">Exercises</div>
                  <p className="text-muted-foreground text-sm mt-1">Fully documented</p>
                </Card>
              </FadeIn>
              <FadeIn delay={0.3}>
                <Card className="border-2 p-8 text-center shadow-lg">
                  <div className="mb-2 text-5xl font-extrabold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">100%</div>
                  <div className="text-foreground font-semibold">Free Forever</div>
                  <p className="text-muted-foreground text-sm mt-1">No hidden fees</p>
                </Card>
              </FadeIn>
            </div>

            {/* Feature Badges */}
            <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-4">
              <Badge variant="outline" className="px-5 py-2.5 text-sm font-semibold border-2 hover:bg-primary/5 transition-colors">
                <Sparkles className="mr-2 h-4 w-4" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="px-5 py-2.5 text-sm font-semibold border-2 hover:bg-primary/5 transition-colors">
                <Lock className="mr-2 h-4 w-4" />
                Privacy-Focused
              </Badge>
              <Badge variant="outline" className="px-5 py-2.5 text-sm font-semibold border-2 hover:bg-primary/5 transition-colors">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                100% Free
              </Badge>
            </div>

            {/* Testimonials - Enhanced */}
            <StaggerContainer className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-3">
              <StaggerItem className="group">
                <Card className="relative border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 h-full">
                  <div className="absolute top-6 right-6 text-6xl text-primary/10 font-serif">&quot;</div>
                  <p className="text-foreground/80 mb-6 text-base leading-relaxed relative z-10">
                    Finally, a tracker that understands progressive overload. My strength gains are visible and motivating!
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg shadow-lg">
                      A
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Alex</div>
                      <div className="text-muted-foreground text-sm">Bodybuilder</div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>

              <StaggerItem className="group">
                <Card className="relative border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 h-full">
                  <div className="absolute top-6 right-6 text-6xl text-primary/10 font-serif">&quot;</div>
                  <p className="text-foreground/80 mb-6 text-base leading-relaxed relative z-10">
                    The AI planner created the perfect 4-day split for my goals. Game changer!
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg shadow-lg">
                      S
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Sarah</div>
                      <div className="text-muted-foreground text-sm">Athlete</div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>

              <StaggerItem className="group">
                <Card className="relative border-2 p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 h-full">
                  <div className="absolute top-6 right-6 text-6xl text-primary/10 font-serif">&quot;</div>
                  <p className="text-foreground/80 mb-6 text-base leading-relaxed relative z-10">
                    Best workout tracking app I&apos;ve used. The analytics help me optimize my training.
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg shadow-lg">
                      M
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Mike</div>
                      <div className="text-muted-foreground text-sm">Trainer</div>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-muted/50 py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-8">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground mt-6 text-lg leading-8">
                  Everything you need to know about GymPepz
                </p>
              </div>
            </FadeIn>
            <FAQSection />
          </div>
        </section>

        {/* Final CTA Section - Premium */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-8">
            <ScaleIn>
              <div className="relative isolate overflow-hidden px-8 py-28 text-center shadow-2xl sm:rounded-[2rem] bg-gradient-to-br from-primary via-primary to-primary/90">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-30" aria-hidden="true">
                  <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-br from-primary-foreground to-white" />
                </div>
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-30" aria-hidden="true">
                  <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-tr from-primary-foreground to-white" />
                </div>
                
                <div className="relative z-10">
                  <h2 className="text-primary-foreground mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                    Ready to transform your physique?
                  </h2>
                  <p className="text-primary-foreground/90 mx-auto mt-8 max-w-2xl text-lg leading-relaxed sm:text-xl">
                    Join thousands of athletes tracking their progress with GymPepz. Start your free account today.
                  </p>
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/login">
                      <Button variant="secondary" size="lg" className="group h-14 px-10 text-lg font-semibold w-full sm:w-auto shadow-2xl transition-all hover:scale-105">
                        Get Started for Free
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                    <Link href="#features">
                      <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-semibold w-full sm:w-auto border-2 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm transition-all hover:scale-105">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-primary-foreground/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Free forever</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Privacy-focused</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScaleIn>
          </div>
        </section>
      </main>

      {/* Footer - Enhanced */}
      <footer className="bg-gradient-to-t from-muted/50 to-background border-t border-border/50 py-16">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <Link href="/" className="group flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground text-base font-bold">GymPepz</p>
                <p className="text-muted-foreground text-xs">
                  Built with ❤️ for fitness enthusiasts
                </p>
              </div>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link
                href="#"
                className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-border/50 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} GymPepz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
