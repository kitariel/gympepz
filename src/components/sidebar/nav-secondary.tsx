import * as React from "react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Define a unified icon type compatible with Lucide and Heroicons
type SidebarIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export function NavSecondary({
  items = [],
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: SidebarIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();
  
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            // Determine if item is active
            const isActive = (() => {
              const url = (item.url ?? "").trim();
              if (!url || url === "#") return false;
              
              // Exact match
              if (pathname === url) return true;
              
              // Prefix match for nested routes
              if (url !== "/" && 
                  (pathname.startsWith(url + "/") || 
                   pathname.startsWith(url + "?"))) {
                return true;
              }
              
              return false;
            })();
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm" isActive={isActive}>
                  <Link href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
