"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Dumbbell,
  History,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import {
  getDayNumberForToday,
  getEffectivePlanDay,
  getWorkoutSessionState,
  isWorkoutCompletedTodayForDay,
} from "@/features/train/domain/workoutSessionState";
import { TrainMoreMenu } from "./TrainMoreMenu";
import { ContextSwitchIndicator } from "./ContextSwitchIndicator";

type TrainNavTabVM = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isMore?: boolean;
};

interface TrainNavContentProps {
  basePath: string; // "/portal/train" or "/train"
  showContextSwitch?: boolean;
  portalBasePath?: string;
}

function isTrainNavActive(
  pathname: string,
  href: string,
  basePath: string,
): boolean {
  // Handle base path (home)
  if (href === basePath || href === `${basePath}/`) {
    return (
      pathname === basePath ||
      pathname === `${basePath}/` ||
      pathname === `${basePath}/overview`
    );
  }
  // Handle other routes
  return pathname === href || pathname.startsWith(href + "/");
}

export function TrainNavContent({
  basePath,
  showContextSwitch = false,
  portalBasePath = "/portal",
}: TrainNavContentProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

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

  // Build tabs with basePath
  const tabs: TrainNavTabVM[] = [
    {
      href: basePath,
      label: "Home",
      icon: Dumbbell,
      isActive:
        isTrainNavActive(pathname, basePath, basePath) &&
        !isTrainNavActive(pathname, `${basePath}/log`, basePath) &&
        !isTrainNavActive(pathname, `${basePath}/history`, basePath) &&
        !isTrainNavActive(pathname, `${basePath}/templates`, basePath) &&
        !isTrainNavActive(pathname, `${basePath}/plans`, basePath) &&
        !isTrainNavActive(pathname, `${basePath}/build`, basePath),
    },
    {
      href: `${basePath}/log`,
      label: logLabel,
      icon: logIcon,
      isActive: isTrainNavActive(pathname, `${basePath}/log`, basePath),
    },
    {
      href: `${basePath}/history`,
      label: "History",
      icon: History,
      isActive: isTrainNavActive(pathname, `${basePath}/history`, basePath),
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
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <div className="flex items-center justify-around flex-1">
          {tabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.isMore) {
            return (
              <button
                key="more"
                onClick={() => setMoreOpen(true)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95",
                  "text-muted-foreground hover:text-foreground",
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
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5 transition-all duration-200",
                  tab.isActive && "bg-primary/10 shadow-sm shadow-primary/20",
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    tab.isActive && "scale-110",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight transition-all",
                  tab.isActive && "font-semibold",
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
        {showContextSwitch && (
          <ContextSwitchIndicator
            currentContext="train"
            portalBasePath={portalBasePath}
            trainBasePath={basePath}
          />
        )}
      </div>
      <TrainMoreMenu
        open={moreOpen}
        onOpenChange={setMoreOpen}
        basePath={basePath}
      />
    </>
  );
}
