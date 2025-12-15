"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

type AccountUser = {
  hasPassword?: boolean;
};

export function SecurityCard({ userId, user }: { userId: string; user: AccountUser | null }) {
  const sessionsQuery = api.user.listSessions.useQuery(
    { userId },
    { enabled: !!userId },
  );

  return (
    <Card className="bg-card text-card-foreground rounded-xl border shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <div className="text-sm font-semibold">Security</div>
          <div className="text-muted-foreground text-xs">Password and sign-in settings</div>
        </div>
      </div>
      <div className="space-y-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Password</div>
            <div className="text-muted-foreground text-xs">
              {user?.hasPassword ? "Password set" : "No password set yet"}
            </div>
          </div>
          <Button type="button" variant="outline" size="sm">Change password</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Two-factor authentication</div>
            <div className="text-muted-foreground text-xs">Not available yet</div>
          </div>
          <Button type="button" variant="outline" size="sm" disabled>Configure</Button>
        </div>
        <div>
          <div className="text-sm font-medium">Sessions</div>
          <div className="text-muted-foreground text-xs">
            {Array.isArray(sessionsQuery.data)
              ? `${sessionsQuery.data.length} active session${sessionsQuery.data.length === 1 ? "" : "s"}`
              : "Loading..."}
          </div>
          <div className="mt-3 overflow-hidden rounded-md border">
            <div className="grid grid-cols-2 bg-muted/50 px-3 py-2 text-xs font-medium">
              <div>ID</div>
              <div>Expires</div>
            </div>
            <div className="divide-y">
              {(Array.isArray(sessionsQuery.data) ? sessionsQuery.data : []).map((s) => (
                <div key={s.id} className="grid grid-cols-2 px-3 py-2 text-xs">
                  <div className="truncate">{s.id}</div>
                  <div>{new Date(s.expires).toLocaleString()}</div>
                </div>
              ))}
              {Array.isArray(sessionsQuery.data) && sessionsQuery.data.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">No sessions found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

