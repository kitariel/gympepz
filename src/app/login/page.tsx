"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { api } from "@/trpc/react";

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
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.ok) {
        router.push("/portal");
        return;
      }
      const err = res?.error ?? "Login failed";
      switch (err) {
        case "LOCKED":
          setError("Too many failed attempts. Your account is temporarily locked.");
          break;
        case "INACTIVE":
          setError("Your account is not active. Please complete verification.");
          break;
        case "INVALID_CREDENTIALS":
          setError("Invalid email or password.");
          break;
        case "NO_PASSWORD":
          // Shouldn't happen in this step, but handle gracefully
          setError("Please complete registration and set a password.");
          setStep("otp");
          break;
        default:
          setError(err);
      }
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
        const login = await signIn("credentials", { email, password, redirect: false });
        if (login?.ok) {
          router.push("/portal");
          return;
        }
        setError(login?.error ?? "Login failed after setting password.");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">Enter your email to continue.</p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={submitEmail} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? "Checking…" : "Continue"}
            </button>
          </form>
        )}

        {step === "password_login" && (
          <form onSubmit={submitPasswordLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={submitOtp} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                One-Time Password (OTP)
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              {devOtp && (
                <p className="mt-2 text-xs text-gray-500">Dev OTP: {devOtp}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
          </form>
        )}

        {step === "password_set" && (
          <form onSubmit={submitSetPassword} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                Create a password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save and continue"}
            </button>
          </form>
        )}

        <div className="mt-6">
          <button
            type="button"
            disabled
            className="inline-flex w-full items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200"
          >
            Continue with Google (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}