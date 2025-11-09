"use client";
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */

import * as React from "react";
import { Command, SquareTerminal } from "lucide-react";

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
import { useMenuData, useCreateMenu, useCreateChild } from "@/hooks/useMenu";



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { menuData, refetch } = useMenuData();
  const { createMenu, isCreating } = useCreateMenu(() => {
    refetch();
  });
  const { createChild, isAddingChild } = useCreateChild();

  const navMain = (menuData?.navMain ?? []).map((item) => ({
    title: item.title,
    url: item.url,
    icon: SquareTerminal,
    isActive: item.isActive,
    items: item.items,
  }));

  const navSecondary = (menuData?.navSecondary ?? []).map((item) => ({
    title: item.title,
    url: item.url,
    icon: SquareTerminal,
  }));

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
            <AddMenuPopover onAdd={createMenu} isCreating={isCreating} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          onAddChild={(parentTitle, label) => createChild(parentTitle, label)}
          isAddingChild={isAddingChild}
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
