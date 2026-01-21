"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ open, onOpenChange, children, title }: BottomSheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className={cn(
          "bg-background fixed right-0 bottom-0 left-0 z-50 rounded-t-2xl shadow-lg",
          "animate-in slide-in-from-bottom duration-300",
          "pb-[calc(env(safe-area-inset-bottom)+16px)]"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        {title ? (
          <div className="flex items-center justify-between px-4 pb-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        ) : null}

        {/* Content */}
        <div className="px-4 pb-4">{children}</div>
      </div>
    </>
  );
}
