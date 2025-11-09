"use client";
import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { MenuCreateType } from "@/types/menu";

export function AddMenuPopover({
  onAdd,
  isCreating,
}: {
  onAdd: (label: string, type: MenuCreateType) => void;
  isCreating?: boolean;
}) {
  const [label, setLabel] = React.useState("");
  const [type, setType] = React.useState<MenuCreateType>("single");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="outline" aria-label="Add menu">
          <Plus className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
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
          <Button
            onClick={() => onAdd(label.trim(), type)}
            disabled={!label.trim() || Boolean(isCreating)}
          >
            {isCreating ? "Adding..." : "Add menu"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}