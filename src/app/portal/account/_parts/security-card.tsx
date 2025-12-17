"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { Lock, Shield, Monitor, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type AccountUser = {
  hasPassword?: boolean;
};

export function SecurityCard({
  userId,
  user,
}: {
  userId: string;
  user: AccountUser | null;
}) {
  const sessionsQuery = api.user.listSessions.useQuery(
    { userId },
    { enabled: !!userId },
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-teal-600" />
          Security
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Password and sign-in settings
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs font-medium">Password</div>
              <div className="text-[10px] text-muted-foreground">
                {user?.hasPassword ? "Password set" : "No password set yet"}
              </div>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
            Change
          </Button>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs font-medium">Two-factor authentication</div>
              <div className="text-[10px] text-muted-foreground">Not available yet</div>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-8 text-xs" disabled>
            Configure
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs font-medium">
              Active Sessions ({Array.isArray(sessionsQuery.data) ? sessionsQuery.data.length : 0})
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border/50">
            <div className="bg-muted/50 grid grid-cols-2 px-2.5 py-2 text-[10px] font-medium">
              <div>Session ID</div>
              <div>Expires</div>
            </div>
            <div className="divide-y">
              {(Array.isArray(sessionsQuery.data) ? sessionsQuery.data : []).map((s) => (
                <div key={s.id} className="grid grid-cols-2 px-2.5 py-2 text-[10px]">
                  <div className="truncate font-mono">{s.id.slice(0, 12)}...</div>
                  <div>{format(new Date(s.expires), "MMM d, yyyy")}</div>
                </div>
              ))}
              {Array.isArray(sessionsQuery.data) && sessionsQuery.data.length === 0 && (
                <div className="text-muted-foreground px-2.5 py-2 text-[10px] text-center">
                  No sessions found
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
