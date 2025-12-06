"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@/components/ui/sidebar";
import { LoginHeader } from "@/components/auth/login-header";
import { useSession } from "next-auth/react";

// UI flow states
type Step = "email" | "password_login" | "otp" | "password_set";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  // removed country/region selection from login

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobileView(e.matches);
    setIsMobileView(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // If returning from Google, decide whether to set password or go to portal
  const googleCallback = searchParams?.get("google") === "1";
  const sessionEmail = useMemo(
    () => (session?.user?.email ?? "").trim().toLowerCase(),
    [session?.user?.email],
  );
  const userQuery = api.user.getByEmail.useQuery(
    { email: sessionEmail },
    { enabled: googleCallback && status === "authenticated" && !!sessionEmail },
  );
  useEffect(() => {
    if (!googleCallback || status !== "authenticated") return;
    const u = userQuery.data as {
      hasPassword?: boolean;
      emailVerified?: Date | null;
    } | null;
    if (!u) return;
    if (u.hasPassword) {
      router.replace("/portal");
      router.refresh();
    } else {
      setStep("password_set");
    }
  }, [googleCallback, status, userQuery.data, router]);

  useEffect(() => {
    if (status === "authenticated" && sessionEmail && email !== sessionEmail) {
      setEmail(sessionEmail);
    }
  }, [status, sessionEmail]);

  // tRPC mutations
  const registerMutation = api.auth.register.useMutation();
  const verifyOtpMutation = api.auth.verifyOtp.useMutation();
  const setPasswordMutation = api.auth.setPassword.useMutation();
  

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const eLower = email.trim().toLowerCase();
      const res = await registerMutation.mutateAsync({ email: eLower });
      if (res.status === "exists_with_password") {
        setStep("password_login");
      } else if (res.status === "verified_no_password") {
        setStep("password_set");
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

  // removed profile setup submit; sign-in occurs after password set

  async function submitPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setLoading(true);
    try {
      // Use redirect: false to handle errors inline under the password field
      const eLower = email.trim().toLowerCase();
      const res = await signIn("credentials", {
        email: eLower,
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
      const eLower = email.trim().toLowerCase();
      const res = await verifyOtpMutation.mutateAsync({ email: eLower, otp });
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
      const eLower = email.trim().toLowerCase();
      const res = await setPasswordMutation.mutateAsync({
        email: eLower,
        password,
      });
      if (res.status === "password_set") {
        await signIn("credentials", { email: eLower, password, callbackUrl: "/portal", redirect: true });
      } else {
        setError("User not found.");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isMobileView) {
    return (
      <div className="flex min-h-dvh flex-col">
        <div className="px-4 py-6">
          <LoginHeader step={step} />
        </div>
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
            onGoogleClick={() =>
              signIn("google", {
                callbackUrl: "/login?google=1",
                redirect: true,
              })
            }
            onSubmitEmail={submitEmail}
            onSubmitPasswordLogin={submitPasswordLogin}
            onSubmitOtp={submitOtp}
            onSubmitSetPassword={submitSetPassword}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onOtpChange={setOtp}
          />
        </div>
        <div className="mt-auto px-4 py-3">
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
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ ["--sidebar-width"]: "22rem" } as React.CSSProperties}
    >
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
            onGoogleClick={() =>
              signIn("google", {
                callbackUrl: "/login?google=1",
                redirect: true,
              })
            }
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
      <SidebarInset className="hidden md:block">
        <div className="p-4">
          <div className="bg-muted/50 rounded-xl p-6">Hello world</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
