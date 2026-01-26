"use client";

import Image from "next/image";
import Link from "next/link";
import { Dumbbell, History, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

type HeroProps = {
  ctaHref: string;
};

export default function Hero({ ctaHref }: HeroProps) {
  return (
    <header className="relative w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing-page/light/Lucid_Origin_A_clean_modern_landing_page_hero_background_for_a_2.jpg"
          alt="Go-Train hero background light"
          fill
          className="hidden  object-center opacity-90 sm:block dark:hidden"
          priority
          quality={90}
        />
        <Image
          src="/landing-page/dark/AlbedoBase_XL_A_clean_modern_landing_page_hero_background_for_2.jpg"
          alt="Go-Train hero background dark"
          fill
          className="hidden object-center opacity-90 sm:dark:block"
          priority
          quality={90}
        />
        <Image
          src="/landing-page/dark/mobile/AlbedoBase_XL_A_clean_modern_landing_page_hero_background_for_3.jpg"
          alt="Go-Train hero background dark mobile"
          fill
          className="hidden  object-center opacity-90 dark:block sm:hidden"
          priority
          quality={90}
        />
        <Image
          src="/landing-page/light/mobile/Lucid_Origin_A_clean_modern_landing_page_hero_background_for_a_0.jpg"
          alt="Go-Train hero background light mobile"
          fill
          className=" object-center opacity-90 sm:hidden dark:hidden"
          priority
          quality={90}
        />

        <div className="absolute inset-0 bg-linear-to-b from-slate-900/70 via-slate-900/45 to-slate-900/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center">
                <Image
                  src="/logo/go-train.png"
                  alt="Go-Train logo"
                  width={80}
                  height={80}
                />
                <span className="text-xl font-semibold tracking-tight">
                  <span className="text-sky-400 text-4xl font-extrabold italic">go</span>
                  <span className="text-emerald-300 text-4xl font-extrabold italic">
                    -train
                  </span>
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Train smarter.
                <br />
                Track everything.
              </h1>
              <p className="text-lg text-white/70 sm:text-xl">
                The workout tracker that remembers your last set, copies your
                weights, and times your rest—so you can focus on lifting.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base font-medium bg-emerald-500 text-white hover:bg-emerald-400"
              >
                <Link href={ctaHref}>Start Training Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base font-medium border-white/40 text-white hover:bg-white/10"
              >
                <Link href="#features">See Features</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              <div className="flex items-start gap-3 rounded-lg bg-white/10 p-4 backdrop-blur">
                <div className="rounded-lg bg-emerald-500/15 p-2">
                  <Dumbbell className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-medium text-white">Copy Sets</p>
                  <p className="text-sm text-white/70">
                    Tap to copy your last weight & reps
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-white/10 p-4 backdrop-blur">
                <div className="rounded-lg bg-emerald-500/15 p-2">
                  <History className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-medium text-white">See Previous</p>
                  <p className="text-sm text-white/70">
                    Know what you lifted last time
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-white/10 p-4 backdrop-blur">
                <div className="rounded-lg bg-emerald-500/15 p-2">
                  <BarChart3 className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="font-medium text-white">Track Progress</p>
                  <p className="text-sm text-white/70">
                    See strength gains over time
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative lg:justify-self-end"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-2 shadow-2xl"
            >
              <Image
                src="/images/placeholder-mobile.png"
                alt="Go-Train workout logging interface"
                width={390}
                height={780}
                sizes="(min-width: 1024px) 448px, (min-width: 640px) 384px, 100vw"
                priority
                className="h-auto w-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
