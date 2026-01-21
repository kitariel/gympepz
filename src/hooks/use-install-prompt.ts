"use client";

import { useEffect, useState } from "react";

interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface DebugInfo {
  hasServiceWorker: boolean;
  hasManifest: boolean;
  isHTTPS: boolean;
  userAgent: string;
}

export function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [deferredPrompt, setDeferredPrompt] =
    useState<IBeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Detect iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      // @ts-expect-error: MSStream is only available on IE11, which is not supported
      !(window as never).MSStream;
    setIsIOS(iOS);

    // Detect if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Collect debug info
    const checkDebugInfo = async () => {
      const hasServiceWorker =
        "serviceWorker" in navigator &&
        (await navigator.serviceWorker.getRegistrations()).length > 0;
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
      const isHTTPS =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      setDebugInfo({
        hasServiceWorker,
        hasManifest,
        isHTTPS,
        userAgent: navigator.userAgent,
      });

      // Log debug info to console
      console.log("[PWA Debug]", {
        hasServiceWorker,
        hasManifest,
        isHTTPS,
        isIOS: iOS,
        isStandalone: standalone,
        userAgent: navigator.userAgent,
      });
    };

    void checkDebugInfo();

    // If already installed, don't show install button
    if (standalone) {
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("[PWA] beforeinstallprompt event fired");
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as IBeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    // For iOS, show install button even without beforeinstallprompt event
    // (users need manual instructions)
    if (iOS && !standalone) {
      setIsInstallable(true);
      console.log("[PWA] iOS device detected, showing install button");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      // Log install to analytics
      console.log("[PWA] App was installed");
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    // For iOS, we can't programmatically trigger install
    // User needs to follow manual instructions
    if (isIOS) {
      // On iOS, we can show instructions but can't programmatically install
      // The instructions should be shown in the UI
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isInstallable, promptInstall, isIOS, isStandalone, debugInfo };
}
