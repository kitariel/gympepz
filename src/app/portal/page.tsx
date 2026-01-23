"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Portal landing page redirects to the AI Planner.
 */
export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal/ai-planner");
  }, [router]);

  return null;
}

