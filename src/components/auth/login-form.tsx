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
  onAppleClick?: () => void;
  onGoogleClick?: () => void;
  onMicrosoftClick?: () => void;
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
    onAppleClick,
    onGoogleClick,
    onMicrosoftClick,
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
              onClick={onAppleClick}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d="M16.365 1.43c0 1.14-.93 2.52-2.04 2.52-.24 0-.54-.09-.72-.18.06-1.14.96-2.46 2.1-2.46.24 0 .48.06.66.12zM20.916 18.93c-.42.93-.93 1.86-1.62 2.73-.96 1.26-2.1 2.82-3.63 2.82-1.41 0-1.86-.9-3.45-.9-1.62 0-2.1.9-3.51.9-1.62 0-2.82-1.71-3.78-3.03-1.68-2.34-3.06-6.66-1.29-9.6.9-1.5 2.46-2.46 4.2-2.46 1.56 0 3 .99 3.45.99.48 0 2.37-1.17 3.96-1.17.66 0 2.82.06 4.26 2.1-3.66 1.98-3.12 7.08 1.41 8.62z" />
                </svg>
              }
            >
              Apple
            </ProviderButton>
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
              onClick={onMicrosoftClick}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <rect x="3" y="3" width="8" height="8" fill="#F25022" />
                  <rect x="13" y="3" width="8" height="8" fill="#7FBA00" />
                  <rect x="3" y="13" width="8" height="8" fill="#00A4EF" />
                  <rect x="13" y="13" width="8" height="8" fill="#FFB900" />
                </svg>
              }
            >
              Microsoft
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
                onChange={(e) => onEmailChange(e.target.value)}
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
    </div>
  );
}
