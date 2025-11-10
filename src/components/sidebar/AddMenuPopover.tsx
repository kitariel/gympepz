"use client";
import * as React from "react";
import {
  Plus,
  LayoutGrid,
  Search,
  ChevronLeft,
  ChevronRight,
  SquareTerminal,
} from "lucide-react";
import * as Lucide from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MenuCreateType } from "@/types/menu";
import { Label } from "@radix-ui/react-dropdown-menu";

export function AddMenuPopover({
  onAdd,
  isCreating,
}: {
  onAdd: (label: string, type: MenuCreateType, iconName?: string) => void;
  isCreating?: boolean;
}) {
  const [label, setLabel] = React.useState("");
  const [type, setType] = React.useState<MenuCreateType>("single");
  const [iconPlatform, setIconPlatform] = React.useState<
    "lucide" | "heroicons"
  >("lucide");
  const [iconName, setIconName] = React.useState<string>("");
  const [iconSearch, setIconSearch] = React.useState<string>("");
  const [browseOpen, setBrowseOpen] = React.useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [page, setPage] = React.useState<number>(0);

  const LucideIcons = Lucide as unknown as Record<
    string,
    import("lucide-react").LucideIcon
  >;
  const allLucideNames = React.useMemo(() => {
    return Object.keys(LucideIcons).filter(
      (k) => /^[A-Z]/.test(k) && k !== "LucideIcon",
    );
  }, [LucideIcons]);

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

  const filteredLucideNames = React.useMemo(() => {
    const term = iconSearch.trim().toLowerCase();
    const currentCat = categories.find((c) => c.key === selectedCategory);
    const matchers = currentCat?.matchers;
    const byCategory = (name: string) => {
      if (selectedCategory === "all" || !matchers) return true;
      return matchers.some((m) => name.includes(m));
    };
    const names = allLucideNames.filter((n) => byCategory(n));
    if (!term) return names;
    return names.filter((n) => n.toLowerCase().includes(term));
  }, [allLucideNames, iconSearch, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLucideNames.length / PAGE_SIZE),
  );
  const pageSafe = Math.min(page, totalPages - 1);
  const pagedLucideNames = filteredLucideNames.slice(
    pageSafe * PAGE_SIZE,
    pageSafe * PAGE_SIZE + PAGE_SIZE,
  );

  React.useEffect(() => {
    // Reset pagination when filters change
    setPage(0);
  }, [iconSearch, selectedCategory]);

  const PreviewIcon: import("lucide-react").LucideIcon | null =
    iconPlatform === "lucide" && iconName && LucideIcons[iconName]
      ? LucideIcons[iconName]
      : null;

  const canSubmit = Boolean(label.trim()) && !isCreating;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="w-full"
          size="icon"
          variant="outline"
          aria-label="Add menu"
        >
          {/* LABEL */}
          <Plus className="size-4" />
          <Label className="text-sm font-medium">Add menu</Label>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" className="m-2 w-80">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Menu label"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Type</label>
            <RadioGroup
              value={type}
              onValueChange={(val) => setType(val as MenuCreateType)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="type-single" value="single" />
                <label htmlFor="type-single" className="text-sm">
                  Single
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem id="type-group" value="group" />
                <label htmlFor="type-group" className="text-sm">
                  Group
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Icon platform selection */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Icon platform</label>
            <RadioGroup
              value={iconPlatform}
              onValueChange={(val) =>
                setIconPlatform(val as "lucide" | "heroicons")
              }
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem id="icon-lucide" value="lucide" />
                <label htmlFor="icon-lucide" className="text-sm">
                  Lucide
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id="icon-heroicons"
                  value="heroicons"
                  disabled
                />
                <label htmlFor="icon-heroicons" className="text-sm">
                  Heroicons (soon)
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Icon name input and preview for Lucide */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Icon name</label>
            <Input
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder={
                iconPlatform === "lucide"
                  ? "e.g. SquareTerminal, Settings"
                  : "Select Lucide for now"
              }
            />
            {iconPlatform === "lucide" && (
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
            )}
          </div>

          {/* Icon search and browse */}
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
                  placeholder="Search by name"
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
                <PopoverContent align="end" className="w-[480px]">
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

          <Button
            onClick={() => {
              const chosenIcon =
                iconPlatform === "lucide" && iconName.trim()
                  ? iconName.trim()
                  : undefined;
              onAdd(label.trim(), type, chosenIcon);
            }}
            disabled={!canSubmit}
          >
            {isCreating ? "Adding..." : "Add menu"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
