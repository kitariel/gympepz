"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ChevronRight,
  Dumbbell,
  FolderOpen,
  History,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { useRouteContext } from "@/hooks/useRouteContext";
import { trainPath } from "@/lib/routes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  getDayNumberForToday,
  getEffectivePlanDay,
  getWorkoutSessionState,
  isWorkoutCompletedTodayForDay,
} from "@/features/train/domain/workoutSessionState";

type TrainBottomNavTabVM = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isMore?: boolean;
};

function isTrainNavActive(pathname: string, href: string): boolean {
  if (href === "/train") return pathname === "/train" || pathname === "/train/overview";
  return pathname === href || pathname.startsWith(href + "/");
}

function TrainBottomNavMobileView({
  tabs,
  onMoreClick,
}: {
  tabs: TrainBottomNavTabVM[];
  onMoreClick: () => void;
}) {
  return (
    <nav className="border-border/50 bg-background/95 supports-backdrop-filter:bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-screen-xl items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.isMore) {
            return (
              <button
                key="more"
                onClick={onMoreClick}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95",
                  "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-center rounded-lg p-1.5">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium leading-tight">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95",
                tab.isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5 transition-all duration-200",
                  tab.isActive && "bg-primary/10 shadow-sm shadow-primary/20"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    tab.isActive && "scale-110"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight transition-all",
                  tab.isActive && "font-semibold"
                )}
              >
                {tab.label}
              </span>
              {tab.isActive ? (
                <div className="absolute top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TrainBottomNavDockView({
  tabs,
  onMoreClick,
}: {
  tabs: TrainBottomNavTabVM[];
  onMoreClick: () => void;
}) {
  return (
    <TooltipProvider>
      <nav className="border-border/50 bg-background/70 supports-backdrop-filter:bg-background/50 fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] left-1/2 z-50 hidden -translate-x-1/2 rounded-full border p-2 shadow-lg backdrop-blur md:block">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            if (tab.isMore) {
              return (
                <Tooltip key="more">
                  <TooltipTrigger asChild>
                    <button
                      onClick={onMoreClick}
                      className={cn(
                        "group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-95",
                        "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 transition-transform duration-200" />
                      <span className="sr-only">{tab.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={10}>
                    {tab.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Tooltip key={tab.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={tab.href}
                    className={cn(
                      "group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-95",
                      tab.isActive
                        ? "bg-primary/12 text-primary shadow-sm shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        tab.isActive && "scale-110"
                      )}
                    />
                    <span className="sr-only">{tab.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={10}>
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}

function MoreMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const routeContext = useRouteContext();

  const menuItems = [
    {
      href: trainPath(routeContext, "overview"),
      label: "Program overview",
      description: "View your weekly plan",
      icon: Dumbbell,
    },
    {
      href: trainPath(routeContext, "templates"),
      label: "Browse templates",
      description: "Find a starter program",
      icon: Sparkles,
    },
    {
      href: trainPath(routeContext, "plans"),
      label: "My saved plans",
      description: "View your custom programs",
      icon: FolderOpen,
    },
    {
      href: trainPath(routeContext, "build"),
      label: "Create program",
      description: "Build a custom plan",
      icon: Dumbbell,
    },
    {
      href: "/portal/goals",
      label: "Goals",
      description: "Track strength & progress",
      icon: Target,
    },
  ];

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="More">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => {
              onOpenChange(false);
              router.push(item.href);
            }}
            className="hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
          >
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <item.icon className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-muted-foreground text-xs">{item.description}</p>
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

export function TrainBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const routeContext = useRouteContext();

  const {
    activeProgram,
    currentProgramRef,
    hydrated: programHydrated,
  } = useActiveProgram();
  const { selectedWorkoutDay, hydrated: prefsHydrated } = useTrainPrefs();
  const { draft, hydrated: draftHydrated, history } = useWorkoutDraft();

  const hydrated = programHydrated && prefsHydrated && draftHydrated;
  const hasDraft = hydrated && Boolean(draft);

  const today = getDayNumberForToday();
  const effectiveDay =
    hydrated && activeProgram
      ? getEffectivePlanDay({
          days: activeProgram.plan.days,
          selectedWorkoutDay,
          today,
        })
      : null;
  const isRestDay = Boolean(
    effectiveDay?.isRestDay ??
      (effectiveDay ? effectiveDay.items.length === 0 : false)
  );
  const programId =
    hydrated && activeProgram
      ? (currentProgramRef?.id ?? activeProgram.templateId)
      : null;
  const isCompletedToday =
    hydrated &&
    programId != null &&
    effectiveDay?.day != null &&
    !isRestDay &&
    isWorkoutCompletedTodayForDay({
      history,
      programId,
      dayIndex: effectiveDay.day,
    });

  const sessionState = getWorkoutSessionState({
    hasDraft,
    isRestDay,
    isCompletedToday,
  });

  const logLabel =
    sessionState === "active"
      ? "Resume"
      : sessionState === "idle"
        ? "Log"
        : "Rest";
  const logIcon =
    sessionState === "active" ? Pause : sessionState === "idle" ? Play : Moon;

  const basePath = trainPath(routeContext);

  // Simplified to 5 tabs: Home, Log, Activity, History, More
  const tabs: TrainBottomNavTabVM[] = [
    {
      href: basePath,
      label: "Train",
      icon: Dumbbell,
      isActive:
        isTrainNavActive(pathname, basePath) &&
        !isTrainNavActive(pathname, trainPath(routeContext, "log")) &&
        !isTrainNavActive(pathname, trainPath(routeContext, "activity")) &&
        !isTrainNavActive(pathname, trainPath(routeContext, "history")) &&
        !isTrainNavActive(pathname, trainPath(routeContext, "templates")) &&
        !isTrainNavActive(pathname, trainPath(routeContext, "plans")) &&
        !isTrainNavActive(pathname, trainPath(routeContext, "build")),
    },
    {
      href: trainPath(routeContext, "log"),
      label: logLabel,
      icon: logIcon,
      isActive: isTrainNavActive(pathname, trainPath(routeContext, "log")),
    },
    {
      href: trainPath(routeContext, "activity"),
      label: "Activity",
      icon: Activity,
      isActive: isTrainNavActive(pathname, trainPath(routeContext, "activity")),
    },
    {
      href: trainPath(routeContext, "history"),
      label: "History",
      icon: History,
      isActive: isTrainNavActive(pathname, trainPath(routeContext, "history")),
    },
    {
      href: "#more",
      label: "More",
      icon: MoreHorizontal,
      isActive: false,
      isMore: true,
    },
  ];

  return (
    <>
      <TrainBottomNavMobileView tabs={tabs} onMoreClick={() => setMoreOpen(true)} />
      <TrainBottomNavDockView tabs={tabs} onMoreClick={() => setMoreOpen(true)} />
      <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
