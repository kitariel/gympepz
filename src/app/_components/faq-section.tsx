"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FadeIn } from "@/components/animations";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is GymPepz free?",
    answer:
      "Yes! GymPepz is 100% free forever. All core features including workout tracking, AI planning, progress analytics, and the exercise library are available at no cost. No credit card required.",
  },
  {
    question: "Do I need a gym membership?",
    answer:
      "Not at all! GymPepz works for any training environment. Our exercise library includes bodyweight exercises, home equipment options, and gym-based workouts. You can filter exercises by available equipment.",
  },
  {
    question: "How does AI workout planning work?",
    answer:
      "Our AI planner asks about your goals, experience level, available equipment, and training frequency. It then generates a personalized workout plan with exercises, sets, reps, and a weekly schedule tailored to your specific needs.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes, you own your data. We're working on data export features that will allow you to download your workout history, progress data, and plans in common formats (CSV, JSON) for backup or analysis.",
  },
  {
    question: "Is my data private?",
    answer:
      "Absolutely. Your data is encrypted and stored securely. We never sell your information to third parties. Your workouts, progress, and personal data are private and only accessible to you. See our Privacy Policy for more details.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto mt-16 max-w-3xl space-y-4">
      {faqs.map((faq, index) => (
        <FadeIn key={index} delay={0.1 * (index + 1)}>
          <Collapsible
            open={openIndex === index}
            onOpenChange={(isOpen) => setOpenIndex(isOpen ? index : null)}
            className="bg-card rounded-xl border p-6"
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
              <span className="font-semibold">{faq.question}</span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground h-5 w-5 transition-transform duration-200",
                  openIndex === index && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="text-muted-foreground mt-4">
              {faq.answer}
            </CollapsibleContent>
          </Collapsible>
        </FadeIn>
      ))}
    </div>
  );
}
