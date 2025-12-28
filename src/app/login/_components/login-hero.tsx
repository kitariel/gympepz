"use client";

import { Dumbbell, LineChart, Sparkles, Target, Trophy, Calendar } from "lucide-react";

export function LoginHero() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-950 text-white">
      {/* Abstract Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between p-8 sm:p-12">
        {/* Header Content */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/10 p-2 backdrop-blur-sm">
              <Dumbbell className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="text-xl font-bold tracking-tight">AliPlace</span>
          </div>
          
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Your personal AI fitness companion.
          </h1>
          
          <p className="max-w-sm text-lg text-slate-300">
            Build muscle, lose weight, and track your progress with intelligent workout planning and analytics.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="group rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
              <Sparkles className="h-5 w-5 text-indigo-300" />
            </div>
            <h3 className="font-semibold text-white">AI Planner</h3>
            <p className="mt-1 text-sm text-slate-400">
              Get personalized workout plans tailored to your goals and equipment.
            </p>
          </div>
          
          <div className="group rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <LineChart className="h-5 w-5 text-purple-300" />
            </div>
            <h3 className="font-semibold text-white">Analytics</h3>
            <p className="mt-1 text-sm text-slate-400">
              Visualize your strength gains and consistency over time.
            </p>
          </div>

          <div className="group rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20">
              <Calendar className="h-5 w-5 text-pink-300" />
            </div>
            <h3 className="font-semibold text-white">Scheduling</h3>
            <p className="mt-1 text-sm text-slate-400">
              Plan your week and stay on track with smart scheduling.
            </p>
          </div>

          <div className="group rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <Trophy className="h-5 w-5 text-amber-300" />
            </div>
            <h3 className="font-semibold text-white">Progress</h3>
            <p className="mt-1 text-sm text-slate-400">
              Hit new PRs and celebrate your fitness milestones.
            </p>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="flex items-center gap-4 border-t border-white/10 pt-6">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-700" />
            ))}
          </div>
          <p className="text-sm font-medium text-slate-300">
            Join thousands of users hitting their goals today.
          </p>
        </div>
      </div>
    </div>
  );
}
