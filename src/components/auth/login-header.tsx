"use client";

import React from "react";
import { Dumbbell } from "lucide-react";
import type { LoginStep } from "@/components/auth/login-form";

export interface LoginHeaderProps {
  step: LoginStep;
  title?: string;
  subtitle?: string;
}

export function LoginHeader({
  step,
  title = "AliPlace",
  subtitle,
}: LoginHeaderProps) {
  // Dynamic subtitles based on step - mobile-first friendly
  const stepSubtitles = {
    email: subtitle ?? "Get started with your fitness journey",
    password_login: "Welcome back! Enter your password to continue.",
    otp: "Check your email for the verification code.",
    password_set: "Create a secure password to complete your account.",
  };

  const stepDescriptions = {
    email: "Sign in with your email or continue with Google.",
    password_login: "",
    otp: "We sent a 6-digit code to your email address.",
    password_set: "Your password will be used for future logins.",
  };

  const currentSubtitle = stepSubtitles[step];
  const currentDescription = stepDescriptions[step];

  return (
    <div className="px-4 py-4 sm:py-5 md:py-6">
      {/* Logo and Brand - Matching landing page style */}
      <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <div className="bg-primary text-primary-foreground flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg shadow-sm">
          <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {title}
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
  );
}
