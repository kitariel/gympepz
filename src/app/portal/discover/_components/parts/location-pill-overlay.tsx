"use client";

import { Button } from "@/components/ui/button";

export function LocationPillOverlay({
  label,
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  if (!label) return null;
  return (
    <div className="absolute top-2 right-20 z-10">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full px-3 py-1 text-xs"
        onClick={onClick}
      >
        {label}
      </Button>
    </div>
  );
}