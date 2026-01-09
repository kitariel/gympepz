"use client";

import { Dumbbell, BarChart3, Zap, Calendar, LineChart, Users, TrendingUp } from "lucide-react";
import Image from "next/image";

export function LoginHero() {
  return (
    <div className="relative rounded-xl h-full w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {/* <img 
          src="/gymguywomen.png" 
          alt="Fit athletes in a modern gym setting"
          className="w-full h-full  object-cover ob"
        /> */}
        <Image
          src="/GPT_Image_1_A_realistic_premium_fitness_brand_image_for_a_mode_0.png"
          alt="Fit athletes in a modern gym setting"
          width={1000}
          height={1000}
          className="w-full h-full   object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/70 via-slate-900/60 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/50 via-transparent to-slate-900/50"></div>
      </div>

      {/* Mobile-first layout */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Header Content - Mobile optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white">GymPepz</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">Progress Made Visible</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
              Master Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400">
                Fitness Journey
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-md">
              Track your workouts, analyze your progress, and achieve your goals with intelligent fitness tracking. Granular tracking for serious athletes.
            </p>
          </div>
        </div>

        {/* Feature Grid - Glassmorphism style, mobile-first */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-6">
          {/* Feature 1 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-lg hover:bg-white/[0.15] hover:border-emerald-400/30">
            <div className="bg-gradient-to-br from-blue-500/20 to-emerald-500/20 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <Zap className="text-emerald-400 h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              Active Workout Mode
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              Log every set, rep, and weight in real-time. Granular tracking ensures no detail is missed.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-lg hover:bg-white/[0.15] hover:border-blue-400/30">
            <div className="bg-gradient-to-br from-blue-500/20 to-emerald-500/20 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <LineChart className="text-blue-400 h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              Progress Analytics
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              Visualize strength gains and body composition changes with interactive charts and history.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-lg hover:bg-white/[0.15] hover:border-emerald-400/30">
            <div className="bg-gradient-to-br from-blue-500/20 to-emerald-500/20 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <Calendar className="text-emerald-400 h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              Smart Scheduling
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              Organize training with custom plans. Never wonder &quot;what am I training today?&quot; again.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-lg hover:bg-white/[0.15] hover:border-blue-400/30">
            <div className="bg-gradient-to-br from-blue-500/20 to-emerald-500/20 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <BarChart3 className="text-blue-400 h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              Data-Driven Training
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed">
              Track volume, monitor RPE, and optimize your routine for longevity and progress.
            </p>
          </div>
        </div>

        {/* Footer - Mobile responsive with stats */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-white/20 pt-4 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                'bg-gradient-to-br from-blue-500 to-blue-600',
                'bg-gradient-to-br from-emerald-500 to-emerald-600',
                'bg-gradient-to-br from-blue-400 to-emerald-500'
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-slate-900 ${bg}`}
                />
              ))}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-white">
                Join 127K+ athletes
              </p>
              <p className="text-[10px] sm:text-xs text-slate-300">
                Training smarter every day
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>127K+ Active</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span>85% Success</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
