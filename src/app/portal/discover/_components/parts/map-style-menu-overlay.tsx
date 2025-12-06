"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Layers, Check } from "lucide-react";

export type MapStyle = { id: string; name: string; url: string };

export function MapStyleMenuOverlay({
  styles,
  selectedStyleId,
  syncTheme,
  onSelectStyle,
  onToggleSyncTheme,
}: {
  styles: MapStyle[];
  selectedStyleId: string;
  syncTheme: boolean;
  onSelectStyle: (id: string) => void;
  onToggleSyncTheme: (v: boolean) => void;
}) {
  return (
    <div className="absolute top-2 left-12 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm">
            <Layers className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {styles.map((s) => (
            <DropdownMenuItem
              key={s.id}
              onClick={() => onSelectStyle(s.id)}
            >
              {s.name}
              {!syncTheme && selectedStyleId === s.id ? (
                <Check className="ml-auto h-4 w-4" />
              ) : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={syncTheme}
            onCheckedChange={(v) => onToggleSyncTheme(Boolean(v))}
          >
            Sync with Theme
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}