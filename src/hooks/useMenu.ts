"use client";
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */

import { api } from "@/trpc/react";
import type { MenuConfig, MenuCreateType } from "@/types/menu";

export function useMenuData() {
  const apiAny = api as unknown as any;
  const menuQuery = apiAny.menu.getAll.useQuery();
  const { refetch, isLoading } = menuQuery;

  const menuData: MenuConfig | undefined =
    menuQuery?.data && typeof menuQuery.data === "object"
      ? (menuQuery.data as MenuConfig)
      : undefined;

  return { menuData, refetch, isLoading } as const;
}

export function useCreateMenu(onSuccess?: () => void) {
  const apiAny = api as unknown as any;
  const createMutation = apiAny.menu.create.useMutation({
    onSuccess,
  });
  const createMenu = (label: string, type: MenuCreateType) =>
    createMutation.mutate({ label, type });

  return { createMenu, isCreating: Boolean(createMutation?.isPending) } as const;
}

export function useCreateChild() {
  const apiAny = api as unknown as any;
  const utils = apiAny.useUtils();
  const createChildMutation = apiAny.menu.createChild.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });

  const createChild = (parentTitle: string, label: string, url = "#") =>
    createChildMutation.mutate({ parentTitle, child: { title: label, url } });

  return { createChild, isAddingChild: Boolean(createChildMutation?.isPending) } as const;
}