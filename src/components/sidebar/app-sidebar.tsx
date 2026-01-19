"use client";

import * as React from "react";
import {
  Command,
  SquareTerminal,
  Search,
  X,
  Keyboard,
  Sparkles,
} from "lucide-react";
import * as Lucide from "lucide-react";
import * as HeroOutline from "@heroicons/react/24/outline";
import type { MenuCreateType, IconPlatform } from "@/types/menu";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";
import { AddMenuPopover } from "@/components/sidebar/AddMenuPopover";
import { useMenuState } from "@/hooks/useMenuState";
import { useHeaderState } from "@/hooks/useHeaderState";
import { HeaderSettingsPopover } from "@/components/sidebar/HeaderSettingsPopover";
import { InstallPWAButton } from "@/components/pwa-install-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import Link from "next/link";
import { readWeeklyPlanSnapshot } from "@/lib/guest/storage";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  // Global toggle for editing UI (super admin mode)
  enableEditing?: boolean;
  // Future: pass current user roles to filter visibility (not enforced yet)
  currentUserRoles?: string[];
};

// Unify icon component type for sidebar rendering
type SidebarIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export function AppSidebar({
  enableEditing = true,
  currentUserRoles,
  ...props
}: AppSidebarProps) {
  // use centralized menu state with optimistic updates and background persistence
  const {
    menu,
    addMenu,
    addChild,
    updateParentLabel,
    updateChildLabel,
    reorderParents,
    reorderChildren,
    isCreating,
    isAddingChild,
    isUpdatingParentLabel,
    isUpdatingChildLabel,
    removeParent,
    removeChild,
    isRemovingParent,
    isRemovingChild,
    iconsByTitle,
    setParentIcon,
    // New: URL update handlers
    updateParentUrl,
    updateChildUrl,
  } = useMenuState();

  // Resolve icon component per item based on icon platform + name
  const getIconForItem = (
    title: string,
    fallback: SidebarIcon,
  ): SidebarIcon => {
    const mapping = iconsByTitle?.[title];
    if (!mapping) return fallback;
    const { name, platform } = mapping;
    if (platform === "heroicons") {
      const Outline = HeroOutline as unknown as Record<string, HeroIcon>;
      const IconComp = Outline[name] ?? fallback;
      return IconComp;
    }
    const LucideIcons = Lucide as unknown as Record<
      string,
      import("lucide-react").LucideIcon
    >;
    const LucComp = (LucideIcons[name] as unknown as SidebarIcon) ?? fallback;
    return LucComp;
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Get user session for active workout check
  const { data: session } = useSession();
  const pathname = usePathname();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const isGuest = !userId;

  // Get today's workout for badge
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
    { enabled: !!userId },
  );

  const [guestHasTodayWorkout, setGuestHasTodayWorkout] = useState(false);

  React.useEffect(() => {
    if (!isGuest) return;
    const snapshot = readWeeklyPlanSnapshot();
    const today = snapshot?.days?.find((d) => d.dayLabel === localDayName);
    const has =
      Boolean(today) && !Boolean(today?.isRestDay) && (today?.items?.length ?? 0) > 0;
    setGuestHasTodayWorkout(has);
  }, [isGuest, localDayName]);

  const hasActiveWorkout = isGuest
    ? guestHasTodayWorkout
    : Boolean(todaysWorkout.data?.hasPlan && todaysWorkout.data?.todayWorkout);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Cmd+W or Ctrl+W: Start workout (only if not in input/textarea)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "w" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        if (hasActiveWorkout) {
          window.location.href = "/portal/start";
        }
      }
      // Escape: Clear search
      if (
        e.key === "Escape" &&
        document.activeElement === searchInputRef.current
      ) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasActiveWorkout, searchQuery]);

  // Filter menu items based on search
  const navMain = useMemo(() => {
    const base = (menu?.navMain ?? []).map((item) => {
      const IconComp = getIconForItem(item.title, SquareTerminal);
      return {
        title: item.title,
        url: item.url,
        icon: IconComp,
        isActive: item.isActive,
        items: item.items,
        enabled: item.enabled,
      };
    });

    const items = isGuest
      ? base
          .map((item) => {
            // Hide settings/account in guest mode
            if ((item.url ?? "").startsWith("/portal/account")) return null;
            if (item.title.toLowerCase() === "settings") return null;

            // Replace "Workouts" children with a single "This Week" item
            if (item.title.toLowerCase() === "workouts") {
              return {
                ...item,
                url: "#",
                items: [
                  { title: "This Week", url: "/portal" },
                  { title: "Gym Discovery", url: "/portal/gyms" },
                ],
              };
            }

            // Hide plan editor + exercises in guest mode
            const children =
              item.items?.filter((c) => {
                const u = (c.url ?? "").toString();
                if (u.startsWith("/portal/plans")) return false;
                if (u.startsWith("/portal/exercises")) return false;
                if (u.startsWith("/portal/account")) return false;
                return true;
              }) ?? item.items;

            // Keep Dashboard + Logs
            const url = (item.url ?? "").toString();
            if (url.startsWith("/portal/plans")) return null;
            if (url.startsWith("/portal/exercises")) return null;

            return { ...item, items: children };
          })
          .filter((i): i is NonNullable<typeof i> => Boolean(i))
      : base;

    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items
      .map((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const children =
          item.items?.filter((child) =>
            child.title.toLowerCase().includes(query),
          ) ?? [];

        // Include item if title matches or has matching children
        if (titleMatch || children.length > 0) {
          return {
            ...item,
            items: titleMatch ? item.items : children, // If title matches, show all children; otherwise filter
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [menu?.navMain, searchQuery, getIconForItem, isGuest]);

  const navSecondary = (menu?.navSecondary ?? []).map((item) => {
    const IconComp = getIconForItem(item.title, SquareTerminal);
    return {
      title: item.title,
      url: item.url,
      icon: IconComp,
    };
  });

  // Header config state
  const { header, updateHeader } = useHeaderState();

  // Determine header icon
  const Outline = HeroOutline as unknown as Record<string, HeroIcon>;
  const LucideIcons = Lucide as unknown as Record<
    string,
    import("lucide-react").LucideIcon
  >;
  const HeaderIcon: SidebarIcon = (() => {
    const name = header?.iconName;
    const platform = header?.iconPlatform ?? "lucide";
    if (name && platform === "heroicons") {
      const CompHero: SidebarIcon = (Outline[name] ?? Command) as SidebarIcon;
      return CompHero;
    }
    if (name) {
      const CompLucide: SidebarIcon = (LucideIcons[name] ??
        Command) as SidebarIcon;
      return CompLucide;
    }
    return Command as SidebarIcon;
  })();

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HeaderIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {header?.title ?? ""}
                  </span>
                  {header?.subtitle ? (
                    <span className="truncate text-xs">{header.subtitle}</span>
                  ) : null}
                </div>
              </Link>
            </SidebarMenuButton>
            {/* Header settings - gated by enableEditing */}
            {enableEditing && (
              <HeaderSettingsPopover
                config={{
                  title: header?.title ?? "",
                  subtitle: header?.subtitle,
                  iconName: header?.iconName,
                  iconPlatform: header?.iconPlatform ?? "lucide",
                }}
                onUpdate={(next) => updateHeader(next)}
                actionClassName="right-7"
              />
            )}
          </SidebarMenuItem>
          {/* Plus button to add menu items - hidden when editing is disabled */}
          {enableEditing && (
            <SidebarMenuItem>
              <AddMenuPopover
                onAdd={(
                  label: string,
                  type: MenuCreateType,
                  iconName?: string,
                  iconPlatform?: IconPlatform,
                ) => {
                  void addMenu(label, type, iconName, iconPlatform);
                }}
                isCreating={isCreating}
              />
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        {isGuest && !enableEditing ? (
          <div className="px-2 pt-2">
            <Badge variant="secondary" className="text-[10px]">
              Guest mode
            </Badge>
            <p className="text-muted-foreground mt-1 text-xs">
              Login to sync and back up.
            </p>
          </div>
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        {/* Search Bar */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
              <SidebarInput
                ref={searchInputRef}
                type="search"
                placeholder="Search menu... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 pl-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {!enableEditing && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Start today's workout (⌘W)"
                    isActive={
                      pathname?.startsWith("/portal/start") ||
                      pathname?.includes("/portal/log/workout/")
                    }
                    className={
                      hasActiveWorkout
                        ? "bg-primary/10 hover:bg-primary/20"
                        : undefined
                    }
                  >
                    <Link href="/portal/start">
                      <Command className="size-4" />
                      <span>Start Workout</span>
                      {hasActiveWorkout && (
                        <Badge
                          variant="default"
                          className="bg-primary ml-auto text-xs"
                        >
                          Ready
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {!isGuest ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Ask AI Coach (⌘I)"
                      isActive={pathname?.startsWith("/portal/ai-planner")}
                    >
                      <Link href="/portal/ai-planner">
                        <Sparkles className="size-4" />
                        <span>Ask AI Coach</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
                <InstallPWAButton variant="sidebar" />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <NavMain
          searchQuery={searchQuery}
          items={navMain}
          onAddChild={(parentTitle, label) => addChild(parentTitle, label)}
          isAddingChild={isAddingChild}
          onUpdateParentLabel={updateParentLabel}
          onUpdateChildLabel={updateChildLabel}
          onReorderParents={reorderParents}
          onReorderChildren={reorderChildren}
          isUpdatingParentLabel={isUpdatingParentLabel}
          isUpdatingChildLabel={isUpdatingChildLabel}
          onRemoveParent={removeParent}
          onRemoveChild={removeChild}
          isRemovingParent={isRemovingParent}
          isRemovingChild={isRemovingChild}
          // New props for icon editing on existing parents
          iconsByTitle={iconsByTitle}
          onUpdateParentIcon={(
            title: string,
            iconName?: string,
            iconPlatform?: IconPlatform,
          ) => setParentIcon(title, iconName, iconPlatform)}
          // New: URL editing
          onUpdateParentUrl={(title, url) => updateParentUrl(title, url)}
          onUpdateChildUrl={(parentTitle, childTitle, url) =>
            updateChildUrl(parentTitle, childTitle, url)
          }
          // Global editing toggle and planned roles (future)
          enableEditing={enableEditing}
          currentUserRoles={currentUserRoles}
        />
        <NavSecondary items={navSecondary} />

        {/* Keyboard Shortcuts */}
        {!enableEditing && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground w-full justify-start text-xs"
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              >
                <Keyboard className="mr-2 h-3 w-3" />
                Shortcuts
              </Button>
              {showKeyboardShortcuts && (
                <div className="space-y-1.5 px-2 pb-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">
                      Toggle sidebar
                    </span>
                    <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">
                      B
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Search</span>
                    <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">
                      ⌘K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Start workout</span>
                    <kbd className="bg-muted rounded px-1.5 py-0.5 text-xs">
                      ⌘W
                    </kbd>
                  </div>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
