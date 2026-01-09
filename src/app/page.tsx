import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "./_components/faq-section";
import { ScrollAnimations } from "./_components/scroll-animations";
import { MobileNav } from "./_components/mobile-nav";
import {
  Dumbbell,
  CheckCircle2,
  Star,
  ArrowRight,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Users,
  Zap,
  Heart,
  Sparkles,
  LineChart,
  Brain,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Navigation - Glassmorphism Design */}
      <header className="fixed w-full z-50 top-0 border-b border-white/10 dark:bg-black/40 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-[360deg]">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground tracking-tight">GymPepz</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Progress Made Visible</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#home" className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs">
              Home
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs">
              About
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs">
              How It Works
            </Link>
            <Link href="#programs" className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs">
              Programs
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider text-xs">
              Contact
            </Link>
            {session ? (
              <Link href="/portal">
                <Button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-xs font-semibold tracking-wide">
                  Go to Portal
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-xs font-semibold tracking-wide">
                  Get Started Free
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu */}
          <MobileNav session={session} />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-900 dark:via-black dark:to-slate-900 pt-20">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {/* Mobile Image */}
            <img 
              src="/gymlandingpics.png" 
              alt="Athletic person tracking workout with visible progress and determination"
              className="w-full h-full object-cover object-top opacity-40 md:hidden"
            />
            {/* Desktop Image */}
            <img 
              src="/Default_A_realistic_premium_fitness_brand_image_for_a_modern_g_0.jpg" 
              alt="Athletic person tracking workout with visible progress and determination"
              className="hidden w-full h-full object-cover opacity-40 md:block"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-slate-900/60 to-slate-900"></div> */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/50 md:hidden"></div>
          </div>

          <div className="relative z-10 container mx-auto w-full pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
              <div className="lg:col-span-8 animate-fade-up">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-md text-xs uppercase tracking-widest font-semibold text-emerald-300 mb-8">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  10,247 Workouts Logged Today
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.95]">
                  Track Every Rep.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400">
                    See Every Gain.
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed border-l-2 border-blue-400/50 pl-6 mb-10">
                  The fitness tracking app that turns your workouts into visible progress. Log exercises in 3 taps, watch your strength grow with AI-powered insights, and hit PRs you never thought possible.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href={session ? "/portal" : "/login"}>
                    <Button size="lg" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-3 group">
                      <span className="tracking-tight">Start Tracking Free</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button variant="outline" size="lg" className="px-8 py-4 border border-white/20 text-white backdrop-blur-sm font-semibold rounded-lg hover:bg-white/10 transition-all duration-300">
                      Watch Demo
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hero Stats */}
              <div className="lg:col-span-4 flex flex-col gap-6 lg:items-end pb-2 animate-fade-up delay-200">
                <div className="p-6 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-xs hover:bg-white/[0.15] transition-all duration-300 cursor-default animate-float">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-300 uppercase tracking-widest font-semibold">Active Users</span>
                    <Users className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">127K+</div>
                  <div className="text-xs text-slate-400">Crushing goals daily</div>
                </div>

                <div className="p-6 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-xs hover:bg-white/[0.15] transition-all duration-300 cursor-default animate-float delay-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-300 uppercase tracking-widest font-semibold">Goal Success</span>
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">85%</div>
                  <div className="text-xs text-slate-400">Reach their targets</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  About GymPepz
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  GymPepz is your complete fitness companion, designed to help you track every workout, monitor your progress, and stay motivated on your fitness journey. Whether you&apos;re a beginner or an experienced athlete, our platform adapts to your needs.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  With AI-powered workout planning, comprehensive exercise libraries, and detailed progress analytics, you have everything you need to reach your fitness goals. Train smarter, not harder.
                </p>
                <Link href="#how-it-works">
                  <Button size="lg" className="rounded-full h-12 px-8 mt-4">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xl">
                    About Us Image
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-muted/20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xl">
                    How It Works Image
                  </div>
                </div>
              </div>
              <div className="space-y-8 order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  How It Works
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Getting started with GymPepz is simple. Follow these three easy steps to transform your fitness journey and start seeing real results.
                </p>

                {/* Steps */}
                <div className="space-y-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Create Your Profile</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Sign up for free and tell us about your fitness goals, experience level, and available equipment. This helps us personalize your experience from day one.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Get Your AI-Powered Workout Plan</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our AI analyzes your goals and creates a customized workout plan with exercises, sets, reps, and a weekly schedule tailored specifically for you.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Track Progress & Achieve Goals</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Log your workouts, monitor your strength gains, and watch your progress through detailed charts and analytics. Stay motivated and reach your goals faster.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Workout Programs Section */}
        <section id="programs" className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Popular Workout Programs
              </h2>
              <p className="text-muted-foreground text-lg">
                Choose from our collection of proven workout programs designed for every fitness goal. From strength building to fat loss, we&apos;ve got you covered.
              </p>
            </div>

            {/* Program Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              <Card className="group border-2 hover:shadow-2xl transition-all hover:border-primary/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
                <CardContent className="p-8 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                    <Dumbbell className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl mb-2">Strength Builder</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Build raw strength with compound movements. Perfect for powerlifters and strength enthusiasts.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-bold text-foreground">12 weeks</span>
                      <span className="text-muted-foreground"> • </span>
                      <span className="text-muted-foreground">4 days/week</span>
                    </div>
                  </div>
                  <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20">
                    Intermediate
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group border-2 hover:shadow-2xl transition-all hover:border-primary/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-8 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl mb-2">Hypertrophy Pro</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Maximize muscle growth with volume-focused training. Ideal for bodybuilders and physique athletes.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-bold text-foreground">16 weeks</span>
                      <span className="text-muted-foreground"> • </span>
                      <span className="text-muted-foreground">5 days/week</span>
                    </div>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20">
                    Advanced
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group border-2 hover:shadow-2xl transition-all hover:border-primary/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardContent className="p-8 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl mb-2">Fat Shredder</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      High-intensity training for maximum fat loss while preserving muscle. Get lean and defined.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-bold text-foreground">8 weeks</span>
                      <span className="text-muted-foreground"> • </span>
                      <span className="text-muted-foreground">6 days/week</span>
                    </div>
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20">
                    All Levels
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group border-2 hover:shadow-2xl transition-all hover:border-primary/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-8 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl mb-2">Athletic Performance</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Improve speed, power, and explosiveness. Designed for athletes and sports performance.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-bold text-foreground">10 weeks</span>
                      <span className="text-muted-foreground"> • </span>
                      <span className="text-muted-foreground">4 days/week</span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                    Intermediate
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group border-2 hover:shadow-2xl transition-all hover:border-primary/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500" />
                <CardContent className="p-8 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                    <Users className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl mb-2">Beginner&apos;s Guide</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Start your fitness journey right. Learn proper form and build a solid foundation of strength.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-bold text-foreground">6 weeks</span>
                      <span className="text-muted-foreground"> • </span>
                      <span className="text-muted-foreground">3 days/week</span>
                    </div>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20">
                    Beginner
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group border-2 hover:shadow-2xl transition-all hover:border-primary/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
                <CardContent className="p-8 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                    <Award className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl mb-2">Functional Fitness</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Build real-world strength and mobility. Perfect for everyday movement and injury prevention.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-bold text-foreground">12 weeks</span>
                      <span className="text-muted-foreground"> • </span>
                      <span className="text-muted-foreground">4 days/week</span>
                    </div>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20">
                    All Levels
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Link href={session ? "/portal/plans" : "/login"}>
                <Button size="lg" className="rounded-full h-12 px-10 shadow-lg">
                  Browse All Programs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-muted-foreground text-lg">
                Powerful features designed to help you maximize your workout effectiveness and achieve your fitness goals faster than ever before.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">Personalized Plans</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">High-Quality Trainers</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">Advanced AI Technology</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">HIIT Instructions</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">Track Workout Time</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">Control Rest Time Easily</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">Progress Monitoring</span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="font-semibold">Pre-Designed Workout Plans</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                What Our Users Say
              </h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of athletes who have transformed their fitness journey with GymPepz. Here&apos;s what they have to say.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center font-bold text-lg">
                      AJ
                    </div>
                    <div>
                      <h4 className="font-bold">Alex Jordan</h4>
                      <p className="text-sm text-muted-foreground">Powerlifter</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    &quot;GymPepz has completely changed how I track my workouts. The AI planning feature helped me break through my plateau and hit new PRs every week!&quot;
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center font-bold text-lg">
                      SM
                    </div>
                    <div>
                      <h4 className="font-bold">Sarah Martinez</h4>
                      <p className="text-sm text-muted-foreground">CrossFit Athlete</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    &quot;The progress tracking is incredible. Being able to see my strength gains visualized motivates me to push harder every session. Best fitness app I&apos;ve used!&quot;
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center font-bold text-lg">
                      MC
                    </div>
                    <div>
                      <h4 className="font-bold">Mike Chen</h4>
                      <p className="text-sm text-muted-foreground">Bodybuilder</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    &quot;Finally, a fitness app that understands serious training. The exercise library is comprehensive and the workout logging is seamless. Highly recommend!&quot;
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 sm:py-28 bg-muted/20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Powerful Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Everything You Need to Excel
              </h2>
              <p className="text-muted-foreground text-lg">
                Advanced tools and AI-powered features to take your training to the next level.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Brain className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">AI Workout Planner</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get personalized workout plans generated by AI based on your goals, experience, and available equipment.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Progress Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track your strength gains, volume progression, and workout consistency with detailed charts and insights.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Exercise Library</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Access hundreds of exercises with detailed instructions, muscle groups, and equipment requirements.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Weekly Scheduling</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Plan your entire week with an intuitive drag-and-drop interface. Organize workouts by day with ease.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <LineChart className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Workout Logging</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Log every set, rep, and weight with our streamlined workout logger. Track rest times and performance.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Goal Setting</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Set specific fitness goals and track your progress towards them with intelligent recommendations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about GymPepz. Can&apos;t find what you&apos;re looking for? Contact us anytime.
              </p>
            </div>
            <FAQSection />
          </div>
        </section>

        {/* Contact / Ask Question Section */}
        <section id="contact" className="py-20 sm:py-28 bg-muted/20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Have Questions? Let&apos;s Talk
                </h2>
                <p className="text-muted-foreground text-lg">
                  Our team is here to help you get started or answer any questions about your fitness journey. Reach out anytime!
                </p>
              </div>

              <Card className="border-2">
                <CardContent className="p-8 sm:p-12">
                  <form className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Your Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="w-full h-12 px-4 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Your Email</label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          className="w-full h-12 px-4 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Subject</label>
                      <input
                        type="text"
                        placeholder="What's your question about?"
                        className="w-full h-12 px-4 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Your Message</label>
                      <textarea
                        rows={6}
                        placeholder="Tell us more about your question or feedback..."
                        className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    <Button size="lg" className="w-full sm:w-auto rounded-full h-12 px-10">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-background to-muted/10">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
                  Stay Updated<br />Join Our Newsletter
                </h2>
                <p className="text-muted-foreground text-base max-w-md mx-auto">
                  Get fitness tips, workout ideas, and product updates delivered to your inbox.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Your Email Address Here"
                  className="flex-1 h-12 px-6 rounded-full border-2 border-border bg-background focus:outline-none focus:border-primary"
                />
                <Button size="lg" className="rounded-full h-12 px-8 sm:px-10">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydjJoLTJ2LTJoMnptLTItMnYyaC0ydi0yaDJ6bTAtMnYyaC0ydi0yaDJ6bTItMnYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Start Your Transformation Today
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 127,000+ users who track smarter, train harder, and achieve more. Free forever. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={session ? "/portal" : "/login"}>
                <Button size="lg" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-slate-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  <span>Start Tracking Free</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No Ads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Offline Mode</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-bold mb-4">GymPepz</h3>
              <p className="text-muted-foreground text-sm">
                AI-Powered fitness platform for serious athletes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="#trainers" className="hover:text-foreground transition-colors">Trainers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025. All Rights Reserved</p>
          </div>
        </div>
      </footer>
      <ScrollAnimations />
    </div>
  );
}
