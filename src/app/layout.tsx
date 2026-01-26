import "@/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "@/trpc/react";

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Go-Train - Your Fitness Journey Starts Here",
  description:
    "Track workouts, analyze progress, and achieve your fitness goals with intelligent training and personalized workout plans.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Go-Train",
  },
  formatDetection: {
    telephone: false,
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

import { ThemeProvider } from "@/components/theme-provider";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthSessionProvider session={null}>
            <TRPCReactProvider>
              <Suspense fallback={null}>
                <AnalyticsTracker />
              </Suspense>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  classNames: {
                    toast:
                      "bg-background/95 border-border text-foreground shadow-lg backdrop-blur",
                    title: "text-foreground",
                    description: "text-muted-foreground dark:text-slate-300",
                    success:
                      "!bg-emerald-50 !border-emerald-200 !text-emerald-900 dark:!bg-emerald-950 dark:!border-emerald-800 dark:!text-emerald-50",
                    error:
                      "!bg-red-50 !border-red-200 !text-red-900 dark:!bg-red-950 dark:!border-red-800 dark:!text-red-50",
                  },
                }}
              />
            </TRPCReactProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
