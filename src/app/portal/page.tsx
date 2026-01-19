"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Fresh-start: the primary experience is the offline-first /train flow.
 * Keep /portal as a legacy entrypoint, but send users to /train.
 */
export default function PortalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/train");
  }, [router]);

  return null;
}

