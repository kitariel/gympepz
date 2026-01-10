"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate: logPageView } = api.analytics.logPageView.useMutation();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Construct the full URL path with query params
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    
    // Prevent duplicate logging if the path hasn't changed
    if (lastPathRef.current === url) return;
    
    // Update the ref to the current URL
    lastPathRef.current = url;

    // Log the page view
    logPageView({
      path: url,
      userAgent: window.navigator.userAgent,
    });
  }, [pathname, searchParams, logPageView]);

  return null;
}
