"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Bell, Settings, User, LogOut, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";
import { useProfileSidebar } from "@/components/sidebar/profile-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

const routeLabels: Record<string, string> = {
  "/portal": "Dashboard",
  "/portal/exercises": "Exercises",
  "/portal/workout-builder": "Workout Builder",
  "/portal/account": "Account",
};

export function PortalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const { setOpen: setProfileSidebarOpen } = useProfileSidebar();

  const email = session?.user?.email ?? "";
  const userQuery = api.user.getByEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const user = userQuery.data as {
    name?: string | null;
    image?: string | null;
  } | null;

  const name =
    user?.name ?? session?.user?.name ?? session?.user?.email ?? "Guest";
  const avatarSrc = user?.image ?? session?.user?.image ?? undefined;
  const isGuest = !session?.user;

  const initials = useMemo(() => {
    if (!name && !email) return "?";
    const display = (name || email || "").toString();
    const parts = display.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }, [name, email]);

  const breadcrumbs = useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");

      // Check route labels first
      if (routeLabels[href]) {
        return { label: routeLabels[href], href };
      }

      // Handle dynamic routes (UUIDs)
      const isDynamicRoute = /^[a-z0-9-]{20,}$/.test(path);
      if (isDynamicRoute) {
        if (href.includes("/workout/")) return { label: "Workout", href };
        if (href.includes("/log/")) return { label: "Log Details", href };
        return { label: "Details", href };
      }

      // Format path as label
      const label =
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      return { label, href };
    });
  }, [pathname]);

  const userId = session?.user?.id ?? "";
  const activeWorkout = api.workoutLog.getActiveWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );

  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  const [showWarningDialog, setShowWarningDialog] = useState(false);

  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: () => router.push("/portal/train/log"),
  });

  const handleQuickStart = () => {
    if (!userId) {
      router.push("/portal/train");
      return;
    }

    // Check if there's already an active workout - redirect to it (match quick-actions behavior)
    if (activeWorkout.data && !activeWorkout.data.completed) {
      router.push("/portal/train/log");
      return;
    }

    if (recentWorkoutCheck.data?.hasRecentWorkout) {
      setShowWarningDialog(true);
      return;
    }
    quickStart.mutate({ userId });
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    quickStart.mutate({ userId });
  };
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 rounded-t-xl border-b px-4 backdrop-blur">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="h-8 w-8" />

      {/* Breadcrumbs - Desktop */}
      <Breadcrumb className="hidden flex-1 md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/portal" className="flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5" />
                <span className="text-xs">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className="flex items-center">
                <BreadcrumbSeparator className="mx-2" />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="text-xs font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href} className="text-xs">
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title - Mobile */}
      <div className="flex-1 md:hidden">
        <h1 className="truncate text-sm font-semibold">
          {breadcrumbs.length > 0
            ? breadcrumbs[breadcrumbs.length - 1]?.label
            : "Dashboard"}
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="ml-auto flex items-center gap-2">
        {isGuest ? (
          <Badge variant="secondary" className="hidden sm:inline text-[10px]">
            Guest mode
          </Badge>
        ) : null}
        {/* Quick Start Workout Button */}
        {!isGuest &&
          (() => {
            const hasActiveWorkout =
              activeWorkout.data && !activeWorkout.data.completed;
            const buttonContent = quickStart.isPending
              ? { icon: <Play className="h-3.5 w-3.5 animate-spin" />, text: "Starting..." }
              : hasActiveWorkout
                ? { icon: <Play className="h-3.5 w-3.5" />, text: "Resume workout" }
                : { icon: <Play className="h-3.5 w-3.5" />, text: "Start workout" };

            return (
              <Button
                size="sm"
                onClick={handleQuickStart}
                disabled={quickStart.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 gap-1.5 text-xs"
              >
                {buttonContent.icon}
                <span className="hidden sm:inline">{buttonContent.text}</span>
              </Button>
            );
          })()}

        {/* Profile Sidebar Button - Mobile/Tablet */}
        {isMobile && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Profile & Stats"
            onClick={() => setProfileSidebarOpen(true)}
          >
            <User className="h-4 w-4" />
          </Button>
        )}

        {/* Notifications */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          title="Notifications"
          disabled
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarSrc} alt={name || "User avatar"} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarSrc} alt={name || "User avatar"} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="truncate text-sm font-medium">{name}</span>
                  {email && (
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isGuest ? (
              <DropdownMenuItem asChild>
                <Link href="/login" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Save your progress
                </Link>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/portal/account" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/portal/account" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void signOut()}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rest Warning Dialog */}
      <WorkoutRestWarning
        open={showWarningDialog}
        onOpenChange={setShowWarningDialog}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowWarningDialog(false)}
        recentWorkout={recentWorkoutCheck.data?.workout ?? null}
      />
    </header>
  );
}
