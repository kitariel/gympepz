"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyDaySlotContentProps {
  dayName: string;
  onAddDay: () => void;
  isCurrentDay?: boolean;
  isOver?: boolean;

  // Style & DnD props
  innerRef?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
  className?: string;
}

export function EmptyDaySlotContent({
  dayName,
  onAddDay,
  isCurrentDay = false,
  isOver = false,
  innerRef,
  style,
  className,
}: EmptyDaySlotContentProps) {
  return (
    <Card
      ref={innerRef}
      style={style}
      className={cn(
        "group relative flex w-full shrink-0 cursor-pointer flex-col transition-all md:w-[340px]",
        "h-auto min-h-[200px] md:h-[calc(100vh-265px)] md:max-h-[685px] md:min-h-[515px]",
        "rounded-xl border border-dashed",
        "md:rounded-none md:border-y-0! md:border-t-0! md:border-r-2 md:border-b-0! md:border-l-2",
        "border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-border/50",
        isOver && "border-primary/50 bg-primary/5 scale-[1.01] border-solid",
        isCurrentDay && "border-primary/50 bg-primary/2",
        className,
      )}
      onClick={onAddDay}
    >
      <CardHeader
        className={cn(
          "shrink-0 px-6 pt-5 pb-4",
          isCurrentDay && "bg-primary/2",
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-muted-foreground/70 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-colors",
              "group-hover:text-muted-foreground",
              isCurrentDay && "text-primary",
            )}
          >
            {dayName}
          </span>
          {isCurrentDay && (
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground shrink-0 rounded-md border-0 px-2 py-0.5 text-[9px] font-semibold shadow-sm"
            >
              Today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10">
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-300",
            "bg-muted/40 group-hover:bg-muted/60",
            isOver && "bg-primary/10 scale-105",
          )}
        >
          <Plus
            className={cn(
              "h-8 w-8 transition-colors",
              "text-muted-foreground/60 group-hover:text-muted-foreground",
              isOver && "text-primary",
            )}
          />
        </div>
        <div className="space-y-2 text-center">
          <p
            className={cn(
              "text-sm font-bold transition-colors",
              "text-foreground/70 group-hover:text-foreground",
              isOver && "text-primary",
            )}
          >
            {isOver ? "Drop Day Here" : "Add Workout Day"}
          </p>
          <p className="text-muted-foreground/60 text-xs font-medium">
            Click to create a new workout
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
