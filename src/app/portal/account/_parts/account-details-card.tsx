"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Calendar, Shield, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

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
    <Card className="border-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-teal-600" />
          Account Details
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Identity and account state
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Account ID</div>
            <div className="text-xs font-medium font-mono truncate">{user?.id}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Status</div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
              {accountStatus}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Member since</div>
            <div className="text-xs font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {user?.createdAt
                ? format(new Date(user.createdAt), "MMM d, yyyy")
                : "Not available"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Email</div>
            <div className="text-xs font-medium flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Email verified</div>
            <div className="text-xs font-medium flex items-center gap-1">
              {user?.emailVerified ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  {format(new Date(user.emailVerified), "MMM d, yyyy")}
                </>
              ) : (
                <span className="text-muted-foreground">Not verified</span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Role</div>
            <div className="text-xs font-medium flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Member
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
