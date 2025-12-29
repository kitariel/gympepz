import { AppSidebar } from "@/components/sidebar/app-sidebar";
import ProfileSidebar from "@/components/sidebar/profile-sidebar";
import { PortalHeader } from "@/components/portal-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import type { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Session is used for server-side protection; user details are shown from NavUser in the sidebar footer.

  return (
    <AuthSessionProvider session={session}>
      <SidebarProvider>
        {/* Left Sidebar - Navigation */}
        <AppSidebar enableEditing={false} width="16rem" />
        
        {/* Main Content Area - Takes remaining space */}
        <SidebarInset className="border-none! ring-0 shadow-slate-200! flex-1 min-w-0 max-w-full">
          <PortalHeader />
          <div className="flex flex-1 flex-col overflow-hidden w-full max-w-full">
            <div className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0">
              {children}
            </div>
          </div>
        </SidebarInset>
        
        {/* Right Sidebar - Profile & Stats */}
        <ProfileSidebar side="right" width="20rem" />
      </SidebarProvider>
    </AuthSessionProvider>
  );
}
