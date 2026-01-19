"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell,
  History,
  LayoutDashboard,
  Moon,
  Pause,
  Play,
  Table2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
};

function isTrainNavActive(pathname: string, href: string): boolean {
  if (href === "/train") return pathname === "/train";
  return pathname === href || pathname.startsWith(href + "/");
}

function TrainBottomNavMobileView({ tabs }: { tabs: TrainBottomNavTabVM[] }) {
  return (
    <nav className="border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-screen-xl items-center justify-around px-2 py-2.5 pb-[calc(env(safe-area-inset-bottom)+10px)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95",
                tab.isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
                  tab.isActive &&
                    "bg-emerald-500/10 shadow-sm shadow-emerald-500/20",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    tab.isActive && "scale-110",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight font-medium transition-all",
                  tab.isActive && "font-semibold",
                )}
              >
                {tab.label}
              </span>
              {tab.isActive ? (
                <div className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TrainBottomNavDockView({ tabs }: { tabs: TrainBottomNavTabVM[] }) {
  return (
    <TooltipProvider>
      <nav className="border-border/50 bg-background/70 supports-[backdrop-filter]:bg-background/50 fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] left-1/2 z-50 hidden -translate-x-1/2 rounded-full border p-2 shadow-lg backdrop-blur md:block">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tooltip key={tab.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={tab.href}
                    className={cn(
                      "group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-95",
                      tab.isActive
                        ? "bg-emerald-500/12 text-emerald-600 shadow-sm shadow-emerald-500/20 dark:text-emerald-400"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        tab.isActive && "scale-110",
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

export function TrainBottomNav() {
  const pathname = usePathname();
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
      (effectiveDay ? effectiveDay.items.length === 0 : false),
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

  const tabs: TrainBottomNavTabVM[] = [
    {
      href: "/train",
      label: "Train",
      icon: Dumbbell,
      isActive: isTrainNavActive(pathname, "/train"),
    },
    {
      href: "/train/overview",
      label: "Overview",
      icon: LayoutDashboard,
      isActive: isTrainNavActive(pathname, "/train/overview"),
    },
    {
      href: "/train/log",
      label: logLabel,
      icon: logIcon,
      isActive: isTrainNavActive(pathname, "/train/log"),
    },
    {
      href: "/train/plans",
      label: "Plans",
      icon: Table2,
      isActive: isTrainNavActive(pathname, "/train/plans"),
    },
    {
      href: "/train/history",
      label: "History",
      icon: History,
      isActive: isTrainNavActive(pathname, "/train/history"),
    },
  ];

  return (
    <>
      <TrainBottomNavMobileView tabs={tabs} />
      <TrainBottomNavDockView tabs={tabs} />
    </>
  );
}
