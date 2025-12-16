"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AccountUser = {
  id: string;
  email: string;
  emailVerified?: Date | null;
  status?: string | null;
  createdAt?: Date | null;
};

export function AccountDetailsCard({
  user,
  email,
}: {
  user: AccountUser | null;
  email: string;
}) {
  const accountStatus = user?.status ?? "active";

  return (
    <Card className="bg-card text-card-foreground from-primary to-primary/80 rounded-xl border border-none shadow-sm">
      <CardHeader className="border-b py-4">
        <div>
          <div className="text-sm font-semibold">Account details</div>
          <div className="text-muted-foreground text-xs">
            Identity and account state
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-card-foreground rounded-b-xl pb-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-muted-foreground text-xs">Account ID</div>
            <div className="text-sm font-medium">{user?.id}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Status</div>
            <div className="text-sm font-medium capitalize">
              {accountStatus}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Member since</div>
            <div className="text-sm font-medium">
              {user?.createdAt
                ? user.createdAt.toLocaleDateString()
                : "Not available"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Email</div>
            <div className="text-sm font-medium">{email}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Email verified</div>
            <div className="text-sm font-medium">
              {user?.emailVerified
                ? user.emailVerified.toLocaleDateString()
                : "Not verified"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Role</div>
            <div className="text-sm font-medium">Member</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
