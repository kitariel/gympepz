"use client";

import React from "react";
import Image from "next/image";
import type { LoginStep } from "@/components/auth/login-form";

export interface LoginHeaderProps {
  step: LoginStep;
  title?: string;
  subtitle?: string;
}

export function LoginHeader({
  step,
  title = "Go-Train",
  subtitle,
}: LoginHeaderProps) {
  // Dynamic subtitles based on step - mobile-first friendly
  const stepSubtitles = {
    email: subtitle ?? "Sign in to keep your training synced.",
    password_login: "Welcome back. Enter your password to continue.",
    otp: "Check your email for the verification code.",
    password_set: "Create a secure password to finish setup.",
  };

  const stepDescriptions = {
    email: "Offline-first by default. Sync whenever you're ready.",
    password_login: "",
    otp: "We sent a 6-digit code to your email address.",
    password_set: "Your password will be used for future logins.",
  };

  const currentSubtitle = stepSubtitles[step];
  const currentDescription = stepDescriptions[step];

  return (
    <div className="px-4 py-4 sm:py-5 md:py-6">
      {/* Logo and Brand - Matching landing page style */}
      <div className="flex flex-col  items-center justify-center">
        <div className="mb-4 sm:mb-6 flex items-center">
          <Image
            src="/logo/go-train.png"
            alt="Go-train logo"
            width={80}
            height={80}
          />
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              <span className="text-sky-400 font-extrabold italic">go</span>
              <span className="text-emerald-400 font-extrabold italic">
                -train
              </span>
            </h1>
          </div>
        </div>

        {/* Subtitle - Mobile responsive */}
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-medium text-foreground">
            {currentSubtitle}
          </p>

          {/* Step description - Only show on certain steps */}
          {currentDescription && step !== "password_login" && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {currentDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
