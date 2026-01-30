"use client";

import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useInView } from "framer-motion";

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Does it work offline?",
      answer:
        "Absolutely. Go-Train is offline-first, so workouts save locally on your device. When sync is enabled, your data can upload once you're back online—no lost sessions due to spotty gym WiFi.",
    },
    {
      question: "Can I use it on multiple devices?",
      answer:
        "Multi-device access is supported when sync is enabled. If sync isn’t enabled yet, each device keeps its own local data.",
    },
    {
      question: "What kind of exercises are supported?",
      answer:
        "Go-Train supports all types of exercises—weightlifting, bodyweight movements, cardio, and more. You can choose from our extensive exercise library or create custom exercises tailored to your routine.",
    },
    {
      question: "Can I track cardio and other activities?",
      answer:
        "Yes! While Go-Train is optimized for strength training, you can also log cardio sessions, stretching, and any other fitness activities you want to track.",
    },
    {
      question: "How do I copy my previous sets?",
      answer:
        "When logging a workout, simply tap the copy button next to any previous set. The weight and reps will instantly populate in your current set—no typing required.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. We use industry-standard encryption to protect your data both in transit and at rest. Your workout data is private and only accessible to you.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative w-full overflow-hidden py-16 sm:py-24" ref={ref}>
      {/* Animated geometric background boxes */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.03, rotate: 16 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -left-16 top-20 h-56 w-56 bg-emerald-500"
          style={{ transform: "rotate(16deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.025, rotate: -14 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute right-10 top-1/4 h-48 w-48 bg-purple-500"
          style={{ transform: "rotate(-14deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.04, rotate: 22 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-20 left-1/4 h-52 w-52 bg-blue-500"
          style={{ transform: "rotate(22deg)" }}
        />
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={isInView ? { opacity: 0.02, rotate: -8 } : { opacity: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute -bottom-10 right-1/3 h-60 w-60 bg-teal-500"
          style={{ transform: "rotate(-8deg)" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
              Frequently Asked Questions
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto mt-4 h-1 w-48 origin-center rounded-full bg-linear-to-r from-emerald-500 to-green-500"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Have questions? Let&apos;s talk
          </motion.p>
        </motion.div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
              className="overflow-hidden rounded-2xl border bg-background shadow-sm transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/50"
              >
                <span className="text-lg font-semibold">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-6 pt-0 text-muted-foreground">
                  {faq.answer}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12 rounded-2xl border bg-muted/20 p-6 text-center"
        >
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a
              href="mailto:support@gympepz.com"
              className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
