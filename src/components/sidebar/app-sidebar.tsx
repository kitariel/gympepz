"use client";

import * as React from "react";
import { Command, SquareTerminal } from "lucide-react";
import * as Lucide from "lucide-react";
import * as HeroOutline from "@heroicons/react/24/outline";
import type { MenuCreateType, IconPlatform } from "@/types/menu";

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
} from "@/components/ui/sidebar";
import { AddMenuPopover } from "@/components/sidebar/AddMenuPopover";
import { useMenuState } from "@/hooks/useMenuState";
import { useHeaderState } from "@/hooks/useHeaderState";
import { HeaderSettingsPopover } from "@/components/sidebar/HeaderSettingsPopover";

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
    const LucideIcons = Lucide as unknown as Record<string, import("lucide-react").LucideIcon>;
    const LucComp = (LucideIcons[name] as unknown as SidebarIcon) ?? fallback;
    return LucComp;
  };

  const navMain = (menu?.navMain ?? []).map((item) => {
    const IconComp = getIconForItem(
      item.title,
      SquareTerminal,
    );
    return {
      title: item.title,
      url: item.url,
      icon: IconComp,
      isActive: item.isActive,
      items: item.items,
      enabled: item.enabled,
    };
  });

  const navSecondary = (menu?.navSecondary ?? []).map((item) => {
    const IconComp = getIconForItem(
      item.title,
      SquareTerminal,
    );
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
  const LucideIcons = Lucide as unknown as Record<string, import("lucide-react").LucideIcon>;
  const HeaderIcon: SidebarIcon = (() => {
    const name = header?.iconName;
    const platform = header?.iconPlatform ?? "lucide";
    if (name && platform === "heroicons") {
      const CompHero: SidebarIcon = (Outline[name] ?? Command) as SidebarIcon;
      return CompHero;
    }
    if (name) {
      const CompLucide: SidebarIcon = (LucideIcons[name] ?? Command) as SidebarIcon;
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
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HeaderIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{header?.title ?? "Acme Inc"}</span>
                  {header?.subtitle ? (
                    <span className="truncate text-xs">{header.subtitle}</span>
                  ) : null}
                </div>
              </a>
            </SidebarMenuButton>
            {/* Header settings */}
            <HeaderSettingsPopover
              config={{
                title: header?.title ?? "Acme Inc",
                subtitle: header?.subtitle,
                iconName: header?.iconName,
                iconPlatform: header?.iconPlatform ?? "lucide",
              }}
              onUpdate={(next) => updateHeader(next)}
              actionClassName="right-7"
            />
          </SidebarMenuItem>
          {/* Plus button to add menu items */}
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
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
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
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
