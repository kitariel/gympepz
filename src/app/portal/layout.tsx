import { AppSidebar } from "@/components/sidebar/app-sidebar";
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
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthSessionProvider>
  );
}
