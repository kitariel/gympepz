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
import {
  Play,
  Sparkles,
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  Calendar,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { WorkoutRestWarning } from "@/components/workout-rest-warning";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfileSidebar } from "@/components/sidebar/profile-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const routeLabels: Record<string, string> = {
  "/portal": "Dashboard",
  "/portal/log": "Workout Logs",
  "/portal/exercises": "Exercises",
  "/portal/plans": "Plans",
  "/portal/ai-planner": "AI Planner",
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
        if (href.includes("/plans/")) return { label: "Plan Details", href };
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
  const activePlan = api.plan.listByUser.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const activePlanData = activePlan.data?.find((p) => p.isActive);

  const activeWorkout = api.workoutLog.getActiveWorkout.useQuery(
    { userId },
    { enabled: !!userId },
  );

  const recentWorkoutCheck = api.workoutLog.checkRecentWorkout.useQuery(
    { userId, hoursBack: 6 },
    { enabled: !!userId },
  );

  // Get today's workout to check if it has exercises
  // Match quick-actions behavior: enable when userId and activePlanId exist
  // Pass day based on local timezone to avoid UTC timezone issues
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;
  const localDayName = dayNames[new Date().getDay()]!;

  const todaysWorkout = api.plan.getTodaysWorkout.useQuery(
    { userId, day: localDayName },
    {
      enabled: !!userId && !!activePlanData?.id,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  );

  console.log(
    "todaysWorkout.datatodaysWorkout.datatodaysWorkout.data",
    todaysWorkout.data,
  );

  const utils = api.useUtils();
  const toggleRestDay = api.plan.toggleRestDay.useMutation({
    onSuccess: () => {
      // Invalidate getTodaysWorkout query to ensure UI updates
      if (userId) {
        void utils.plan.getTodaysWorkout.invalidate({ userId });
      }
    },
  });

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);

  const quickStart = api.workoutLog.quickStart.useMutation({
    onSuccess: (log) => router.push(`/portal/log/workout/${log.id}`),
  });

  const handleQuickStart = () => {
    if (!userId) {
      router.push("/portal/log");
      return;
    }

    if (!activePlanData) {
      router.push("/portal/log");
      return;
    }

    // Check if there's already an active workout - redirect to it (match quick-actions behavior)
    if (activeWorkout.data && !activeWorkout.data.completed) {
      router.push(`/portal/log/workout/${activeWorkout.data.id}`);
      return;
    }

    const todayWorkout = todaysWorkout.data?.todayWorkout;
    const isRestDay = todayWorkout?.isRestDay ?? false;
    const hasExercises =
      todayWorkout?.exercises && todayWorkout.exercises.length > 0;

    // Priority: 1. Rest Day (if marked as rest day, show dialog), 2. Exercises, 3. No workout
    if (isRestDay) {
      // It's a rest day - show dialog
      setShowRestDayDialog(true);
      return;
    }

    // If there are exercises, allow starting
    if (hasExercises) {
      // Check if there's a recent completed workout
      if (recentWorkoutCheck.data?.hasRecentWorkout) {
        setShowWarningDialog(true);
        return;
      }
      quickStart.mutate({ userId });
      return;
    }

    // No exercises and not a rest day - show dialog
    if (todayWorkout) {
      setShowRestDayDialog(true);
      return;
    }

    // No workout scheduled - proceed anyway (match quick-actions behavior)
    quickStart.mutate({ userId });
  };

  const handleRestDayChoice = async (action: "skip" | "add" | "mark") => {
    setShowRestDayDialog(false);

    if (action === "skip") {
      // User confirms it's a rest day - just close
      return;
    } else if (action === "mark") {
      // User wants to mark today as rest day
      if (todaysWorkout.data?.todayWorkout?.id) {
        await toggleRestDay.mutateAsync({
          id: todaysWorkout.data.todayWorkout.id,
        });
        // Query will be invalidated automatically by the mutation's onSuccess
      }
      return;
    } else {
      // User wants to add exercises - redirect to plan editor
      if (activePlanData) {
        router.push(`/portal/plans/${activePlanData.id}`);
      }
    }
  };

  const handleConfirmStart = () => {
    setShowWarningDialog(false);
    if (activePlanData && userId) {
      quickStart.mutate({ userId });
    } else {
      router.push("/portal/log");
    }
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
        {/* Quick Start Workout Button */}
        {activePlanData &&
          (() => {
            const todayWorkout = todaysWorkout.data?.todayWorkout;
            const exercises = todayWorkout?.exercises;
            const hasExercises = exercises && exercises.length > 0;

            // Check if planDay is marked as rest day (this is the primary check)
            const isRestDay = todayWorkout?.isRestDay ?? false;

            // Determine button text and icon
            // Priority: 1. Rest Day status (if marked as rest day, always show Rest Day), 2. Exercises, 3. No workout
            const getButtonContent = () => {
              if (quickStart.isPending) {
                return {
                  icon: <Play className="h-3.5 w-3.5 animate-spin" />,
                  text: "Starting...",
                };
              }

              // Priority 1: Check if planDay is marked as rest day (rest day takes priority over exercises)
              if (isRestDay) {
                return {
                  icon: <Calendar className="h-3.5 w-3.5" />,
                  text: "Rest Day",
                };
              }

              // Priority 2: Check if there are exercises
              if (hasExercises) {
                return {
                  icon: <Play className="h-3.5 w-3.5" />,
                  text: "Start Workout",
                };
              }

              // Priority 3: No exercises and not a rest day - show based on whether workout exists
              if (todayWorkout) {
                return {
                  icon: <Play className="h-3.5 w-3.5" />,
                  text: "No Exercises",
                };
              }

              // No workout scheduled
              return {
                icon: <Play className="h-3.5 w-3.5" />,
                text: "Start Workout",
              };
            };

            const buttonContent = getButtonContent();

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

        {/* AI Planner Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/portal/ai-planner")}
          className="h-8 w-8 p-0"
          title="AI Planner"
        >
          <Sparkles className="h-4 w-4" />
        </Button>

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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rest Day / No Exercises Dialog */}
      <Dialog open={showRestDayDialog} onOpenChange={setShowRestDayDialog}>
        <DialogContent>
          <DialogHeader>
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <>
                <DialogTitle>It&apos;s Your Rest Day Today</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data.todayWorkout.title
                    ? `Today is scheduled as a rest day for "${todaysWorkout.data.todayWorkout.title}". Take time to recover and let your muscles heal.`
                    : "Today is scheduled as a rest day. Take time to recover and let your muscles heal."}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>No Exercises for Today&apos;s Workout</DialogTitle>
                <DialogDescription className="pt-2">
                  {todaysWorkout.data?.todayWorkout?.title
                    ? `Today's workout "${todaysWorkout.data.todayWorkout.title}" doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?`
                    : "Today's workout doesn't have any exercises yet. Is this a rest day, or would you like to add exercises?"}
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          <DialogFooter className="mt-4 flex-col gap-2">
            {todaysWorkout.data?.todayWorkout?.isRestDay ? (
              <Button
                variant="default"
                onClick={() => handleRestDayChoice("skip")}
                className="w-full"
              >
                Got It
              </Button>
            ) : (
              <>
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => handleRestDayChoice("skip")}
                    className="flex-1"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={() => handleRestDayChoice("add")}
                    className="flex-1"
                  >
                    Add Exercises
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRestDayChoice("mark")}
                  className="w-full"
                >
                  Mark Today as Rest Day
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
