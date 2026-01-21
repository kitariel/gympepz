"use client";

import { Download, Share, Plus } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface InstallPWAButtonProps {
  variant?: "default" | "sidebar";
}

export function InstallPWAButton({
  variant = "default",
}: InstallPWAButtonProps) {
  const { isInstallable, promptInstall, isIOS, isStandalone, debugInfo } =
    useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Don't show if already installed
  if (isStandalone || !isInstallable) {
    // Show debug info in development
    return (
      <div className="max-w-[300px] rounded border border-orange-200 bg-orange-50 p-3 font-mono text-[10px] text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300">
        <div className="mb-2 font-bold">🔍 PWA Install Debug Info</div>
        <div className="space-y-1">
          <div>
            isStandalone:{" "}
            <span className="font-semibold">{String(isStandalone)}</span>
          </div>
          <div>
            isInstallable:{" "}
            <span className="font-semibold">{String(isInstallable)}</span>
          </div>
          <div>
            isIOS: <span className="font-semibold">{String(isIOS)}</span>
          </div>
          <div className="mt-2 border-t border-orange-300 pt-2 dark:border-orange-800">
            <div>
              SW Registered:{" "}
              <span
                className={
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  debugInfo?.hasServiceWorker
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  String(debugInfo?.hasServiceWorker)
                }
              </span>
            </div>
            <div>
              Manifest Found:{" "}
              <span
                className={
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  debugInfo?.hasManifest
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  String(debugInfo?.hasManifest)
                }
              </span>
            </div>
            <div>
              HTTPS/Localhost:{" "}
              <span
                className={
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  debugInfo?.isHTTPS
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  String(debugInfo?.isHTTPS)
                }
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 border-t border-orange-300 pt-2 text-[9px] text-orange-600 dark:border-orange-800 dark:text-orange-400">
          <div className="mb-1 font-semibold">💡 Tips:</div>
          <ul className="list-inside list-disc space-y-0.5">
            <li>
              Use <code>npm run build && npm start</code> for production build
            </li>
            <li>
              Check Chrome DevTools → Application → Manifest & Service Workers
            </li>
            <li>
              <code>beforeinstallprompt</code> only fires in Chrome/Edge (not
              Safari)
            </li>
            <li>iOS shows install button but requires manual steps</li>
          </ul>
        </div>
      </div>
    );
  }

  const handleClick = () => {
    if (isIOS) {
      // Show iOS instructions dialog
      setShowIOSInstructions(true);
    } else {
      // Trigger native install prompt for other browsers
      void promptInstall();
    }
  };

  if (variant === "sidebar") {
    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleClick} tooltip="Install App">
            <Download className="size-4" />
            <span>Install App</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {isIOS && showIOSInstructions && (
          <IOSInstallDialog
            open={showIOSInstructions}
            onOpenChange={setShowIOSInstructions}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant="outline"
        size="sm"
        className="gap-2 border-teal-500/20 text-teal-500 hover:border-teal-500/50 hover:text-teal-400"
      >
        <Download className="size-4" />
        Install App
      </Button>
      {isIOS && showIOSInstructions && (
        <IOSInstallDialog
          open={showIOSInstructions}
          onOpenChange={setShowIOSInstructions}
        />
      )}
    </>
  );
}

function IOSInstallDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install GymPepz</DialogTitle>
          <DialogDescription>
            To install this app on your iOS device:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <ol className="list-inside list-decimal space-y-2 text-sm">
            <li>
              Tap the share button{" "}
              <Share
                className="mx-1 inline-block h-4 w-4"
                aria-label="share icon"
              />
              in your browser
            </li>
            <li>
              Scroll down and tap{" "}
              <strong>&quot;Add to Home Screen&quot;</strong>{" "}
              <Plus
                className="mx-1 inline-block h-4 w-4"
                aria-label="plus icon"
              />
            </li>
            <li>Tap &quot;Add&quot; in the top right corner</li>
          </ol>
          <p className="text-muted-foreground text-xs">
            Once installed, you can access GymPepz directly from your home
            screen like a native app.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
