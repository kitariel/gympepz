"use client";
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */

import * as React from "react";
import { Command, Plus, SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
// import { NavProjects } from "@/components/sidebar/nav-projects";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

// Define local types to avoid linter complaints about `any/error` types from cross-boundary generics
type MenuItem = {
  title: string;
  url: string;
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

type SecondaryItem = {
  title: string;
  url: string;
};

type ProjectItem = {
  name: string;
  url: string;
};

type MenuConfig = {
  navMain: MenuItem[];
  navSecondary: SecondaryItem[];
  projects: ProjectItem[];
};

type MenuCreateType = "group" | "single";

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Cast TRPC api to `any` for runtime calls to avoid linter's cross-boundary generic errors
  const apiAny = api as unknown as any;
  const menuQuery = apiAny.menu.getAll.useQuery();
  const { refetch, isLoading } = menuQuery;
  // Narrow data safely to our local type
  const menuData: MenuConfig | undefined =
    menuQuery?.data && typeof menuQuery.data === "object"
      ? (menuQuery.data as MenuConfig)
      : undefined;

  const createMutation = apiAny.menu.create.useMutation({
    onSuccess: () => {
      refetch();
      setLabel("");
    },
  });

  const isCreating = Boolean(createMutation?.isPending);

  const [label, setLabel] = React.useState("");
  const [type, setType] = React.useState<MenuCreateType>("single");

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

  // const projects = (menuData?.projects ?? []).map((p) => ({
  //   name: p.name,
  //   url: p.url,
  //   icon: SquareTerminal,
  // }));

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
            <Popover>
              <PopoverTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Add menu">
                  <Plus className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Label</label>
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Menu label"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Type</label>
                    <RadioGroup
                      value={type}
                      onValueChange={(val) =>
                        setType(val as "group" | "single")
                      }
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id="type-single" value="single" />
                        <label htmlFor="type-single" className="text-sm">
                          Single
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id="type-group" value="group" />
                        <label htmlFor="type-group" className="text-sm">
                          Group
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button
                    onClick={() =>
                      createMutation.mutate({ label: label.trim(), type })
                    }
                    disabled={!label.trim() || isCreating}
                  >
                    {isCreating ? "Adding..." : "Add menu"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/* If you want projects dynamically too, uncomment: */}
        {/* <NavProjects projects={projects} /> */}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
