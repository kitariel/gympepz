"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function AnimatedSeparator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="relative my-16 flex items-center justify-center overflow-hidden sm:my-24">
      {/* Animated gradient line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="h-px w-full max-w-4xl origin-center bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
      />

      {/* Center glow effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
      >
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-emerald-500"
        />
      </motion.div>
    </div>
  );
}
