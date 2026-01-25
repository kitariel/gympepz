"use client";

import { Clock, Copy, TrendingUp, Zap, Timer, Database } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Copy,
      title: "Copy Last Set",
      description:
        "Tap once to copy your previous set's weight and reps. No more typing the same numbers.",
      gradient: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: TrendingUp,
      title: "See Previous Performance",
      description:
        "Know exactly what you lifted last time. Make progress every session.",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Clock,
      title: "Rest Timer",
      description:
        "60, 90, or 120 second presets. Focus on your lift, not the clock.",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Zap,
      title: "Works Offline",
      description:
        "Log workouts even when gym WiFi fails. Everything saves locally first.",
      gradient: "from-orange-500/10 to-yellow-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      icon: Timer,
      title: "Auto-Save Progress",
      description:
        "Every rep is saved instantly. Never lose your workout data again.",
      gradient: "from-teal-500/10 to-emerald-500/10",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      icon: Database,
      title: "Complete History",
      description:
        "Access your entire training history with detailed analytics and insights.",
      gradient: "from-rose-500/10 to-red-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Visualize your strength gains with charts and trends over time.",
      gradient: "from-sky-500/10 to-blue-500/10",
      iconColor: "text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <section id="features" className="relative w-full overflow-hidden border-y bg-muted/30 py-16 sm:py-24" ref={ref}>
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-blue-500 blur-3xl" />
      </motion.div>

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
              Built for the gym
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto mt-4 h-1 w-24 origin-center rounded-full bg-linear-to-r from-emerald-500 to-green-500"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Every feature designed to make logging faster and training smarter.
          </motion.p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: -10 }}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + index * 0.08,
                  ease: [0.21, 0.47, 0.32, 0.98]
                }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-xl"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-emerald-500/0 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-10" />

                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`relative z-10 mb-4 inline-flex rounded-lg bg-linear-to-br ${feature.gradient} p-3`}
                >
                  <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                </motion.div>
                <h3 className="relative z-10 mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="relative z-10 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
