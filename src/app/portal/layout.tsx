import { AppSidebar } from "@/components/sidebar/app-sidebar";
import ProfileSidebar from "@/components/sidebar/profile-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
        <AppSidebar enableEditing={false} />
        <SidebarInset className="border-none! ring-0 shadow-slate-200!">
          <header className="flex shrink-0 items-center gap-2 px-2 pt-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="" />
            </div>
          </header>
          <div className="flex flex-1 flex-col p-0">{children}</div>
        </SidebarInset>
        <ProfileSidebar side="right" width="20rem" />
      </SidebarProvider>
    </AuthSessionProvider>
  );
}
