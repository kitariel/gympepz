"use client";
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */

import * as React from "react";
import { ChevronRight, Plus, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  // Cast TRPC api to any at call site to avoid strict generic linter complaints
  const apiAny = api as unknown as any;
  const utils = apiAny.useUtils();
  const createChild = apiAny.menu.createChild.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const [childLabels, setChildLabels] = React.useState<Record<string, string>>(
    {},
  );

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item, index) => (
          <Collapsible
            key={item.title + index}
            asChild
            defaultOpen={item.isActive}
          >
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items ? (
                <>
                  {/* Add child button to the left of the chevron toggle */}
                  <Popover>
                    <PopoverTrigger asChild>
                      {/* Move the plus button slightly left so it doesn't overlap the chevron */}
                      <SidebarMenuAction className="right-7">
                        <Plus />
                        <span className="sr-only">Add child</span>
                      </SidebarMenuAction>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-64">
                      <div className="grid gap-2">
                        <Input
                          placeholder="Child label"
                          value={childLabels[item.title] ?? ""}
                          onChange={(e) =>
                            setChildLabels((prev) => ({
                              ...prev,
                              [item.title]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          onClick={() => {
                            const label = (
                              childLabels[item.title] ?? ""
                            ).trim();
                            if (!label) return;
                            createChild.mutate({
                              parentTitle: item.title,
                              child: { title: label, url: "#" },
                            });
                            setChildLabels((prev) => ({
                              ...prev,
                              [item.title]: "",
                            }));
                          }}
                          disabled={
                            (createChild.isPending ?? false)
                              ? true
                              : !Boolean((childLabels[item.title] ?? "").trim())
                          }
                        >
                          {createChild.isPending ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem, index) => (
                        <SidebarMenuSubItem key={subItem.title + index}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
