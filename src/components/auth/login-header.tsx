"use client";

import React from "react";
import type { LoginStep } from "@/components/auth/login-form";

export interface LoginHeaderProps {
  step: LoginStep;
  title?: string;
  subtitle?: string;
  logoEmoji?: string; // simple placeholder logo
}

export function LoginHeader({
  step,
  title = "Kit Projects",
  subtitle = "Sign up or Login with",
  logoEmoji = "🎨",
}: LoginHeaderProps) {
  const description =
    step === "email"
      ? "Enter your email to continue."
      : step === "password_login"
        ? "Enter your password to sign in."
        : step === "otp"
          ? "Enter the OTP we sent to your email."
          : "Set a password to complete registration.";

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-sm">
          <span className="text-xl" aria-hidden>
            {logoEmoji}
          </span>
        </div> */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="text-white">{title.replace(/\..*$/g, "")}</span>
            {title.includes(".") && (
              <span className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                {title.slice(title.indexOf("."))}
              </span>
            )}
          </h1>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">{subtitle}</p>
      {/* Step helper below for non-email steps */}
      {step !== "email" && (
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      )}
    </div>
  );
}
