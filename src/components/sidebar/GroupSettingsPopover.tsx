"use client";
import * as React from "react";
import { Settings, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  hasChildren?: boolean;
  actionClassName?: string;
}) {
  const [groupLabel, setGroupLabel] = React.useState(parentTitle);
  const [childLabel, setChildLabel] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

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
            <AlertDialogAction onClick={handleRemoveParent} disabled={Boolean(isRemovingParent)}>
              {isRemovingParent ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>
  );
}