"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your email to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>There was a problem</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" && (
            <form onSubmit={submitEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Checking…" : "Continue"}
              </Button>
            </form>
          )}

          {step === "password_login" && (
            <form onSubmit={submitPasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldError}
                />
                {fieldError && (
                  <p className="text-destructive text-sm">{fieldError}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                {devOtp && (
                  <p className="text-muted-foreground text-xs">
                    Dev OTP: {devOtp}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying…" : "Verify OTP"}
              </Button>
            </form>
          )}

          {step === "password_set" && (
            <form onSubmit={submitSetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Create a password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : "Save and continue"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Button type="button" variant="outline" className="w-full" disabled>
            Continue with Google (coming soon)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
