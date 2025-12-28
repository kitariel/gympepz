import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "GymPepz - Your Fitness Journey Starts Here",
  description: "Track workouts, analyze progress, and achieve your fitness goals with intelligent training and personalized workout plans.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

import { ThemeProvider } from "@/components/theme-provider";
import { AuthSessionProvider } from "@/components/auth/session-provider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthSessionProvider session={null}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
