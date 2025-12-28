"use client";

import { Dumbbell, BarChart3, Zap, Calendar, LineChart } from "lucide-react";

export function LoginHero() {
  return (
    <div className="relative rounded-xl h-full w-full overflow-hidden bg-gradient-to-br from-[#0a1f18] via-[#0d261d] to-[#0a1f18]">
      {/* Subtle Background Elements - Matching landing page style */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl opacity-10" aria-hidden="true">
          <div className="from-[#18503c]/30 to-emerald-500/20 aspect-[1108/632] w-[277px] bg-gradient-to-r" />
        </div>
      </div>

      {/* Mobile-first layout */}
      <div className="relative flex h-full flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Header Content - Mobile optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="bg-[#18503c] text-white flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">GymPepz</span>
          </div>
          
          {/* Hero Content */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="from-[#18503c] to-[#18503c]/50 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight bg-gradient-to-r bg-clip-text text-transparent">
              Master Your Fitness Journey
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-md">
              Track your workouts, analyze your progress, and achieve your goals with intelligent fitness tracking. Granular tracking for serious athletes.
            </p>
          </div>
        </div>

        {/* Feature Grid - Matching landing page card style, mobile-first */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-6">
          {/* Feature 1 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-md hover:border-[#18503c]/30">
            <div className="bg-[#18503c]/10 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <Zap className="text-[#18503c] h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold leading-8 text-white mb-2 sm:mb-3">
              Active Workout Mode
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-7 flex-auto">
              Log every set, rep, and weight in real-time. Granular tracking ensures no detail is missed.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-md hover:border-[#18503c]/30">
            <div className="bg-[#18503c]/10 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <LineChart className="text-[#18503c] h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold leading-8 text-white mb-2 sm:mb-3">
              Progress Analytics
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-7 flex-auto">
              Visualize strength gains and body composition changes with interactive charts and history.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-md hover:border-[#18503c]/30">
            <div className="bg-[#18503c]/10 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <Calendar className="text-[#18503c] h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold leading-8 text-white mb-2 sm:mb-3">
              Smart Scheduling
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-7 flex-auto">
              Organize training with custom plans. Never wonder &quot;what am I training today?&quot; again.
            </p>
          </div>

          {/* Feature 4 - Only show on larger screens or stack on mobile */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm transition-all hover:shadow-md hover:border-[#18503c]/30">
            <div className="bg-[#18503c]/10 mb-4 sm:mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
              <BarChart3 className="text-[#18503c] h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold leading-8 text-white mb-2 sm:mb-3">
              Data-Driven Training
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 leading-7 flex-auto">
              Track volume, monitor RPE, and optimize your routine for longevity and progress.
            </p>
          </div>
        </div>

        {/* Footer - Mobile responsive */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-4 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                'bg-[#18503c]',
                'bg-emerald-600',
                'bg-teal-500'
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-[#0a1f18] ${bg}`}
                />
              ))}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-white">
                Join thousands of athletes
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400">
                Training smarter every day
              </p>
            </div>
          </div>
          {/* Hide on very small screens */}
          <div className="hidden xs:flex items-center gap-2 text-xs text-slate-400">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Built for progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
