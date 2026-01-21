"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function ContinuousVerticalLine() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Transform scroll progress to line height
  const lineHeight = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-0 z-0 h-full w-px -translate-x-1/2">
      {/* Static background line */}
      <div className="absolute inset-0 w-px bg-linear-to-b from-transparent via-border/10 to-transparent" />

      {/* Animated progress line that follows scroll */}
      <motion.div
        style={{ height: lineHeight }}
        className="absolute left-0 top-0 w-px origin-top"
      >
        {/* Main gradient line */}
        <div className="absolute inset-0 w-px bg-linear-to-b from-emerald-500/40 via-emerald-400/40 to-emerald-500/40" />

        {/* Glow effect at the tip */}
        <motion.div
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
        />
      </motion.div>

      {/* Subtle lightning branches */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute left-0 top-1/4"
      >
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0 }}
          className="absolute left-0 h-px w-5 origin-left rotate-45 bg-linear-to-r from-emerald-500/30 to-transparent"
        />
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          className="absolute right-0 h-px w-5 origin-right -rotate-45 bg-linear-to-l from-emerald-500/30 to-transparent"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute left-0 top-1/2"
      >
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute left-0 h-px w-7 origin-left rotate-30 bg-linear-to-r from-emerald-500/30 to-transparent"
        />
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
          className="absolute right-0 h-px w-7 origin-right -rotate-30 bg-linear-to-l from-emerald-500/30 to-transparent"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute left-0 top-3/4"
      >
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          className="absolute left-0 h-px w-5 origin-left rotate-60 bg-linear-to-r from-emerald-500/30 to-transparent"
        />
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2.5 }}
          className="absolute right-0 h-px w-5 origin-right -rotate-60 bg-linear-to-l from-emerald-500/30 to-transparent"
        />
      </motion.div>
    </div>
  );
}
