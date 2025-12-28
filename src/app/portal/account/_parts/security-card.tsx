"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { Lock, Shield, Monitor, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

type AccountUser = {
  hasPassword?: boolean;
  email?: string;
};

export function SecurityCard({
  userId,
  user,
}: {
  userId: string;
  user: AccountUser | null;
}) {
  const { data: session } = useSession();
  const sessionsQuery = api.user.listSessions.useQuery(
    { userId },
    { enabled: !!userId },
  );

  // Password change dialog state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Change password mutation
  const changePassword = api.user.changePassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setSuccess(false);
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
      setSuccess(false);
    },
  });

  const handleChangePassword = async () => {
    setError("");
    setSuccess(false);

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const email = user?.email ?? session?.user?.email;
    if (!email) {
      setError("Email not found");
      return;
    }

    try {
      await changePassword.mutateAsync({
        email,
        currentPassword,
        newPassword,
      });
    } catch (err) {
      // Error is handled by onError callback
      console.error("Password change error:", err);
    }
  };

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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setIsChangePasswordOpen(true)}
            disabled={!user?.hasPassword}
          >
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

        {/* Change Password Dialog */}
        <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Update your account password. Make sure it&apos;s at least 8 characters long.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {error && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  Password changed successfully!
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-xs">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-9 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-9"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-9"
                  onClick={handleChangePassword}
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    changePassword.isPending
                  }
                >
                  {changePassword.isPending ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
