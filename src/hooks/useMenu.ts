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
  const utils = apiAny.useUtils();
  const createMutation = apiAny.menu.create.useMutation({
    onSuccess: () => {
      utils.menu.getAll.invalidate();
      onSuccess?.();
    },
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

export function useUpdateParentLabel() {
  const apiAny = api as unknown as any;
  const utils = apiAny.useUtils();
  const mutation = apiAny.menu.updateParentLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateParentLabel = (oldTitle: string, newTitle: string) =>
    mutation.mutate({ oldTitle, newTitle });
  return { updateParentLabel, isUpdatingParentLabel: Boolean(mutation?.isPending) } as const;
}

export function useUpdateChildLabel() {
  const apiAny = api as unknown as any;
  const utils = apiAny.useUtils();
  const mutation = apiAny.menu.updateChildLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateChildLabel = (parentTitle: string, oldTitle: string, newTitle: string) =>
    mutation.mutate({ parentTitle, oldTitle, newTitle });
  return { updateChildLabel, isUpdatingChildLabel: Boolean(mutation?.isPending) } as const;
}

export function useReorderParents() {
  const apiAny = api as unknown as any;
  const utils = apiAny.useUtils();
  const mutation = apiAny.menu.reorderNavMain.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderParents = (orderedTitles: string[]) =>
    mutation.mutate({ orderedTitles });
  return { reorderParents, isReorderingParents: Boolean(mutation?.isPending) } as const;
}

export function useReorderChildren() {
  const apiAny = api as unknown as any;
  const utils = apiAny.useUtils();
  const mutation = apiAny.menu.reorderChildren.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderChildren = (parentTitle: string, orderedTitles: string[]) =>
    mutation.mutate({ parentTitle, orderedTitles });
  return { reorderChildren, isReorderingChildren: Boolean(mutation?.isPending) } as const;
}