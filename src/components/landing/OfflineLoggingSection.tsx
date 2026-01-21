"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";

export default function OfflineLoggingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full overflow-hidden border-y bg-muted/20 py-14 sm:py-16" ref={ref}>
      {/* Animated geometric background boxes */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.04, rotate: -12 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute left-10 top-10 h-52 w-52 bg-blue-500"
          style={{ transform: "rotate(-12deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.025, rotate: 18 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute -right-16 top-1/3 h-60 w-60 bg-emerald-500"
          style={{ transform: "rotate(18deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.03, rotate: -25 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-10 left-1/4 h-44 w-44 bg-teal-500"
          style={{ transform: "rotate(-25deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.02, rotate: 10 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute -bottom-10 right-1/3 h-48 w-48 bg-purple-500"
          style={{ transform: "rotate(10deg)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 md:grid-cols-2 md:items-center"
        >
          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Execute workouts in real time—online or offline
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Track sets, reps, and weights as you train. If the gym signal
              drops, keep going—your workout is saved locally and can sync when
              you're back online.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-pretty text-sm leading-relaxed text-muted-foreground"
            >
              Then review progress analytics to see strength and performance
              trends across weeks and lifts.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-background md:justify-self-end"
          >
            <div className="absolute left-3 top-3 z-10">
              <Badge variant="outline" className="bg-background">
                Offline logging: On
              </Badge>
            </div>
            <Image
              src="/images/placeholder-mobile.png"
              alt="Workout execution and logging screen"
              width={390}
              height={780}
              sizes="(min-width: 768px) 384px, 100vw"
              className="h-auto w-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
