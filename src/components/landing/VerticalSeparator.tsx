"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function VerticalSeparator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="relative flex justify-center py-12 sm:py-16">
      <div className="relative h-32 w-px sm:h-40">
        {/* Main vertical line that grows from top to bottom */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-x-0 top-0 h-full w-px origin-top bg-gradient-to-b from-transparent via-emerald-500 to-transparent"
        />

        {/* Crack/lightning effect - multiple branching lines */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute left-0 top-1/4 h-6 w-6 origin-left"
        >
          <div className="h-px w-6 rotate-45 bg-gradient-to-r from-emerald-500/50 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute right-0 top-1/3 h-6 w-6 origin-right"
        >
          <div className="h-px w-6 -rotate-45 bg-gradient-to-l from-emerald-500/50 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="absolute left-0 top-2/3 h-6 w-6 origin-left"
        >
          <div className="h-px w-6 rotate-[30deg] bg-gradient-to-r from-emerald-500/50 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute right-0 top-3/4 h-6 w-6 origin-right"
        >
          <div className="h-px w-6 -rotate-[30deg] bg-gradient-to-l from-emerald-500/50 to-transparent" />
        </motion.div>

        {/* Center glow effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
        >
          {/* Pulsing glow */}
          <motion.div
            animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-emerald-500"
          />
        </motion.div>

        {/* Additional glow particles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 2, delay: 0.9, repeat: Infinity }}
          className="absolute left-1/2 top-1/4 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: [0, 1, 0] } : { opacity: 0 }}
          transition={{ duration: 2, delay: 1.2, repeat: Infinity }}
          className="absolute left-1/2 top-3/4 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400"
        />
      </div>
    </div>
  );
}
