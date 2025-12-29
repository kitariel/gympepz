import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "./_components/faq-section";
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
      {/* Navigation - Clean Design */}
      <header className="bg-background border-b border-border/40 sticky top-0 z-50 w-full">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-foreground">GymPepz</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About us
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#trainers" className="text-muted-foreground hover:text-foreground transition-colors">
              Trainers
            </Link>
            <Link href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact us
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/portal">
                <Button size="lg" className="rounded-full px-8">
                  Go to Portal
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:inline-flex">
                    Log In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="rounded-full px-6 sm:px-8">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="relative bg-gradient-to-b from-background to-muted/20 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                🏋️ Discover The Future Of Fitness{" "}
                <span className="text-primary">💪</span> With AI-Powered Training Plans
                <span className="text-primary">😊</span>
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
                Our Platform Ensures That You Have Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose The Perfect Match Based On Your Unique Preferences And Requirements.
              </p>
              <Link href={session ? "/portal" : "/login"}>
                <Button size="lg" className="rounded-full h-14 px-10 text-base font-semibold shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Hero Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {/* Image placeholders with different colors */}
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white/80 font-semibold">
                  Fitness Image 1
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white/80 font-semibold">
                  Fitness Image 2
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white/80 font-semibold">
                  Fitness Image 3
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white/80 font-semibold">
                  Fitness Image 4
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white/80 font-semibold">
                  Fitness Image 5
                </div>
              </div>
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white/80 font-semibold">
                  Fitness Image 6
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
                  About Us
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our Platform Ensures That You Have Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose The Perfect Match Based On Your Unique Preferences And Requirements.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our Platform Ensures That You Have Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose The Perfect Match Based On Your Unique Preferences And Requirements And Interested Pool Of Trainers.
                </p>
                <Button size="lg" className="rounded-full h-12 px-8 mt-4">
                  Read More
                </Button>
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
                  Our Platform Ensures That You Have Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose Our Platform Ensures That You Have Access To A Diverse Pool.
                </p>

                {/* Steps */}
                <div className="space-y-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Tell Us About Yourself</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our Platform Ensures That You Have Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose The Platform Ensures That You.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Get Your Personalized AI Workout Plan</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our Platform Ensures That You Have Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose The Platform Ensures That You.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2">Connect With A Personal Trainer</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Our Platform Ensures That You Have Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose The Platform Ensures That You.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Special Trainer Section */}
        <section id="trainers" className="py-20 sm:py-28 bg-background">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Our Special Trainer For You
              </h2>
              <p className="text-muted-foreground text-lg">
                Your Fitness Can Change Your Life Today Or Tomorrow, Working Out Plans, And More Suitable Price, And More Adapter There When Your Plans Change.
              </p>
            </div>

            {/* Trainer Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
              {[
                { name: "Alex Jones", role: "Fitness Expert", rating: 4.5 },
                { name: "James Clark", role: "Yoga Instructor", rating: 4.8 },
                { name: "Maria Doe", role: "Nutrition Coach", rating: 4.9 },
                { name: "Michael White", role: "Strength Coach", rating: 4.7 },
                { name: "Sarah Kim", role: "Cardio Specialist", rating: 4.6 },
                { name: "David Kumar", role: "CrossFit Trainer", rating: 4.8 },
              ].map((trainer, idx) => (
                <Card key={idx} className="border-2 hover:shadow-xl transition-all">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 mx-auto flex items-center justify-center text-2xl font-bold">
                      {trainer.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{trainer.name}</h3>
                      <p className="text-sm text-muted-foreground">{trainer.role}</p>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{trainer.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" className="rounded-full h-12 px-10">
                See All
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Benefits For Every Body
              </h2>
              <p className="text-muted-foreground text-lg">
                By Strategically These Benefits, You Can Maximize Your Workout Effectiveness & Achieve Your Goals.
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
                What Our Customer Says
              </h2>
              <p className="text-muted-foreground text-lg">
                By Strategically These Benefits, You Can Maximize That Effectiveness, & Achieve Your Goals.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[1, 2, 3].map((idx) => (
                <Card key={idx} className="border-2">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center font-bold text-lg">
                        AJ
                      </div>
                      <div>
                        <h4 className="font-bold">Alex Jordan</h4>
                        <p className="text-sm text-muted-foreground">Fitness Enthusiast</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      It Is A Diverse Pool Of Highly Qualified Trainers, To A Diverse Pool Of Highly Qualified Trainers, Our Platform Ensures That You Have Access To A Diverse Pool.
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                Got questions? We&apos;ve got answers. Find everything you need to know about GymPepz.
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
                  Have Questions? We&apos;re Here to Help
                </h2>
                <p className="text-muted-foreground text-lg">
                  Get in touch with our team or ask anything about your fitness journey.
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
                  Subscribe Our Newsletter<br />For Daily Update
                </h2>
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
        <section className="py-20 sm:py-28 bg-foreground text-background">
          <div className="container mx-auto px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Ready To Get Started?
              </h2>
              <p className="text-background/80 text-lg leading-relaxed">
                Our Platform Ensures That You About Access To A Diverse Pool Of Highly Qualified Trainers, Allowing You To Choose The Perfect Match On Your Unique Preferences.
              </p>
              <Link href={session ? "/portal" : "/login"}>
                <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-base font-semibold">
                  Get Started
                </Button>
              </Link>
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
    </div>
  );
}
