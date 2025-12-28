"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const [showPassword, setShowPassword] = useState(false);

  const Separator = () => (
    // <div className="relative my-6 flex items-center">
    //   <div className="bg-border h-px flex-1" />
    //   <span className="text-muted-foreground mx-4 text-xs font-medium tracking-wider uppercase">
    //     Or continue with
    //   </span>
    //   <div className="bg-border h-px flex-1" />
    // </div>
    <div></div>
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
      className="border-input bg-background hover:bg-accent hover:text-accent-foreground relative h-11 w-full justify-center gap-2 rounded-lg font-medium transition-all"
      onClick={onClick}
    >
      <span className="absolute left-4 flex h-5 w-5 items-center justify-center">
        {icon}
      </span>
      <span>{children}</span>
    </Button>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-[400px] space-y-6 duration-500">
      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "email" && (
        <div className="space-y-6">
          <div className="space-y-3">
            {/* <ProviderButton
              onClick={onGoogleClick}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              }
            >
              Google
            </ProviderButton> */}

            {/* Hidden for now as per design, but keeping prop support */}
            {/* {onContinueWithEmail && (
              <ProviderButton
                onClick={() => {
                  const el = document.getElementById("email");
                  el?.focus();
                }}
                icon={<Mail className="h-4 w-4" />}
              >
                Continue with Email
              </ProviderButton>
            )} */}
          </div>

          <Separator />

          <form onSubmit={onSubmitEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="h-11 pl-9"
                  value={email}
                  onChange={(e) =>
                    onEmailChange(e.target.value.trim().toLowerCase())
                  }
                />
              </div>
            </div>
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-sm transition-colors hover:underline"
            >
              Trouble signing in?
            </a>
          </div>
        </div>
      )}

      {step === "password_login" && (
        <form
          onSubmit={onSubmitPasswordLogin}
          className="animate-in fade-in slide-in-from-right-8 space-y-4 duration-300"
        >
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                type="email"
                value={email}
                disabled
                className="bg-muted/50 h-11 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary text-xs hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                aria-invalid={!!fieldError}
                className={cn(
                  "h-11 pr-10 pl-9",
                  fieldError &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-11 w-10 px-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="text-muted-foreground h-4 w-4" />
                ) : (
                  <Eye className="text-muted-foreground h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            {fieldError && (
              <p className="text-destructive mt-1 flex items-center gap-1 text-sm">
                <AlertCircle className="h-3 w-3" />
                {fieldError}
              </p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form
          onSubmit={onSubmitOtp}
          className="animate-in fade-in slide-in-from-right-8 space-y-4 duration-300"
        >
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                type="email"
                value={email}
                disabled
                className="bg-muted/50 h-11 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">One-Time Password (OTP)</Label>
            <div className="relative">
              <KeyRound className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                className="h-11 pl-9 tracking-widest"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              We sent a code to your email.
            </p>
            {devOtp && (
              <Alert className="bg-muted/50 mt-2 border-dashed py-2">
                <AlertDescription className="font-mono text-xs">
                  Dev OTP:{" "}
                  <span className="font-bold select-all">{devOtp}</span>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>
        </form>
      )}

      {step === "password_set" && (
        <form
          onSubmit={onSubmitSetPassword}
          className="animate-in fade-in slide-in-from-right-8 space-y-4 duration-300"
        >
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                type="email"
                value={email}
                disabled
                className="bg-muted/50 h-11 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Create a password</Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="h-11 pr-10 pl-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-11 w-10 px-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="text-muted-foreground h-4 w-4" />
                ) : (
                  <Eye className="text-muted-foreground h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              This will be used for future logins.
            </p>
          </div>

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save and continue"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
