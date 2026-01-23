"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Portal landing page redirects to training.
 */
export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
  router.replace("/portal/train");
  }, [router]);

  return null;
}
