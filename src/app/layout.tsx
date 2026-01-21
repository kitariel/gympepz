import "@/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "GymPepz - Your Fitness Journey Starts Here",
  description:
    "Track workouts, analyze progress, and achieve your fitness goals with intelligent training and personalized workout plans.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GymPepz",
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
            </TRPCReactProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
