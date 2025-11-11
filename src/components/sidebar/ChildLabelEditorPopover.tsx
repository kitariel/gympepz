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
  // New: URL editing support
  currentUrl,
  onUpdateUrl,
}: {
  childLabel: string;
  onUpdateLabel: (oldLabel: string, newLabel: string) => void;
  isUpdating?: boolean;
  onRemoveChild: (label: string) => void;
  isRemovingChild?: boolean;
  actionClassName?: string;
  // New: URL editing support
  currentUrl?: string;
  onUpdateUrl?: (label: string, url: string) => void;
}) {
  const [label, setLabel] = React.useState(childLabel);
  const [url, setUrl] = React.useState<string>(currentUrl ?? "#");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    setLabel(childLabel);
  }, [childLabel]);

  React.useEffect(() => {
    setUrl(currentUrl ?? "#");
  }, [currentUrl]);

  // Remove auto-save: manual Save button will persist changes
  const handleSave = React.useCallback(() => {
    const trimmedLabel = label?.trim();
    const trimmedUrl = url?.trim();
    if (trimmedLabel && trimmedLabel !== childLabel) {
      onUpdateLabel(childLabel, trimmedLabel);
    }
    if (onUpdateUrl && trimmedUrl && trimmedUrl !== (currentUrl ?? "#")) {
      onUpdateUrl(childLabel, trimmedUrl);
    }
  }, [label, url, childLabel, currentUrl, onUpdateLabel, onUpdateUrl]);

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
          <div className="grid gap-2">
            <label className="text-sm font-medium">Child URL</label>
            <Input
              placeholder="https://example.com/path or /path"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="border-t pt-3 flex justify-end">
            <Button variant="secondary" onClick={handleSave}>Save changes</Button>
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
