"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OfflinePage() {
  useEffect(() => {
    // Set page title since we can't use metadata in Client Components
    document.title = "You are offline - GymPepz";
  }, []);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2 text-center">
          <div className="bg-muted rounded-full p-4">
            <WifiOff className="text-muted-foreground h-8 w-8" />
          </div>
          <CardTitle className="text-xl">You are offline</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 text-center">
          <p className="text-muted-foreground text-sm">
            It seems you lost your internet connection. Don&apos;t worry, you
            can still access your offline-ready features.
          </p>
          <div className="grid w-full gap-2">
            <Button asChild className="w-full">
              <Link href="/train">Go to Training (Offline Ready)</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Try to Reconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
