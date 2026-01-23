"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, NotebookPen, Home, Play, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { resolveAppMode } from "@/lib/app-mode";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const mode = resolveAppMode(session);

  const navItems =
    mode === "guest"
      ? [
          { label: "Home", href: "/portal", icon: Home },
          { label: "Train", href: "/train", icon: Play },
          { label: "History", href: "/train/history", icon: NotebookPen },
        ]
      : [
          { label: "Templates", href: "/train/templates", icon: Calendar },
          { label: "Goals", href: "/portal/goals", icon: Target },
          { label: "History", href: "/train/history", icon: NotebookPen },
        ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg md:hidden">
      <div className="mx-auto flex max-w-screen-xl items-center justify-around px-2 py-2.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-2 transition-all duration-200",
                  isActive &&
                    "bg-primary/10 shadow-sm shadow-primary/20",
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
