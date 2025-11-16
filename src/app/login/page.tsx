"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

import { LoginForm } from "@/components/auth/login-form";
import type React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LoginHeader } from "@/components/auth/login-header";

// UI flow states
type Step = "email" | "password_login" | "otp" | "password_set";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // tRPC mutations
  const registerMutation = api.auth.register.useMutation();
  const verifyOtpMutation = api.auth.verifyOtp.useMutation();
  const setPasswordMutation = api.auth.setPassword.useMutation();

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await registerMutation.mutateAsync({ email });
      if (res.status === "exists_with_password") {
        setStep("password_login");
      } else if (res.status === "exists_no_password") {
        setDevOtp(res.otp ?? null);
        setStep("otp");
      } else if (res.status === "otp_sent") {
        setDevOtp(res.otp ?? null);
        setStep("otp");
      } else if (res.status === "rate_limited") {
        setError(`Too many requests. Try again in ${res.retryAfterSeconds}s.`);
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setLoading(true);
    try {
      // Use redirect: false to handle errors inline under the password field
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      // Prioritize error field; NextAuth may return ok: true with error: "Configuration" when misconfigured
      if (res?.error) {
        const err = res.error;
        switch (err) {
          case "INVALID_CREDENTIALS":
          case "CredentialsSignin":
          case "Configuration":
            // Treat as invalid for inline UX; "Configuration" typically indicates env misconfig
            setFieldError("Invalid email or password.");
            break;
          case "LOCKED":
            setError(
              "Too many failed attempts. Your account is temporarily locked.",
            );
            break;
          case "INACTIVE":
            setError(
              "Your account is not active. Please complete verification.",
            );
            break;
          case "NO_PASSWORD":
            setError("Please complete registration and set a password.");
            setStep("otp");
            break;
          default:
            setError(err ?? "Login failed");
        }
        return;
      }

      if (res?.ok) {
        // Navigate to portal on success
        router.replace("/portal");
        // Ensure server components read the new auth cookies
        router.refresh();
        return;
      }

      // Fallback if neither error nor ok flags are set
      setFieldError("Invalid email or password.");
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyOtpMutation.mutateAsync({ email, otp });
      if (res.status === "verified_pending_password") {
        setStep("password_set");
      } else if (res.status === "otp_expired") {
        setError("OTP expired. Please request a new one.");
      } else if (res.status === "otp_invalid") {
        setError("Invalid OTP. Please try again.");
      } else if (res.status === "otp_locked") {
        setError(`Too many attempts. Try again in ${res.retryAfterSeconds}s.`);
      } else if (res.status === "no_otp") {
        setError("No OTP found. Please request a new one.");
      } else if (res.status === "not_found") {
        setError("User not found.");
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await setPasswordMutation.mutateAsync({ email, password });
      if (res.status === "password_set") {
        // Automatically sign in and let NextAuth handle redirect
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/portal",
          redirect: true,
        });
      } else {
        setError("User not found.");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarProvider
      style={{ ["--sidebar-width"]: "22rem" } as React.CSSProperties}
    >
      {/* Left-side sidebar with the form; main content area shows Hello world */}
      <Sidebar side="left" variant="inset">
        <SidebarHeader>
          <LoginHeader step={step} />
        </SidebarHeader>
        <SidebarContent>
          <div className="px-4 py-2">
            <LoginForm
              step={step}
              email={email}
              password={password}
              otp={otp}
              loading={loading}
              error={error}
              fieldError={fieldError}
              devOtp={devOtp}
              onSubmitEmail={submitEmail}
              onSubmitPasswordLogin={submitPasswordLogin}
              onSubmitOtp={submitOtp}
              onSubmitSetPassword={submitSetPassword}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onOtpChange={setOtp}
            />
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-4 py-3">
            {step !== "email" && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setError(null);
                  setFieldError(null);
                  setPassword("");
                  setOtp("");
                  setStep("email");
                }}
                className="w-full"
              >
                Start over
              </Button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <span className="text-muted-foreground text-sm">Login</span>
          </div>
        </header>
        <div className="p-4">
          <div className="bg-muted/50 rounded-xl p-6">Hello world</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
