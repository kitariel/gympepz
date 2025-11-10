"use client";

import { api } from "@/trpc/react";
import type { MenuConfig, MenuCreateType } from "@/types/menu";

export function useMenuData() {
  const menuQuery = api.menu.getAll.useQuery();
  const { refetch, isLoading } = menuQuery;

  const menuData: MenuConfig | undefined =
    menuQuery?.data && typeof menuQuery.data === "object"
      ? (menuQuery.data as MenuConfig)
      : undefined;

  return { menuData, refetch, isLoading } as const;
}

export function useCreateMenu(onSuccess?: () => void) {
  const utils = api.useUtils();
  const createMutation = api.menu.create.useMutation({
    onSuccess: () => {
      void utils.menu.getAll.invalidate();
      onSuccess?.();
    },
  });
  const createMenu = (label: string, type: MenuCreateType) =>
    createMutation.mutate({ label, type });

  return {
    createMenu,
    isCreating: Boolean(createMutation?.isPending),
  } as const;
}

export function useCreateChild() {
  const utils = api.useUtils();
  const createChildMutation = api.menu.createChild.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });

  const createChild = (parentTitle: string, label: string, url = "#") =>
    createChildMutation.mutate({ parentTitle, child: { title: label, url } });

  return {
    createChild,
    isAddingChild: Boolean(createChildMutation?.isPending),
  } as const;
}

export function useUpdateParentLabel() {
  const utils = api.useUtils();
  const mutation = api.menu.updateParentLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateParentLabel = (oldTitle: string, newTitle: string) =>
    mutation.mutate({ oldTitle, newTitle });
  return {
    updateParentLabel,
    isUpdatingParentLabel: Boolean(mutation?.isPending),
  } as const;
}

export function useUpdateChildLabel() {
  const utils = api.useUtils();
  const mutation = api.menu.updateChildLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateChildLabel = (
    parentTitle: string,
    oldTitle: string,
    newTitle: string,
  ) => mutation.mutate({ parentTitle, oldTitle, newTitle });
  return {
    updateChildLabel,
    isUpdatingChildLabel: Boolean(mutation?.isPending),
  } as const;
}

export function useReorderParents() {
  const utils = api.useUtils();
  const mutation = api.menu.reorderNavMain.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderParents = (orderedTitles: string[]) =>
    mutation.mutate({ orderedTitles });
  return {
    reorderParents,
    isReorderingParents: Boolean(mutation?.isPending),
  } as const;
}

export function useReorderChildren() {
  const utils = api.useUtils();
  const mutation = api.menu.reorderChildren.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderChildren = (parentTitle: string, orderedTitles: string[]) =>
    mutation.mutate({ parentTitle, orderedTitles });
  return {
    reorderChildren,
    isReorderingChildren: Boolean(mutation?.isPending),
  } as const;
}
