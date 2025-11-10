"use client";
import * as React from "react";
import {
  Settings,
  Trash2,
  LayoutGrid,
  Search,
  ChevronLeft,
  ChevronRight,
  SquareTerminal,
} from "lucide-react";
import * as Lucide from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export function GroupSettingsPopover({
  parentTitle,
  onUpdateLabel,
  isUpdating,
  onAddChild,
  isAddingChild,
  onRemoveParent,
  isRemovingParent,
  currentIconName,
  onUpdateIcon,
  hasChildren,
  actionClassName = "right-7",
}: {
  parentTitle: string;
  onUpdateLabel: (oldTitle: string, newTitle: string) => void;
  isUpdating?: boolean;
  onAddChild: (label: string) => void;
  isAddingChild?: boolean;
  onRemoveParent: (title: string) => void;
  isRemovingParent?: boolean;
  currentIconName?: string;
  onUpdateIcon: (title: string, iconName?: string) => void;
  hasChildren?: boolean;
  actionClassName?: string;
}) {
  const [groupLabel, setGroupLabel] = React.useState(parentTitle);
  const [childLabel, setChildLabel] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [iconName, setIconName] = React.useState<string>(currentIconName ?? "");
  const [iconSearch, setIconSearch] = React.useState<string>("");
  const [browseOpen, setBrowseOpen] = React.useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [page, setPage] = React.useState<number>(1);

  React.useEffect(() => {
    setIconName(currentIconName ?? "");
  }, [currentIconName]);

  React.useEffect(() => {
    setGroupLabel(parentTitle);
  }, [parentTitle]);

  // Debounce group label updates by 500ms
  React.useEffect(() => {
    const trimmed = groupLabel.trim();
    if (!trimmed || trimmed === parentTitle) return;
    const handle = setTimeout(() => {
      onUpdateLabel(parentTitle, trimmed);
    }, 500);
    return () => clearTimeout(handle);
  }, [groupLabel, parentTitle, onUpdateLabel]);

  const canAddChild = Boolean(childLabel.trim()) && !Boolean(isAddingChild);

  const handleRemoveParent = React.useCallback(() => {
    onRemoveParent(parentTitle);
    setConfirmOpen(false);
  }, [onRemoveParent, parentTitle]);

  const confirmText = hasChildren
    ? `Remove “${parentTitle}” and all its children? This action cannot be undone.`
    : `Remove “${parentTitle}”? This action cannot be undone.`;

  // Lucide icons browse support
  const LucideIcons = Lucide as unknown as Record<
    string,
    import("lucide-react").LucideIcon
  >;
  const allLucideNames = React.useMemo(
    () => Object.keys(LucideIcons),
    [LucideIcons],
  );
  const categories = React.useMemo(
    () => [
      { key: "all", label: "All", matchers: [] as string[] },
      {
        key: "interface",
        label: "Interface",
        matchers: [
          "Settings",
          "Menu",
          "Home",
          "User",
          "Bell",
          "Search",
          "Star",
          "Heart",
          "Alert",
          "Calendar",
          "Clock",
        ],
      },
      {
        key: "commerce",
        label: "Commerce",
        matchers: [
          "Cart",
          "Bank",
          "Wallet",
          "CreditCard",
          "Coin",
          "Dollar",
          "Bitcoin",
          "Store",
        ],
      },
      {
        key: "maps",
        label: "Maps",
        matchers: ["Map", "Pin", "Location", "Navigation", "Globe", "Compass"],
      },
      {
        key: "text",
        label: "Text",
        matchers: ["Bold", "Italic", "Underline", "Align", "List", "Text"],
      },
      {
        key: "shapes",
        label: "Shapes",
        matchers: [
          "Square",
          "Circle",
          "Triangle",
          "Hexagon",
          "Octagon",
          "Diamond",
        ],
      },
    ],
    [],
  );
  const filteredNames = React.useMemo(() => {
    const search = iconSearch.trim().toLowerCase();
    const byCategory =
      selectedCategory === "all"
        ? allLucideNames
        : allLucideNames.filter(
            (n) =>
              categories
                .find((c) => c.key === selectedCategory)
                ?.matchers?.some((m) => n.includes(m)) ?? false,
          );
    return search
      ? byCategory.filter((n) => n.toLowerCase().includes(search))
      : byCategory;
  }, [iconSearch, selectedCategory, allLucideNames, categories]);
  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(filteredNames.length / pageSize));
  const pagedLucideNames = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredNames.slice(start, start + pageSize);
  }, [filteredNames, page]);
  const PreviewIcon: import("lucide-react").LucideIcon | undefined = iconName
    ? (LucideIcons[iconName] ?? undefined)
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuAction className={actionClassName}>
          <Settings />
          <span className="sr-only">Group settings</span>
        </SidebarMenuAction>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Group label</label>
            <Input
              placeholder="Group label"
              value={groupLabel}
              onChange={(e) => setGroupLabel(e.target.value)}
            />
          </div>
          {/* Icon editing for existing parent */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Icon</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="Lucide icon name (e.g. Settings)"
                  className="pl-8"
                />
                <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
              </div>
              <Popover open={browseOpen} onOpenChange={setBrowseOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Browse icons"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="ml-1">Browse</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="m-2 w-[480px]">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs">
                        Page {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {pagedLucideNames.map((name) => {
                      const IconComp: import("lucide-react").LucideIcon =
                        LucideIcons[name] ?? SquareTerminal;
                      return (
                        <button
                          key={name}
                          type="button"
                          className="hover:bg-muted flex flex-col items-center gap-1 rounded border p-2"
                          onClick={() => {
                            setIconName(name);
                            setIconSearch(name);
                            setBrowseOpen(false);
                          }}
                        >
                          <IconComp className="h-6 w-6" />
                          <span className="max-w-24 truncate text-[11px]">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                    {pagedLucideNames.length === 0 && (
                      <div className="text-muted-foreground col-span-5 py-6 text-center text-xs">
                        No icons found
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIconName("")}
              >
                Clear
              </Button>
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded border">
                {PreviewIcon ? (
                  <PreviewIcon className="h-4 w-4" />
                ) : (
                  <span className="text-[10px]">no</span>
                )}
              </span>
              <span>{PreviewIcon ? "Preview" : "No match"}</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  onUpdateIcon(
                    parentTitle,
                    iconName.trim() ? iconName.trim() : undefined,
                  )
                }
                disabled={false}
              >
                Set icon
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Add child</label>
            <div className="flex gap-2">
              <Input
                placeholder="Child label"
                value={childLabel}
                onChange={(e) => setChildLabel(e.target.value)}
              />
              <Button
                onClick={() => {
                  const trimmed = childLabel.trim();
                  if (!trimmed) return;
                  onAddChild(trimmed);
                  setChildLabel("");
                }}
                disabled={!canAddChild}
              >
                {isAddingChild ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
          <div className="border-t pt-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmOpen(true)}
              disabled={Boolean(isRemovingParent)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isRemovingParent ? "Removing..." : "Remove menu"}
            </Button>
          </div>
        </div>
      </PopoverContent>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove menu</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(isRemovingParent)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveParent}
              disabled={Boolean(isRemovingParent)}
            >
              {isRemovingParent ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>
  );
}
