"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = React.ComponentProps<typeof Sidebar>;

export default function ProfileSidebar(props: Props) {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const email = session?.user?.email ?? "";
  type AccountUser = {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  const userQuery = api.user.getByEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const user = userQuery.data as AccountUser | null;
  const plansQuery = api.plan.listByUser.useQuery(
    { userId },
    { enabled: !!userId },
  );

  const name = user?.name ?? session?.user?.name ?? "Member";
  const image = user?.image ?? session?.user?.image ?? undefined;
  const memberSince = "—";
  const totalPlans = Array.isArray(plansQuery.data)
    ? plansQuery.data.length
    : 0;
  const totalDays = Array.isArray(plansQuery.data)
    ? plansQuery.data.reduce(
        (acc, p) => acc + ((p as { daysCount?: number }).daysCount ?? 0),
        0,
      )
    : 0;

  const notifications: Array<{
    id: string;
    title: string;
    body: string;
    ago: string;
    action: string;
  }> = [];

  return (
    <Sidebar side="right" variant="inset" collapsible="offcanvas" {...props}>
      <SidebarHeader />
      <SidebarContent className="p-2">
        <Card className="overflow-hidden bg-neutral-900 text-neutral-100">
          <div className="h-28 w-full bg-linear-to-r from-neutral-800 to-neutral-700" />
          <CardHeader className="-mt-10">
            <div className="flex items-center gap-3">
              <Avatar className="size-16 ring-2 ring-neutral-800">
                <AvatarImage src={image ?? undefined} alt={name ?? "Member"} />
                <AvatarFallback>
                  {(name ?? "M").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{name}</CardTitle>
                <CardDescription>Member since {memberSince}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-neutral-300">Bio</div>
            <div className="text-sm text-neutral-200">
              Fitness enthusiast focusing on strength and overall health.
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Card className="bg-neutral-800 p-3 text-center">
                <div className="text-xs text-neutral-400">Plans</div>
                <div className="text-lg font-semibold">{totalPlans}</div>
              </Card>
              <Card className="bg-neutral-800 p-3 text-center">
                <div className="text-xs text-neutral-400">Days</div>
                <div className="text-lg font-semibold">{totalDays}</div>
              </Card>
              <Card className="bg-neutral-800 p-3 text-center">
                <div className="text-xs text-neutral-400">Followers</div>
                <div className="text-lg font-semibold">1.2k</div>
              </Card>
            </div>
            <div className="pt-2">
              <Button type="button" className="w-full">
                Create Post
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-3 bg-neutral-900 text-neutral-100">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <Alert>
                <AlertTitle>No notifications</AlertTitle>
                <AlertDescription>You’re all caught up.</AlertDescription>
              </Alert>
            ) : (
              notifications.map((n) => (
                <Card key={n.id} className="bg-neutral-800 p-3">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <div>{n.title}</div>
                    <div>{n.ago}</div>
                  </div>
                  <div className="mt-1 text-sm text-neutral-200">{n.body}</div>
                  <div className="mt-2">
                    <Button type="button" variant="outline" size="sm">
                      {n.action}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </SidebarContent>
    </Sidebar>
  );
}
