"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  Target,
  Dumbbell,
  Activity,
  ChevronLeft,
  ChevronRight,
  History,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  FolderOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigationContext } from "@/hooks/useNavigationContext";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useTrainPrefs } from "@/hooks/useTrainPrefs";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import {
  getDayNumberForToday,
  getEffectivePlanDay,
  getWorkoutSessionState,
  isWorkoutCompletedTodayForDay,
} from "@/features/train/domain/workoutSessionState";
import { BottomSheet } from "@/components/ui/bottom-sheet";

// =============================================================================
// Types
// =============================================================================

type NavTab = {
  label: string;
  href?: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick?: () => void;
  isMore?: boolean;
  isContextSwitch?: boolean;
};

interface BottomNavigationProps {
  className?: string;
}

// =============================================================================
// Train More Menu
// =============================================================================

function TrainMoreMenu({
  open,
  onOpenChange,
  basePath,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePath: string;
}) {
  const router = useRouter();

  const menuItems = [
    {
      href: `${basePath}/overview`,
      label: "Program overview",
      description: "View your weekly plan",
      icon: Dumbbell,
    },
    {
      href: `${basePath}/templates`,
      label: "Browse templates",
      description: "Find a starter program",
      icon: Sparkles,
    },
    {
      href: `${basePath}/plans`,
      label: "My saved plans",
      description: "View your custom programs",
      icon: FolderOpen,
    },
    {
      href: `${basePath}/build`,
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
              <p className="text-muted-foreground text-xs">
                {item.description}
              </p>
            </div>
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

// =============================================================================
// Navigation Tab Helpers
// =============================================================================

function getPortalNavTabs(
  pathname: string,
  trainBasePath: string,
  onTrainClick: () => void
): NavTab[] {
  return [
    {
      label: "Goals",
      href: "/portal/goals",
      icon: Target,
      isActive:
        pathname === "/portal/goals" || pathname.startsWith("/portal/goals/"),
    },
    {
      label: "Exercises",
      href: "/portal/exercises",
      icon: Dumbbell,
      isActive:
        pathname === "/portal/exercises" ||
        pathname.startsWith("/portal/exercises/"),
    },
    {
      label: "Train",
      onClick: onTrainClick,
      icon: ChevronRight,
      isActive: false,
      isContextSwitch: true,
    },
  ];
}

function getTrainNavTabs(
  pathname: string,
  basePath: string,
  sessionState: "active" | "idle" | "rest" | "completed",
  onPortalClick: () => void
): NavTab[] {
  // Map session state to log button label and icon
  const logLabel =
    sessionState === "active"
      ? "Resume"
      : sessionState === "rest"
        ? "Rest"
        : "Log"; // idle or completed both show "Log"
  const logIcon =
    sessionState === "active"
      ? Pause
      : sessionState === "rest"
        ? Moon
        : Play; // idle or completed both show Play

  function isTrainNavActive(href: string): boolean {
    if (href === basePath || href === `${basePath}/`) {
      return (
        pathname === basePath ||
        pathname === `${basePath}/` ||
        pathname === `${basePath}/overview`
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return [
    {
      label: "Portal",
      onClick: onPortalClick,
      icon: ChevronLeft,
      isActive: false,
      isContextSwitch: true,
    },
    {
      label: "Train",
      href: basePath,
      icon: Dumbbell,
      isActive:
        isTrainNavActive(basePath) &&
        !isTrainNavActive(`${basePath}/log`) &&
        !isTrainNavActive(`${basePath}/activity`) &&
        !isTrainNavActive(`${basePath}/history`) &&
        !isTrainNavActive(`${basePath}/templates`) &&
        !isTrainNavActive(`${basePath}/plans`) &&
        !isTrainNavActive(`${basePath}/build`),
    },
    {
      label: logLabel,
      href: `${basePath}/log`,
      icon: logIcon,
      isActive: isTrainNavActive(`${basePath}/log`),
    },
    {
      label: "Activity",
      href: `${basePath}/activity`,
      icon: Activity,
      isActive: isTrainNavActive(`${basePath}/activity`),
    },
    {
      label: "History",
      href: `${basePath}/history`,
      icon: History,
      isActive: isTrainNavActive(`${basePath}/history`),
    },
    {
      label: "More",
      icon: MoreHorizontal,
      isActive: false,
      isMore: true,
    },
  ];
}

// =============================================================================
// Navigation Tab Item Component
// =============================================================================

function NavTabItem({
  tab,
  onMoreClick,
}: {
  tab: NavTab;
  onMoreClick?: () => void;
}) {
  const Icon = tab.icon;

  // More button
  if (tab.isMore) {
    return (
      <button
        onClick={onMoreClick}
        className="text-muted-foreground hover:text-foreground relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors active:scale-95"
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </button>
    );
  }

  // Context switch button (Train arrow in portal, Portal link in train)
  if (tab.isContextSwitch) {
    return (
      <button
        onClick={tab.onClick}
        className="text-muted-foreground hover:text-foreground relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors active:scale-95"
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </button>
    );
  }

  // Regular button (onClick handler)
  if (tab.onClick) {
    return (
      <button
        onClick={tab.onClick}
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors active:scale-95",
          tab.isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {tab.isActive && (
          <div className="bg-primary absolute top-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full" />
        )}
        <div
          className={cn(
            "flex items-center justify-center rounded-lg p-1 transition-all",
            tab.isActive && "bg-primary/10"
          )}
        >
          <Icon className={cn("h-5 w-5", tab.isActive && "scale-110")} />
        </div>
        <span
          className={cn(
            "text-[10px] font-medium",
            tab.isActive && "font-semibold"
          )}
        >
          {tab.label}
        </span>
      </button>
    );
  }

  // Link navigation item
  return (
    <Link
      href={tab.href!}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors active:scale-95",
        tab.isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {tab.isActive && (
        <div className="bg-primary absolute top-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full" />
      )}
      <div
        className={cn(
          "flex items-center justify-center rounded-lg p-1 transition-all",
          tab.isActive && "bg-primary/10"
        )}
      >
        <Icon className={cn("h-5 w-5", tab.isActive && "scale-110")} />
      </div>
      <span
        className={cn(
          "text-[10px] font-medium",
          tab.isActive && "font-semibold"
        )}
      >
        {tab.label}
      </span>
    </Link>
  );
}

// =============================================================================
// Main Bottom Navigation Component
// =============================================================================

export function BottomNavigation({ className }: BottomNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const { navContext, trainBasePath } = useNavigationContext();

  // Train navigation state
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

  const handleTrainClick = () => {
    router.push(trainBasePath);
  };

  const handlePortalClick = () => {
    // Navigate to goals page since /portal redirects to /portal/train
    router.push("/portal/goals");
  };

  const portalTabs = getPortalNavTabs(pathname, trainBasePath, handleTrainClick);
  const trainTabs = getTrainNavTabs(
    pathname,
    trainBasePath,
    sessionState,
    handlePortalClick
  );

  const isTrain = navContext === "train";

  return (
    <>
      <nav
        className={cn(
          "border-border/50 bg-background/95 supports-backdrop-filter:bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t shadow-lg backdrop-blur md:hidden",
          className
        )}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Navigation container with slide animation */}
        <div className="relative w-full overflow-hidden">
          {/* Portal navigation panel */}
          <div
            className={cn(
              "flex w-full items-stretch px-2 pt-1 transition-all duration-300 ease-out",
              isTrain
                ? "pointer-events-none absolute inset-0 -translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            )}
          >
            {portalTabs.map((tab) => (
              <NavTabItem key={tab.label} tab={tab} />
            ))}
          </div>

          {/* Train navigation panel */}
          <div
            className={cn(
              "flex w-full items-stretch px-2 pt-1 transition-all duration-300 ease-out",
              isTrain
                ? "translate-x-0 opacity-100"
                : "pointer-events-none absolute inset-0 translate-x-full opacity-0"
            )}
          >
            {trainTabs.map((tab) => (
              <NavTabItem
                key={tab.label}
                tab={tab}
                onMoreClick={tab.isMore ? () => setMoreOpen(true) : undefined}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Train More Menu */}
      <TrainMoreMenu
        open={moreOpen}
        onOpenChange={setMoreOpen}
        basePath={trainBasePath}
      />
    </>
  );
}
