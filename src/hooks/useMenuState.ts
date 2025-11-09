"use client";
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any */

import * as React from "react";
import { api } from "@/trpc/react";
import type { MenuConfig, MenuItem, MenuChild, MenuCreateType } from "@/types/menu";

// Centralized menu state with optimistic updates and background persistence (+ rollback on error)
export function useMenuState() {
  const apiAny = api as unknown as any;
  const utils = apiAny.useUtils();

  // Query to fetch initial data
  const menuQuery = apiAny.menu.getAll.useQuery();
  const { isLoading } = menuQuery;

  const initialData: MenuConfig | undefined =
    menuQuery?.data && typeof menuQuery.data === "object"
      ? (menuQuery.data as MenuConfig)
      : undefined;

  const [menu, setMenu] = React.useState<MenuConfig | undefined>(initialData);

  // Hydrate local state whenever server data changes
  React.useEffect(() => {
    setMenu(initialData);
  }, [initialData]);

  // Helper to find parent index by title
  const findParentIndex = React.useCallback((title: string) => {
    return (menu?.navMain ?? []).findIndex((i) => i.title === title);
  }, [menu]);

  // Create parent menu item (always in navMain; type controls whether it has children)
  const createParentMutation = apiAny.menu.create.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const addMenu = React.useCallback(async (label: string, type: MenuCreateType) => {
    const snapshot = menu;
    // Optimistic update
    setMenu((prev) => {
      if (!prev) return prev;
      const next: MenuConfig = { ...prev };
      const newItem: MenuItem = type === "group"
        ? { title: label, url: "#", items: [] }
        : { title: label, url: "#" };
      next.navMain = [...(next.navMain ?? []), newItem];
      return next;
    });
    try {
      await createParentMutation.mutateAsync({ label, type });
    } catch (err) {
      // Roll back on error
      setMenu(snapshot);
    }
  }, [menu, createParentMutation]);

  // Create child under a parent in navMain
  const createChildMutation = apiAny.menu.createChild.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const addChild = React.useCallback(async (parentTitle: string, label: string, url = "#") => {
    const snapshot = menu;
    setMenu((prev) => {
      if (!prev) return prev;
      const idx = prev.navMain.findIndex((i) => i.title === parentTitle);
      if (idx === -1) return prev;
      const next: MenuConfig = { ...prev };
      const parent = { ...next.navMain[idx]! };
      const children: MenuChild[] = [...(parent.items ?? [])];
      children.push({ title: label, url });
      const updatedParent: MenuItem = { ...parent, items: children };
      next.navMain[idx] = updatedParent;
      return next;
    });
    try {
      await createChildMutation.mutateAsync({ parentTitle, child: { title: label, url } });
    } catch (err) {
      setMenu(snapshot);
    }
  }, [menu, createChildMutation]);

  // Update parent label
  const updateParentLabelMutation = apiAny.menu.updateParentLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateParentLabel = React.useCallback(async (oldTitle: string, newTitle: string) => {
    const snapshot = menu;
    setMenu((prev) => {
      if (!prev) return prev;
      const next: MenuConfig = { ...prev };
      next.navMain = (next.navMain ?? []).map((p) => (p.title === oldTitle ? { ...p, title: newTitle } : p));
      next.navSecondary = (next.navSecondary ?? []).map((p) => (p.title === oldTitle ? { ...p, title: newTitle } : p));
      return next;
    });
    try {
      await updateParentLabelMutation.mutateAsync({ oldTitle, newTitle });
    } catch (err) {
      setMenu(snapshot);
    }
  }, [menu, updateParentLabelMutation]);

  // Update child label
  const updateChildLabelMutation = apiAny.menu.updateChildLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateChildLabel = React.useCallback(async (parentTitle: string, oldTitle: string, newTitle: string) => {
    const snapshot = menu;
    setMenu((prev) => {
      if (!prev) return prev;
      const next: MenuConfig = { ...prev };
      next.navMain = (next.navMain ?? []).map((p) => {
        if (p.title !== parentTitle) return p;
        const updatedChildren = (p.items ?? []).map((c) => (c.title === oldTitle ? { ...c, title: newTitle } : c));
        return { ...p, items: updatedChildren };
      });
      return next;
    });
    try {
      await updateChildLabelMutation.mutateAsync({ parentTitle, oldTitle, newTitle });
    } catch (err) {
      setMenu(snapshot);
    }
  }, [menu, updateChildLabelMutation]);

  // Reorder parents in navMain
  const reorderParentsMutation = apiAny.menu.reorderNavMain.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderParents = React.useCallback(async (orderedTitles: string[]) => {
    const snapshot = menu;
    setMenu((prev) => {
      if (!prev) return prev;
      const next: MenuConfig = { ...prev };
      const entries: [string, MenuItem][] = (next.navMain ?? []).map((i) => [i.title, i]);
      const byTitle = new Map(entries);
      const reordered = orderedTitles
        .map((t) => byTitle.get(t))
        .filter((v): v is MenuItem => Boolean(v));
      next.navMain = reordered;
      return next;
    });
    try {
      await reorderParentsMutation.mutateAsync({ orderedTitles });
    } catch (err) {
      setMenu(snapshot);
    }
  }, [menu, reorderParentsMutation]);

  // Reorder children under a parent
  const reorderChildrenMutation = apiAny.menu.reorderChildren.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderChildren = React.useCallback(async (parentTitle: string, orderedTitles: string[]) => {
    const snapshot = menu;
    setMenu((prev) => {
      if (!prev) return prev;
      const idx = prev.navMain.findIndex((i) => i.title === parentTitle);
      if (idx === -1) return prev;
      const next: MenuConfig = { ...prev };
      const parent = next.navMain[idx]!;
      const childEntries: [string, MenuChild][] = (parent.items ?? []).map((i) => [i.title, i]);
      const byTitle = new Map(childEntries);
      const reordered = orderedTitles
        .map((t) => byTitle.get(t))
        .filter((v): v is MenuChild => Boolean(v));
      const updatedParent: MenuItem = { ...parent, items: reordered };
      next.navMain[idx] = updatedParent;
      return next;
    });
    try {
      await reorderChildrenMutation.mutateAsync({ parentTitle, orderedTitles });
    } catch (err) {
      setMenu(snapshot);
    }
  }, [menu, reorderChildrenMutation]);

  // Remove parent menu item
  const deleteParentMutation = apiAny.menu.deleteParent.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const removeParent = React.useCallback(async (title: string) => {
    const snapshot = menu;
    setMenu((prev) => {
      if (!prev) return prev;
      const next: MenuConfig = { ...prev };
      next.navMain = (next.navMain ?? []).filter((p) => p.title !== title);
      return next;
    });
    try {
      await deleteParentMutation.mutateAsync({ title });
    } catch (err) {
      setMenu(snapshot);
    }
  }, [menu, deleteParentMutation]);

  // Remove child menu item
  const deleteChildMutation = apiAny.menu.deleteChild.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const removeChild = React.useCallback(async (parentTitle: string, childTitle: string) => {
    const snapshot = menu;
    setMenu((prev) => {
      if (!prev) return prev;
      const next: MenuConfig = { ...prev };
      next.navMain = (next.navMain ?? []).map((p) => {
        if (p.title !== parentTitle) return p;
        const updatedChildren = (p.items ?? []).filter((c) => c.title !== childTitle);
        return { ...p, items: updatedChildren };
      });
      return next;
    });
    try {
      await deleteChildMutation.mutateAsync({ parentTitle, childTitle });
    } catch (err) {
      setMenu(snapshot);
    }
  }, [menu, deleteChildMutation]);

  return {
    menu,
    isLoading: Boolean(isLoading),
    addMenu,
    addChild,
    updateParentLabel,
    updateChildLabel,
    reorderParents,
    reorderChildren,
    removeParent,
    removeChild,
    findParentIndex,
    isCreating: Boolean(createParentMutation?.isPending),
    isAddingChild: Boolean(createChildMutation?.isPending),
    isUpdatingParentLabel: Boolean(updateParentLabelMutation?.isPending),
    isUpdatingChildLabel: Boolean(updateChildLabelMutation?.isPending),
    isReorderingParents: Boolean(reorderParentsMutation?.isPending),
    isReorderingChildren: Boolean(reorderChildrenMutation?.isPending),
    isRemovingParent: Boolean(deleteParentMutation?.isPending),
    isRemovingChild: Boolean(deleteChildMutation?.isPending),
  } as const;
 }