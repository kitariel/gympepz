"use client";

import { Calendar, Play, TrendingUp, Target } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: Target,
      step: "1",
      title: "Set your goals",
      description:
        "Create a workout plan manually or use AI to generate one based on your fitness level and goals.",
    },
    {
      icon: Calendar,
      step: "2",
      title: "Start your workout",
      description:
        "Follow your plan day by day. See what exercises are up next and what you lifted last time.",
    },
    {
      icon: Play,
      step: "3",
      title: "Log as you lift",
      description:
        "Copy your previous sets with one tap, adjust the weight, and log each set. Rest timer starts automatically.",
    },
    {
      icon: TrendingUp,
      step: "4",
      title: "Track your progress",
      description:
        "Review your strength gains over time with detailed analytics and workout history.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden border-y py-16 sm:py-24" ref={ref}>
      {/* Animated background gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.02 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-emerald-500 blur-3xl" />
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
              How it works
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
            Four simple steps to smarter training
          </motion.p>
        </motion.div>

        {/* Desktop: Horizontal layout with connecting lines */}
        <div className="relative mt-16 hidden lg:block">
          {/* Horizontal connecting line */}
          <div className="absolute left-0 right-0 top-12 flex items-center justify-center">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-0.5 w-full origin-left"
              style={{
                background: 'linear-gradient(to right, transparent 5%, rgb(16 185 129) 15%, rgb(16 185 129) 85%, transparent 95%)'
              }}
            />
          </div>

          <div className="grid grid-cols-4 gap-8">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 50 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Circle with icon */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                  >
                    <Icon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />

                    {/* Step number badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.15 }}
                      className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-lg dark:bg-emerald-500"
                    >
                      {item.step}
                    </motion.div>

                    {/* Pulse animation */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, delay: 1 + index * 0.15, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-500"
                    />
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.15 }}
                    className="mb-3 text-xl font-semibold"
                  >
                    {item.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.4, delay: 1 + index * 0.15 }}
                    className="text-sm text-muted-foreground"
                  >
                    {item.description}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical layout */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:hidden">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-emerald-500/10 shadow-lg"
                >
                  <Icon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white dark:bg-emerald-500">
                    {item.step}
                  </div>
                </motion.div>

                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
