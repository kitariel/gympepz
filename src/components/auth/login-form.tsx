"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type LoginStep = "email" | "password_login" | "otp" | "password_set";

export interface LoginFormProps {
  step: LoginStep;
  email: string;
  password: string;
  otp: string;
  loading: boolean;
  error: string | null;
  fieldError: string | null;
  devOtp?: string | null;
  // Optional provider actions
  onGoogleClick?: () => void;
  onContinueWithEmail?: () => void;
  onSubmitEmail: (e: React.FormEvent<HTMLFormElement>) => void;
  onSubmitPasswordLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  onSubmitOtp: (e: React.FormEvent<HTMLFormElement>) => void;
  onSubmitSetPassword: (e: React.FormEvent<HTMLFormElement>) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onOtpChange: (otp: string) => void;
}

export function LoginForm(props: LoginFormProps) {
  const {
    step,
    email,
    password,
    otp,
    loading,
    error,
    fieldError,
    devOtp,
    onGoogleClick,
    onContinueWithEmail,
    onSubmitEmail,
    onSubmitPasswordLogin,
    onSubmitOtp,
    onSubmitSetPassword,
    onEmailChange,
    onPasswordChange,
    onOtpChange,
  } = props;

  const Separator = () => (
    <div className="relative my-4 flex items-center">
      <div className="bg-border h-px flex-1" />
      <span className="text-muted-foreground mx-3 text-xs">OR</span>
      <div className="bg-border h-px flex-1" />
    </div>
  );

  const ProviderButton = ({
    children,
    onClick,
    icon,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full justify-start gap-3 rounded-xl border-white/10 bg-black/20 text-white hover:bg-white/10 hover:text-white"
      onClick={onClick}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center">
        {icon}
      </span>
      <span className="text-sm">{children}</span>
    </Button>
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>There was a problem</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "email" && (
        <>
          <div className="space-y-3">
            <ProviderButton
              onClick={onGoogleClick}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <g>
                    <path
                      fill="#EA4335"
                      d="M12 10h10a10 10 0 10-3.16 7.07l-3.23-2.65A6 6 0 1112 6z"
                    />
                    <path
                      fill="#4285F4"
                      d="M22 12h-10v4h6a8 8 0 10-2.63 5.66l3.23-2.65A6 6 0 1112 6v4h10z"
                    />
                  </g>
                </svg>
              }
            >
              Google
            </ProviderButton>
            <ProviderButton
              onClick={
                onContinueWithEmail ??
                (() => {
                  const el = document.getElementById("email");
                  el?.focus();
                })
              }
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0l8 6 8-6H4zm16 12V8l-8 6-8-6v10h16z" />
                </svg>
              }
            >
              Continue with Email
            </ProviderButton>
          </div>
          <Separator />
          <form onSubmit={onSubmitEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@host.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value.trim().toLowerCase())}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email.trim()}
            >
              {loading ? "Checking…" : "Continue"}
            </Button>
          </form>
          <div className="pt-2 text-center text-sm">
            <a
              href="#"
              className="font-medium text-fuchsia-500 hover:underline"
            >
              Need help?
            </a>
          </div>
        </>
      )}

      {step === "password_login" && (
        <form onSubmit={onSubmitPasswordLogin} className="space-y-4">
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
              onChange={(e) => onPasswordChange(e.target.value)}
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
        <form onSubmit={onSubmitOtp} className="space-y-4">
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
              onChange={(e) => onOtpChange(e.target.value)}
            />
            {devOtp && (
              <p className="text-muted-foreground text-xs">Dev OTP: {devOtp}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying…" : "Verify OTP"}
          </Button>
        </form>
      )}

      {step === "password_set" && (
        <form onSubmit={onSubmitSetPassword} className="space-y-4">
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
              onChange={(e) => onPasswordChange(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      )}

      {/* profile_setup step removed */}
    </div>
  );
}
