"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      title: "No more guessing",
      description:
        "See exactly what you lifted last session. Progressive overload made simple.",
    },
    {
      title: "Save time between sets",
      description:
        "One tap to copy your previous set. More time lifting, less time typing.",
    },
    {
      title: "Train anywhere",
      description:
        "Offline-first design means your workout never stops, even when WiFi does.",
    },
    {
      title: "Stay consistent",
      description:
        "Built-in rest timers and progress tracking help you stick to your plan.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-muted/20 py-16 sm:py-24" ref={ref}>
      {/* Animated geometric background boxes */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.025, rotate: 15 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute -right-10 top-10 h-56 w-56 bg-purple-500"
          style={{ transform: "rotate(15deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.03, rotate: -10 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute left-10 top-1/3 h-48 w-48 bg-teal-500"
          style={{ transform: "rotate(-10deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.02, rotate: 20 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute -bottom-20 right-1/4 h-64 w-64 bg-emerald-500"
          style={{ transform: "rotate(20deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.035, rotate: -18 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-1/4 left-1/3 h-40 w-40 bg-blue-500"
          style={{ transform: "rotate(-18deg)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why lifters choose Go-Train
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto mt-4 h-1 w-64 origin-center rounded-full"
              style={{
                background: 'linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) 20%, transparent 40%, transparent 60%, rgb(16 185 129) 80%, rgb(16 185 129) 100%)'
              }}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Built to solve real problems you face in the gym
          </motion.p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="relative rounded-2xl border bg-background p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
