"use client";

import { Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface InstallPWAButtonProps {
  variant?: "default" | "sidebar";
}

export function InstallPWAButton({ variant = "default" }: InstallPWAButtonProps) {
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!isInstallable) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton onClick={promptInstall} tooltip="Install App">
          <Download className="size-4" />
          <span>Install App</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Button 
      onClick={promptInstall} 
      variant="outline" 
      size="sm" 
      className="gap-2 text-teal-500 hover:text-teal-400 border-teal-500/20 hover:border-teal-500/50"
    >
      <Download className="size-4" />
      Install App
    </Button>
  );
}
