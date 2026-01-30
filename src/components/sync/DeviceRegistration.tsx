"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { api } from "@/trpc/react";
import { getDeviceId, getDeviceInfo } from "@/lib/device-id";

/**
 * Registers the current device in the user's device registry.
 * Runs once when user is authenticated and online.
 */
export function DeviceRegistration() {
  const { data: session } = useSession();
  const { isOnline } = useOnlineStatus();
  const hasRegistered = useRef(false);

  const upsertMutation = api.device.upsert.useMutation();

  useEffect(() => {
    // Only register once per session
    if (hasRegistered.current) return;

    // Need to be authenticated and online
    if (!session?.user?.id || !isOnline) return;

    // Get device info
    const deviceId = getDeviceId();
    const { platform, browser } = getDeviceInfo();

    // Register the device
    upsertMutation.mutate(
      { deviceId, platform, browser },
      {
        onSuccess: () => {
          hasRegistered.current = true;
          console.log("[DeviceRegistration] Device registered successfully");
        },
        onError: (error) => {
          console.error("[DeviceRegistration] Failed to register device:", error);
        },
      }
    );
  }, [session?.user?.id, isOnline, upsertMutation]);

  return null;
}
