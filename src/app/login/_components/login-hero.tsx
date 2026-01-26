"use client";

import { BarChart3, Zap, Calendar, LineChart } from "lucide-react";
import Image from "next/image";

export function LoginHero() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-900">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing-page/light/Lucid_Origin_A_clean_modern_landing_page_hero_background_for_a_2.jpg"
          alt="Go-train login background light"
          width={1000}
          height={1000}
          className="h-full w-full object-cover object-center dark:hidden"
        />
        <Image
          src="/landing-page/dark/AlbedoBase_XL_A_clean_modern_landing_page_hero_background_for_2.jpg"
          alt="Go-train login background dark"
          width={1000}
          height={1000}
          className="hidden h-full w-full object-cover object-center dark:block"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/40"></div>
      </div>

      {/* Mobile-first layout */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Header Content - Mobile optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* Brand */}
          <div className="flex items-center">
            <Image
              src="/logo/go-train.png"
              alt="Go-train logo"
              width={80}
              height={80}
            />
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight">
                <span className="text-sky-400 font-extrabold italic">go</span>
                <span className="text-emerald-300 font-extrabold italic">
                  -train
                </span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">
                Progress Made Visible
              </span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              Train smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400">
                Track everything.
              </span>
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
              Log every set, copy your last weights, and stay focused with rest timers. Offline-first, with sync when you're ready.
            </p>
          </div>
        </div>

        {/* Feature Grid - Glassmorphism style, mobile-first */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-6">
          {/* Feature 1 */}
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/30 hover:bg-white/[0.15] hover:shadow-lg sm:rounded-2xl sm:p-5 md:p-6">
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
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-md transition-all hover:border-blue-400/30 hover:bg-white/[0.15] hover:shadow-lg sm:rounded-2xl sm:p-5 md:p-6">
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
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/30 hover:bg-white/[0.15] hover:shadow-lg sm:rounded-2xl sm:p-5 md:p-6">
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
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-md transition-all hover:border-blue-400/30 hover:bg-white/[0.15] hover:shadow-lg sm:rounded-2xl sm:p-5 md:p-6">
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

        {/* Footer - Product promises */}
        <div className="flex flex-wrap items-center gap-3 border-t border-white/15 pt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:pt-6">
          <span className="rounded-full border border-white/15 px-3 py-1">
            Offline-first
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1">
            Auto-sync ready
          </span>
          <span className="rounded-full border border-white/15 px-3 py-1">
            Private by default
          </span>
        </div>
      </div>
    </div>
  );
}
