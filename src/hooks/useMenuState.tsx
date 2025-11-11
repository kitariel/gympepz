"use client";

import * as React from "react";
import { api } from "@/trpc/react";
import type {
  MenuConfig,
  MenuItem,
  MenuChild,
  MenuCreateType,
  IconPlatform,
} from "@/types/menu";

// Centralized menu state with optimistic updates and background persistence (+ rollback on error)
export function useMenuState() {
  const utils = api.useUtils();

  // Query to fetch initial data
  const menuQuery = api.menu.getAll.useQuery();
  const { isLoading } = menuQuery;

  const initialData: MenuConfig | undefined =
    menuQuery?.data && typeof menuQuery.data === "object"
      ? (menuQuery.data as MenuConfig)
      : undefined;

  const [menu, setMenu] = React.useState<MenuConfig | undefined>(initialData);
  // Track icon assignments locally keyed by parent title (also hydrated from backend iconName/iconPlatform when available)
  const [iconsByTitle, setIconsByTitle] = React.useState<
    Record<string, { name: string; platform: IconPlatform }>
  >({});

  // Hydrate local state whenever server data changes
  React.useEffect(() => {
    setMenu(initialData);
    // Build local icon map from server-provided iconName fields
    const iconMap: Record<string, { name: string; platform: IconPlatform }> = {};
    (initialData?.navMain ?? []).forEach((p) => {
      const trimmed = p.iconName?.trim();
      if (trimmed) {
        iconMap[p.title] = { name: trimmed, platform: p.iconPlatform ?? "lucide" };
      }
    });
    setIconsByTitle(iconMap);
  }, [initialData]);

  // Helper to find parent index by title
  const findParentIndex = React.useCallback(
    (title: string) => {
      return (menu?.navMain ?? []).findIndex((i) => i.title === title);
    },
    [menu],
  );

  // Create parent menu item (always in navMain; type controls whether it has children)
  const createParentMutation = api.menu.create.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const addMenu = React.useCallback(
    async (
      label: string,
      type: MenuCreateType,
      iconName?: string,
      iconPlatform?: IconPlatform,
    ) => {
      const snapshot = menu;
      // Optimistic update
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        const newItem: MenuItem =
          type === "group"
            ? { title: label, url: "#", items: [], iconName: iconName?.trim(), iconPlatform }
            : { title: label, url: "#", iconName: iconName?.trim(), iconPlatform };
        next.navMain = [...(next.navMain ?? []), newItem];
        return next;
      });
      // Record icon selection locally
      if (iconName) {
        setIconsByTitle((prev) => ({
          ...prev,
          [label]: { name: iconName.trim(), platform: iconPlatform ?? "lucide" },
        }));
      }
      try {
        await createParentMutation.mutateAsync({ label, type, iconName, iconPlatform });
      } catch (err) {
        // Roll back on error
        setMenu(snapshot);
        // Best-effort rollback for icon map
        setIconsByTitle((prev) => {
          const next = { ...prev };
          delete next[label];
          return next;
        });
      }
    },
    [menu, createParentMutation],
  );

  // Create child under a parent in navMain
  const createChildMutation = api.menu.createChild.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const addChild = React.useCallback(
    async (parentTitle: string, label: string, url = "#") => {
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
        await createChildMutation.mutateAsync({
          parentTitle,
          child: { title: label, url },
        });
      } catch (err) {
        setMenu(snapshot);
      }
    },
    [menu, createChildMutation],
  );

  // Update parent label
  const updateParentLabelMutation = api.menu.updateParentLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateParentLabel = React.useCallback(
    async (oldTitle: string, newTitle: string) => {
      const snapshot = menu;
      const iconsSnapshot = iconsByTitle;
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        next.navMain = (next.navMain ?? []).map((p) =>
          p.title === oldTitle ? { ...p, title: newTitle } : p,
        );
        next.navSecondary = (next.navSecondary ?? []).map((p) =>
          p.title === oldTitle ? { ...p, title: newTitle } : p,
        );
        return next;
      });
      // Maintain icon mapping across label rename
      setIconsByTitle((prev) => {
        const next = { ...prev } as Record<string, { name: string; platform: IconPlatform }>;
        if (prev[oldTitle]) {
          next[newTitle] = prev[oldTitle];
          delete next[oldTitle];
        }
        return next;
      });
      try {
        await updateParentLabelMutation.mutateAsync({ oldTitle, newTitle });
      } catch (err) {
        setMenu(snapshot);
        setIconsByTitle(iconsSnapshot);
      }
    },
    [menu, updateParentLabelMutation, iconsByTitle],
  );

  // Update child label
  const updateChildLabelMutation = api.menu.updateChildLabel.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateChildLabel = React.useCallback(
    async (parentTitle: string, oldTitle: string, newTitle: string) => {
      const snapshot = menu;
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        next.navMain = (next.navMain ?? []).map((p) => {
          if (p.title !== parentTitle) return p;
          const updatedChildren = (p.items ?? []).map((c) =>
            c.title === oldTitle ? { ...c, title: newTitle } : c,
          );
          return { ...p, items: updatedChildren };
        });
        return next;
      });
      try {
        await updateChildLabelMutation.mutateAsync({
          parentTitle,
          oldTitle,
          newTitle,
        });
      } catch (err) {
        setMenu(snapshot);
      }
    },
    [menu, updateChildLabelMutation],
  );

  // Persist parent icon updates
  const updateParentIconMutation = api.menu.updateParentIcon.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  // Update or clear parent icon (optimistic + persistence)
  const setParentIcon = React.useCallback(
    (title: string, iconName?: string, iconPlatform?: IconPlatform) => {
      const snapshot = { icons: iconsByTitle, menu };
      // Optimistic local map update
      setIconsByTitle((prev) => {
        const next = { ...prev } as Record<string, { name: string; platform: IconPlatform }>;
        const trimmed = iconName?.trim();
        if (trimmed) {
          next[title] = { name: trimmed, platform: iconPlatform ?? prev[title]?.platform ?? "lucide" };
        } else {
          delete next[title];
        }
        return next;
      });
      // Also update menu local state so iconName/iconPlatform are reflected in menu data
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        next.navMain = (next.navMain ?? []).map((p) =>
          p.title === title
            ? { ...p, iconName: iconName?.trim() ?? undefined, iconPlatform: iconName ? (iconPlatform ?? p.iconPlatform ?? "lucide") : undefined }
            : p,
        );
        return next;
      });
      // Persist to backend
      try {
        void updateParentIconMutation.mutateAsync({ title, iconName, iconPlatform });
      } catch (err) {
        // Roll back icon map and menu state on error
        setIconsByTitle(snapshot.icons);
        setMenu(snapshot.menu);
      }
    },
    [iconsByTitle, menu, updateParentIconMutation],
  );

  // Reorder parents in navMain
  const reorderParentsMutation = api.menu.reorderNavMain.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderParents = React.useCallback(
    async (orderedTitles: string[]) => {
      const snapshot = menu;
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        const entries: [string, MenuItem][] = (next.navMain ?? []).map((i) => [
          i.title,
          i,
        ]);
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
    },
    [menu, reorderParentsMutation],
  );

  // Reorder children under a parent
  const reorderChildrenMutation = api.menu.reorderChildren.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const reorderChildren = React.useCallback(
    async (parentTitle: string, orderedTitles: string[]) => {
      const snapshot = menu;
      setMenu((prev) => {
        if (!prev) return prev;
        const idx = prev.navMain.findIndex((i) => i.title === parentTitle);
        if (idx === -1) return prev;
        const next: MenuConfig = { ...prev };
        const parent = next.navMain[idx]!;
        const childEntries: [string, MenuChild][] = (parent.items ?? []).map(
          (i) => [i.title, i],
        );
        const byTitle = new Map(childEntries);
        const reordered = orderedTitles
          .map((t) => byTitle.get(t))
          .filter((v): v is MenuChild => Boolean(v));
        const updatedParent: MenuItem = { ...parent, items: reordered };
        next.navMain[idx] = updatedParent;
        return next;
      });
      try {
        await reorderChildrenMutation.mutateAsync({
          parentTitle,
          orderedTitles,
        });
      } catch (err) {
        setMenu(snapshot);
      }
    },
    [menu, reorderChildrenMutation],
  );

  // Remove parent menu item
  const deleteParentMutation = api.menu.deleteParent.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const removeParent = React.useCallback(
    async (title: string) => {
      const snapshot = menu;
      const iconsSnapshot = iconsByTitle;
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        next.navMain = (next.navMain ?? []).filter((p) => p.title !== title);
        return next;
      });
      // Remove any icon mapping for this parent
      setIconsByTitle((prev) => {
        const next = { ...prev } as Record<string, { name: string; platform: IconPlatform }>;
        delete next[title];
        return next;
      });
      try {
        await deleteParentMutation.mutateAsync({ title });
      } catch (err) {
        setMenu(snapshot);
        setIconsByTitle(iconsSnapshot);
      }
    },
    [menu, deleteParentMutation, iconsByTitle],
  );

  // Remove child menu item
  const deleteChildMutation = api.menu.deleteChild.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const removeChild = React.useCallback(
    async (parentTitle: string, childTitle: string) => {
      const snapshot = menu;
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        next.navMain = (next.navMain ?? []).map((p) => {
          if (p.title !== parentTitle) return p;
          const updatedChildren = (p.items ?? []).filter(
            (c) => c.title !== childTitle,
          );
          return { ...p, items: updatedChildren };
        });
        return next;
      });
      try {
        await deleteChildMutation.mutateAsync({ parentTitle, childTitle });
      } catch (err) {
        setMenu(snapshot);
      }
    },
    [menu, deleteChildMutation],
  );

  // Update parent URL
  const updateParentUrlMutation = api.menu.updateParentUrl.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateParentUrl = React.useCallback(
    async (title: string, url: string) => {
      const snapshot = menu;
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        next.navMain = (next.navMain ?? []).map((p) =>
          p.title === title ? { ...p, url } : p,
        );
        return next;
      });
      try {
        await updateParentUrlMutation.mutateAsync({ title, url });
      } catch (err) {
        setMenu(snapshot);
      }
    },
    [menu, updateParentUrlMutation],
  );

  // Update child URL
  const updateChildUrlMutation = api.menu.updateChildUrl.useMutation({
    onSuccess: () => utils.menu.getAll.invalidate(),
  });
  const updateChildUrl = React.useCallback(
    async (parentTitle: string, childTitle: string, url: string) => {
      const snapshot = menu;
      setMenu((prev) => {
        if (!prev) return prev;
        const next: MenuConfig = { ...prev };
        next.navMain = (next.navMain ?? []).map((p) => {
          if (p.title !== parentTitle) return p;
          const updatedChildren = (p.items ?? []).map((c) =>
            c.title === childTitle ? { ...c, url } : c,
          );
          return { ...p, items: updatedChildren };
        });
        return next;
      });
      try {
        await updateChildUrlMutation.mutateAsync({ parentTitle, childTitle, url });
      } catch (err) {
        setMenu(snapshot);
      }
    },
    [menu, updateChildUrlMutation],
  );

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
    iconsByTitle,
    setParentIcon,
    updateParentUrl,
    updateChildUrl,
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
