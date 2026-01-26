"use client";

import Link from "next/link";
import Image from "next/image";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

type LandingHeaderProps = {
  ctaHref: string;
};

export default function LandingHeader({ ctaHref }: LandingHeaderProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const isLight = theme === "light";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0f1422]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Image
            src="/logo/go-train.png"
            alt="Go-Train logo"
            width={80}
            height={80}
            priority
          />
          <div>
            <p className="text-lg font-semibold tracking-tight">
              <span className="text-sky-400 font-extrabold text-lg italic">go</span>
              <span className="text-emerald-300 font-extrabold text-lg italic">
                -train
              </span>
            </p>
            <p className="text-xs text-white/70">Train smarter, lift more</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
          <Link href="#features" className="transition hover:text-white">
            Features
          </Link>
          <Link href="#planning" className="transition hover:text-white">
            Weekly Plan
          </Link>
          <Link href="#faq" className="transition hover:text-white">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 sm:flex">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setTheme("light")}
              className={`h-8 w-8 rounded-full ${
                isLight ? "bg-white/15 text-white" : "text-white/70"
              }`}
              aria-label="Switch to light theme"
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setTheme("dark")}
              className={`h-8 w-8 rounded-full ${
                isDark ? "bg-white/15 text-white" : "text-white/70"
              }`}
              aria-label="Switch to dark theme"
            >
              <Moon className="h-4 w-4" />
            </Button>
          </div>
          <Link
            href="/login"
            className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:inline-flex"
          >
            Log in
          </Link>
          <Button asChild size="sm" className="h-9 px-4 text-sm font-semibold">
            <Link href={ctaHref}>Start Training</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
