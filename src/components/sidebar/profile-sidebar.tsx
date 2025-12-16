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
import { Dumbbell, X } from "lucide-react";

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

  // Calculate streak
  const currentStreak = Math.min(totalDays, 5);

  return (
    <Sidebar
      className="p-0"
      side="right"
      variant="inset"
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader />
      <SidebarContent className="m-0 p-0">
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-teal-500 to-teal-600 p-2">
            <div className="flex items-center gap-3">
              <Avatar className="size-16 ring-4 ring-white/20">
                <AvatarImage src={image ?? undefined} alt={name ?? "Member"} />
                <AvatarFallback className="bg-teal-700 text-white">
                  {(name ?? "M").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg text-white">{name}</CardTitle>
                <CardDescription className="text-teal-50">
                  Member since {memberSince}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-foreground text-2xl font-bold">
                  {totalPlans}
                </div>
                <div className="text-muted-foreground text-xs">Total Plans</div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-foreground text-2xl font-bold">
                  {totalDays}
                </div>
                <div className="text-muted-foreground text-xs">Days</div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <div className="text-foreground text-2xl font-bold">1.2k</div>
                <div className="text-muted-foreground text-xs">Followers</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <div className="mb-2 inline-flex items-center justify-center rounded-full bg-teal-100 p-4">
                  <div className="relative">
                    <svg
                      className="h-12 w-12"
                      viewBox="0 0 100 100"
                      fill="none"
                    >
                      <path
                        d="M50 10 C60 20, 70 25, 75 35 C80 45, 78 55, 70 65 C62 75, 50 80, 50 90 C50 80, 38 75, 30 65 C22 55, 20 45, 25 35 C30 25, 40 20, 50 10 Z"
                        fill="#0d9488"
                        className="drop-shadow-md"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                      {currentStreak}
                    </div>
                  </div>
                </div>
                <div className="text-foreground text-sm font-semibold">
                  day streak this week!
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {(
                  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
                ).map((label, idx) => {
                  const isCompleted = idx < currentStreak;
                  const isMissed = idx === 0 && currentStreak === 0;

                  return (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="text-muted-foreground text-[10px] font-medium">
                        {label}
                      </div>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                          isCompleted
                            ? "bg-teal-500 shadow-md"
                            : isMissed
                              ? "bg-red-500"
                              : "bg-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <Dumbbell
                            className="h-4 w-4 text-white"
                            strokeWidth={3}
                          />
                        ) : isMissed ? (
                          <X className="h-4 w-4 text-white" strokeWidth={3} />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              className="w-full rounded-full font-semibold shadow-md"
            >
              Create Post +
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-4 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto p-0 text-xs"
                >
                  See All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-secondary/50 rounded-lg p-4 text-center">
                <div className="text-foreground text-sm font-medium">
                  No notifications
                </div>
                <div className="text-muted-foreground text-xs">
                  You&apos;re all caught up!
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-foreground text-sm font-medium">
                        {n.title}
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-xs">
                        {n.body}
                      </div>
                    </div>
                    <div className="text-muted-foreground text-xs">{n.ago}</div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 w-full text-xs"
                  >
                    {n.action}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </SidebarContent>
    </Sidebar>
  );
}
