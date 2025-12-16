import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import AccountForm from "./_parts/account-form";
import { api, HydrateClient } from "@/trpc/server";

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const email = session.user?.email ?? "";
  const user = email ? await api.user.getByEmail({ email }) : null;

  return (
    <HydrateClient>
      <div className="flex flex-1 flex-col gap-4 p-2">
        <AccountForm
          initialUser={user}
          email={email}
          userId={session.user.id}
        />
      </div>
    </HydrateClient>
  );
}
