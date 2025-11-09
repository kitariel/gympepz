"use client";
import * as React from "react";
import { Trash2, Settings } from "lucide-react";

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

export function ChildLabelEditorPopover({
  childLabel,
  onUpdateLabel,
  onRemoveChild,
  isRemovingChild,
  actionClassName = "right-7",
}: {
  childLabel: string;
  onUpdateLabel: (oldLabel: string, newLabel: string) => void;
  isUpdating?: boolean;
  onRemoveChild: (label: string) => void;
  isRemovingChild?: boolean;
  actionClassName?: string;
}) {
  const [label, setLabel] = React.useState(childLabel);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    setLabel(childLabel);
  }, [childLabel]);

  // Debounce label updates by 500ms
  React.useEffect(() => {
    const trimmed = label?.trim();
    if (!trimmed || trimmed === childLabel) return;
    const handle = setTimeout(() => {
      onUpdateLabel(childLabel, trimmed);
    }, 500);
    return () => clearTimeout(handle);
  }, [label, childLabel, onUpdateLabel]);

  const handleRemoveChild = React.useCallback(() => {
    onRemoveChild(childLabel);
    setConfirmOpen(false);
  }, [onRemoveChild, childLabel]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuAction className={actionClassName}>
          <Settings />
          <span className="sr-only">Child settings</span>
        </SidebarMenuAction>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Child label</label>
            <Input
              placeholder="Child label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="border-t pt-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmOpen(true)}
              disabled={Boolean(isRemovingChild)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isRemovingChild ? "Removing..." : "Remove item"}
            </Button>
          </div>
        </div>
      </PopoverContent>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove item</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &ldquo;{childLabel}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(isRemovingChild)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveChild}
              disabled={Boolean(isRemovingChild)}
            >
              {isRemovingChild ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Popover>
  );
}
