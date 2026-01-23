"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Target, Dumbbell, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalNavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

interface PortalNavContentProps {
  portalBasePath?: string;
  trainBasePath?: string;
}

export function PortalNavContent({
  portalBasePath = "/portal",
  trainBasePath = "/portal/train",
}: PortalNavContentProps = {}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTrainClick = () => {
    router.push(trainBasePath);
  };

  // Portal navigation items: AI Planner, Goal, Exercises, Train (with arrow)
  const navItems: PortalNavItem[] = [
    { label: "AI Planner", href: "/portal/ai-planner", icon: Sparkles },
    { label: "Goal", href: "/portal/goals", icon: Target },
    { label: "Exercises", href: "/portal/exercises", icon: Dumbbell },
    {
      label: "Train",
      onClick: handleTrainClick,
      icon: ChevronLeft,
    },
  ];

  return (
    <div className="mx-auto flex max-w-screen-xl w-full items-center justify-around px-2 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+10px)]">
      {navItems.map((item) => {
        const isActive = item.href
          ? pathname === item.href || pathname.startsWith(item.href + "/")
          : false;
        const Icon = item.icon;

        const content = (
          <>
            <div
              className={cn(
                "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
                isActive && "bg-primary/10 shadow-sm shadow-primary/20",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "scale-110",
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium leading-tight transition-all",
                isActive && "font-semibold",
              )}
            >
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </>
        );

        if (item.onClick) {
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href!}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
