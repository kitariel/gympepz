import { AppSidebar } from "@/components/sidebar/app-sidebar";
import ProfileSidebar, { ProfileSidebarProvider } from "@/components/sidebar/profile-sidebar";
import { PortalHeader } from "@/components/portal-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { auth } from "@/server/auth";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import type { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();

  // Session is optional: we support Guest Mode throughout /portal.

  return (
    <AuthSessionProvider session={session}>
      <SidebarProvider>
        <ProfileSidebarProvider>
          {/* Left Sidebar - Navigation */}
          <AppSidebar enableEditing={false} width="16rem" />
          
          {/* Main Content Area - Takes remaining space */}
          <SidebarInset className="border-none! ring-0 shadow-slate-200! flex-1 min-w-0 max-w-full">
            <PortalHeader />
            <div className="flex flex-1 flex-col overflow-hidden w-full max-w-full">
              <div className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 pb-16 md:pb-0">
                {children}
              </div>
            </div>
          </SidebarInset>
          
          {/* Mobile Bottom Navigation - Only visible on mobile */}
          <MobileBottomNav />
          
          {/* Right Sidebar - Profile & Stats */}
          {/* Automatically handles mobile as Sheet, visible on tablet/desktop */}
          <ProfileSidebar side="right" width="20rem" />
        </ProfileSidebarProvider>
      </SidebarProvider>
    </AuthSessionProvider>
  );
}
