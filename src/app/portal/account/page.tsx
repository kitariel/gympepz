import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthSessionProvider } from "@/components/auth/session-provider";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import AccountForm from "./parts/account-form";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <AuthSessionProvider session={session}>
      <SidebarProvider>
        <AppSidebar enableEditing={false} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-lg font-semibold">Account</h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
              <div className="p-6">
                <AccountForm />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthSessionProvider>
  );
}