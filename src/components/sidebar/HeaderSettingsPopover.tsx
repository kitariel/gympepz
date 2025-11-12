"use client";
import * as React from "react";
import * as Lucide from "lucide-react";
import * as HeroOutline from "@heroicons/react/24/outline";
import {
  Settings,
  LayoutGrid,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SidebarMenuAction } from "@/components/ui/sidebar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { IconPlatform } from "@/types/menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export function HeaderSettingsPopover({
  config,
  onUpdate,
  actionClassName = "right-7",
}: {
  config: {
    title: string;
    subtitle?: string;
    iconName?: string;
    iconPlatform?: IconPlatform;
  };
  onUpdate: (next: {
    title: string;
    subtitle?: string;
    iconName?: string;
    iconPlatform?: IconPlatform;
  }) => void;
  actionClassName?: string;
}) {
  const [title, setTitle] = React.useState<string>(config.title);
  const [subtitle, setSubtitle] = React.useState<string>(config.subtitle ?? "");
  const [iconPlatform, setIconPlatform] = React.useState<IconPlatform>(
    config.iconPlatform ?? "lucide",
  );
  const [iconName, setIconName] = React.useState<string>(config.iconName ?? "");

  React.useEffect(() => {
    setTitle(config.title);
    setSubtitle(config.subtitle ?? "");
    setIconPlatform(config.iconPlatform ?? "lucide");
    setIconName(config.iconName ?? "");
  }, [config]);

  // No auto-update. User must click "Save now" to persist changes.
  // We keep local state synced with incoming config via the effect above, but do not auto-save.

  // Icon browse and search state and derived data (same UX as menu popovers)
  const [iconSearch, setIconSearch] = React.useState<string>("");
  const [browseOpen, setBrowseOpen] = React.useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [page, setPage] = React.useState<number>(0);

  const Outline = HeroOutline as unknown as Record<string, HeroIcon>;
  const LucideIcons = Lucide as unknown as Record<
    string,
    React.ComponentType<React.SVGProps<SVGSVGElement>>
  >;

  const allLucideNames = React.useMemo(() => {
    return Object.keys(Lucide as unknown as Record<string, unknown>).filter(
      (k) => /^[A-Z]/.test(k) && k !== "LucideIcon",
    );
  }, []);
  const allHeroNames = React.useMemo(() => Object.keys(Outline), [Outline]);

  const categories: { key: string; label: string; matchers?: string[] }[] = [
    { key: "all", label: "All" },
    { key: "arrows", label: "Arrows", matchers: ["Arrow", "Chevron"] },
    {
      key: "media",
      label: "Media",
      matchers: [
        "Play",
        "Pause",
        "Stop",
        "Video",
        "Music",
        "Mic",
        "Headphones",
        "Volume",
        "Camera",
      ],
    },
    {
      key: "files",
      label: "Files",
      matchers: ["File", "Folder", "Archive", "Book", "Notebook", "Clipboard"],
    },
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
  ];

  const PAGE_SIZE = 25;
  const filteredNames = React.useMemo(() => {
    const names = iconPlatform === "lucide" ? allLucideNames : allHeroNames;
    const term = iconSearch.trim().toLowerCase();
    const currentCat = categories.find((c) => c.key === selectedCategory);
    const matchers = currentCat?.matchers;
    const byCategory = (name: string) => {
      if (selectedCategory === "all" || !matchers) return true;
      return matchers.some((m) => name.includes(m));
    };
    const namesByCat = names.filter((n) => byCategory(n));
    if (!term) return namesByCat;
    return namesByCat.filter((n) => n.toLowerCase().includes(term));
  }, [
    allLucideNames,
    allHeroNames,
    iconSearch,
    selectedCategory,
    iconPlatform,
  ]);
  const totalPages = Math.max(1, Math.ceil(filteredNames.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages - 1);
  const pagedNames = filteredNames.slice(
    pageSafe * PAGE_SIZE,
    pageSafe * PAGE_SIZE + PAGE_SIZE,
  );
  React.useEffect(() => {
    setPage(0);
  }, [iconSearch, selectedCategory, iconPlatform]);

  const PreviewIcon: SidebarIcon | undefined = iconName
    ? iconPlatform === "heroicons"
      ? Outline[iconName]
      : LucideIcons[iconName]
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuAction className={actionClassName}>
          <Settings />
          <span className="sr-only">Header settings</span>
        </SidebarMenuAction>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Company or site name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Subtitle (optional)</label>
            <Input
              placeholder="e.g. Enterprise"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Icon Platform</label>
            <RadioGroup
              className="flex gap-4"
              value={iconPlatform}
              onValueChange={(val) => {
                if (val === "lucide" || val === "heroicons") {
                  setIconPlatform(val);
                }
              }}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="lucide" id="header-lucide" />
                <label htmlFor="header-lucide">Lucide</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="heroicons" id="header-heroicons" />
                <label htmlFor="header-heroicons">Heroicons</label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Search icons</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={iconSearch}
                  onChange={(e) => {
                    setIconSearch(e.target.value);
                    setIconName(e.target.value);
                  }}
                  placeholder={
                    iconPlatform === "lucide"
                      ? "Lucide icon name"
                      : "Heroicon name"
                  }
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
                <PopoverContent align="end" className="my-2 w-[480px]">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Category:{" "}
                          {categories.find((c) => c.key === selectedCategory)
                            ?.label ?? "All"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {categories.map((cat) => (
                          <DropdownMenuItem
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                          >
                            {cat.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={pageSafe <= 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span>
                        Page {pageSafe + 1} of {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={pageSafe >= totalPages - 1}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {pagedNames.map((name) => {
                      const IconComp =
                        iconPlatform === "lucide"
                          ? ((LucideIcons[name] ??
                              undefined) as unknown as React.ComponentType<{
                              className?: string;
                            }>)
                          : ((Outline[name] ??
                              undefined) as unknown as React.ComponentType<{
                              className?: string;
                            }>);
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
                          {IconComp ? (
                            <IconComp className="h-6 w-6" />
                          ) : (
                            <span className="text-[10px]">no</span>
                          )}
                          <span className="max-w-24 truncate text-[11px]">
                            {name}
                          </span>
                        </button>
                      );
                    })}
                    {pagedNames.length === 0 && (
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
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              {PreviewIcon ? (
                <PreviewIcon className="size-4" />
              ) : (
                <span className="text-xs">No icon</span>
              )}
            </div>
            <div className="grid text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {title || "Untitled"}
              </span>
              {subtitle ? (
                <span className="truncate text-xs">{subtitle}</span>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end border-t pt-3">
            <Button
              variant="secondary"
              onClick={() => {
                const normalized = {
                  title: title.trim() || config.title,
                  subtitle: subtitle.trim() || undefined,
                  iconName: iconName.trim() || undefined,
                  iconPlatform,
                };
                onUpdate(normalized);
              }}
            >
              Save now
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
