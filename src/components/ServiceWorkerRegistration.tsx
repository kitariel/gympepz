"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA functionality.
 * Handles:
 * - SW registration on mount
 * - SW update detection
 * - Automatic update prompts
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in production or when explicitly enabled
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Skip in development unless explicitly enabled
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_ENABLE_SW) {
      console.log("[SW] Service worker disabled in development");
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[SW] Service worker registered successfully");

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker available
              console.log("[SW] New service worker available");

              // Optionally show update prompt
              if (window.confirm("A new version is available. Reload to update?")) {
                newWorker.postMessage("skipWaiting");
                window.location.reload();
              }
            }
          });
        });

        // Handle controller change (after skipWaiting)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("[SW] Controller changed, reloading...");
        });
      } catch (error) {
        console.error("[SW] Service worker registration failed:", error);
      }
    };

    void registerSW();
  }, []);

  return null;
}
