"use client";

import * as React from "react";
import { Command, SquareTerminal } from "lucide-react";
import * as Lucide from "lucide-react";
import type { MenuCreateType } from "@/types/menu";

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

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  // Global toggle for editing UI (super admin mode)
  enableEditing?: boolean;
  // Future: pass current user roles to filter visibility (not enforced yet)
  currentUserRoles?: string[];
};

export function AppSidebar({ enableEditing = true, currentUserRoles, ...props }: AppSidebarProps) {
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
  } = useMenuState();

  const navMain = (menu?.navMain ?? []).map((item) => {
    const iconName: string | undefined = iconsByTitle?.[item.title];
    const LucideIcons = Lucide as unknown as Record<string, import("lucide-react").LucideIcon>;
    const IconComp: import("lucide-react").LucideIcon = iconName ? (LucideIcons[iconName] ?? SquareTerminal) : SquareTerminal;
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
    const iconName: string | undefined = iconsByTitle?.[item.title];
    const LucideIcons = Lucide as unknown as Record<string, import("lucide-react").LucideIcon>;
    const IconComp: import("lucide-react").LucideIcon = iconName ? (LucideIcons[iconName] ?? SquareTerminal) : SquareTerminal;
    return {
      title: item.title,
      url: item.url,
      icon: IconComp,
    };
  });

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Plus button to add menu items */}
          <SidebarMenuItem>
            <AddMenuPopover onAdd={(label: string, type: MenuCreateType, iconName?: string) => { void addMenu(label, type, iconName); }} isCreating={isCreating} />
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
          onUpdateParentIcon={(title: string, iconName?: string) => setParentIcon(title, iconName)}
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
