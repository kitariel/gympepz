"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const { data: session } = useSession();

  const email = session?.user?.email ?? "";

  // Fetch the latest user data so we can use image stored in DB
  type AccountUser = {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  const userQuery = api.user.getByEmail.useQuery(
    { email },
    { enabled: !!email },
  );
  const user = userQuery.data as AccountUser | null;

  const name =
    user?.name ?? session?.user?.name ?? session?.user?.email ?? "Guest";
  const avatarSrc: string | undefined = user?.image ?? session?.user?.image ?? undefined;

  const isGuest = !session?.user;

  if (isGuest) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="space-y-2 rounded-lg border bg-sidebar-accent/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Guest mode</span>
              <Badge variant="secondary" className="text-[10px]">
                Guest
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Your session is temporary. Create an account to save progress.
            </p>
            <Button asChild size="sm" className="h-9 w-full">
              <Link href="/login">Save your progress</Link>
            </Button>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // if has name or first name and last name then use if dont have use email split by @ and use first part
  // if one word use 2 letter of the word
  // if two words use first letter of each word
  const initials = useMemo(() => {
    const display = (name ?? email ?? "").toString();
    if (!display) return "?";
    const parts = display.split(" ").filter(Boolean);
    if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
    const first = (parts[0]?.[0] ?? "").toUpperCase();
    const second = (parts[1]?.[0] ?? "").toUpperCase();
    return `${first}${second}`;
  }, [name, email]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarSrc} alt={name || "User avatar"} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                {email ? (
                  <span className="truncate text-xs">{email}</span>
                ) : null}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarSrc} alt={name || "User avatar"} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  {email ? (
                    <span className="truncate text-xs">{email}</span>
                  ) : null}
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/portal/account">
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Theme controls */}
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop />
                System
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
