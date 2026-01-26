"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function WeeklyPlanSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="planning" className="relative w-full overflow-hidden py-14 sm:py-16" ref={ref}>
      {/* Animated geometric background boxes */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.03, rotate: 12 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -left-20 top-20 h-64 w-64 bg-emerald-500"
          style={{ transform: "rotate(12deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.02, rotate: -15 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute right-10 top-40 h-48 w-48 bg-blue-500"
          style={{ transform: "rotate(-15deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.04, rotate: 8 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute -bottom-10 left-1/3 h-40 w-40 bg-purple-500"
          style={{ transform: "rotate(8deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.025, rotate: -20 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute bottom-20 right-1/4 h-56 w-56 bg-teal-500"
          style={{ transform: "rotate(-20deg)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="grid gap-10 md:grid-cols-2 md:items-center"
        >
          <div className="space-y-5">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Build your plan manually
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Go-Train gives you full control to build workouts your way, with
              flexible days, exercises, sets, and progression.
            </motion.p>

            <div className="grid gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-xl border bg-background p-4 transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-semibold">Manual planning</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Build days your way</li>
                  <li>Choose exercises, sets, reps, order</li>
                  <li>Keep full control of structure</li>
                </ul>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-muted/20 md:justify-self-end"
          >
            <Image
              src="/images/placeholder-mobile.png"
              alt="Plan builder and weekly schedule view"
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
