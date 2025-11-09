"use client";
import * as React from "react";
import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarMenuAction } from "@/components/ui/sidebar";

export function AddChildPopover({
  parentTitle,
  onAddChild,
  isAdding,
  actionClassName = "right-7",
}: {
  parentTitle: string;
  onAddChild: (label: string) => void;
  isAdding?: boolean;
  actionClassName?: string;
}) {
  const [label, setLabel] = React.useState("");

  const canSubmit = Boolean(label.trim()) && !Boolean(isAdding);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuAction className={actionClassName}>
          <Plus />
          <span className="sr-only">Add child</span>
        </SidebarMenuAction>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <div className="grid gap-2">
          <Input
            placeholder="Child label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Button
            onClick={() => {
              const trimmed = label.trim();
              if (!trimmed) return;
              onAddChild(trimmed);
              setLabel("");
            }}
            disabled={!canSubmit}
          >
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}