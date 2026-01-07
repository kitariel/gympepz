"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  GripVertical,
  Dumbbell,
  Pencil,
  Copy,
  MoreVertical,
  Plus,
  Trash2,
  ArrowRight,
  Moon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanDay, Plan } from "../_types";

interface DayCardContentProps {
  dayData: PlanDay;
  dayName: string;
  onEditDay: (dayId: string) => void;
  onSaveDayTitle: (dayId: string) => void;
  onCancelEdit: () => void;
  onDeleteDay: (dayId: string) => void;
  onDuplicateDay: (dayId: string) => void;
  onOpenCopyDialog: (dayId: string) => void;
  onOpenDrawer: (dayId: string) => void;
  onToggleRestDay: (dayId: string) => void;
  editingDayId: string | null;
  editingDayTitle: string;
  onEditingDayTitleChange: (title: string) => void;
  updateDay: { isPending: boolean };
  isCurrentDay?: boolean;

  // Style & DnD props
  style?: React.CSSProperties;
  className?: string;
  dragHandle?: React.ReactNode;
}

export function DayCardContent({
  dayData,
  dayName,
  onEditDay,
  onSaveDayTitle,
  onCancelEdit,
  onDeleteDay,
  onDuplicateDay,
  onOpenCopyDialog,
  onOpenDrawer,
  onToggleRestDay,
  editingDayId,
  editingDayTitle,
  onEditingDayTitleChange,
  updateDay,
  isCurrentDay = false,
  style,
  className,
  dragHandle,
}: DayCardContentProps) {
  const totalSets = (dayData.items ?? []).reduce(
    (sum: number, item) => sum + (item.sets ?? 0),
    0,
  );

  return (
    <Card
      style={style}
      className={cn(
        "group relative flex w-full shrink-0 flex-col md:w-[340px]",
        "h-auto min-h-[300px] md:h-[calc(100vh-265px)] md:max-h-[685px] md:min-h-[515px]",
        "bg-card/50 rounded-xl border backdrop-blur-sm",
        "md:rounded-none md:border-y-0! md:border-t-0! md:border-r-2 md:border-b-0! md:border-l-2",
        "transition-all duration-300",
        "border-border/90 hover:border-border/60 hover:bg-card",
        "group-data-[dragging]:ring-primary/40 group-data-[dragging]:z-50 group-data-[dragging]:scale-95 group-data-[dragging]:rotate-1 group-data-[dragging]:opacity-50 group-data-[dragging]:ring-2",
        isCurrentDay && "border-primary/50 bg-primary/5 ring-primary/20 ring-1",
        "shadow-none!",
        className,
      )}
      onClick={(e) => {
        // Only open drawer if click was not on interactive elements
        const target = e.target as HTMLElement;
        if (
          !target.closest("[data-drag-handle]") &&
          !target.closest("button") &&
          !target.closest('[role="menuitem"]') &&
          !target.closest("input") &&
          !document.querySelector("[data-dragging]")?.contains(target)
        ) {
          onOpenDrawer(dayData.id);
        }
      }}
    >
      <CardHeader
        className={cn(
          "shrink-0 px-6 pt-5 pb-4 transition-colors duration-200",
          "bg-card",
          isCurrentDay && "bg-primary/2",
        )}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={cn(
                "text-muted-foreground/70 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase",
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
            {dayData.isRestDay && (
              <Badge
                variant="secondary"
                className="bg-muted/80 text-muted-foreground flex shrink-0 items-center gap-1 rounded-md border-0 px-2 py-0.5 text-[9px] font-semibold shadow-sm"
              >
                <Moon className="h-2.5 w-2.5" />
                Rest Day
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {/* Drag Handle - Only visible if dragHandle is provided */}
            {dragHandle}

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted h-8 w-8 rounded-md opacity-0 transition-all duration-200 group-hover:opacity-100"
                >
                  <MoreVertical className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[180px] rounded-xl border shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => {
                    onToggleRestDay(dayData.id);
                  }}
                  className="rounded-lg"
                >
                  {dayData.isRestDay ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Remove Rest Day
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Mark as Rest Day
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDuplicateDay(dayData.id)}
                  className="rounded-lg"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Day
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onOpenCopyDialog(dayData.id)}
                  className="rounded-lg"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Exercises To...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteDay(dayData.id)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Day
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Day Title - Editable */}
        {editingDayId === dayData.id ? (
          <div className="mt-2 flex flex-col gap-3">
            <Input
              value={editingDayTitle}
              onChange={(e) => onEditingDayTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editingDayTitle.trim()) {
                  onSaveDayTitle(dayData.id);
                } else if (e.key === "Escape") {
                  onCancelEdit();
                }
              }}
              className="focus:border-primary h-11 rounded-xl border text-base font-bold shadow-sm transition-colors"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-9 rounded-lg px-4 text-xs font-semibold"
                onClick={() => onSaveDayTitle(dayData.id)}
                disabled={updateDay.isPending ?? !editingDayTitle.trim()}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-lg px-4 text-xs font-semibold"
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="group/title mt-2 flex items-start justify-between gap-2">
            <CardTitle
              className="hover:text-foreground/80 line-clamp-2 cursor-pointer text-[22px] leading-tight font-bold tracking-tight transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDrawer(dayData.id);
              }}
            >
              {dayData.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted/50 h-8 w-8 shrink-0 rounded-lg opacity-0 transition-all group-hover/title:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onEditDay(dayData.id);
              }}
            >
              <Pencil className="text-muted-foreground h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Stats - Clean Design */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-2xl font-bold tabular-nums">
              {dayData.items?.length ?? 0}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              exercises
            </span>
          </div>
          <div className="bg-border/30 h-4 w-px" />
          <div className="flex items-center gap-2">
            <span className="text-foreground text-2xl font-bold tabular-nums">
              {totalSets}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              sets
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Scrollable Exercise List - Connected Card Style */}
      <CardContent className="scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent min-h-0 flex-1 overflow-y-auto px-5 py-3">
        <div className="space-y-2.5">
          {dayData.isRestDay ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-primary/10 border-primary/20 mb-5 flex h-24 w-24 items-center justify-center rounded-2xl border-2">
                <Moon className="text-primary/70 h-12 w-12" />
              </div>
              <span className="text-foreground mb-2 text-base font-bold">
                Rest Day
              </span>
              <p className="text-muted-foreground mb-6 max-w-[220px] text-xs">
                Take time to recover and let your muscles heal
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-lg text-xs font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRestDay(dayData.id);
                }}
              >
                <X className="h-4 w-4" />
                Remove Rest Day
              </Button>
            </div>
          ) : (dayData.items ?? []).length > 0 ? (
            (dayData.items ?? []).map((item) => (
              <div
                key={item.id}
                className="group/item bg-card hover:bg-muted/30 relative cursor-pointer rounded-t-2xl border-0 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDrawer(dayData.id);
                }}
              >
                {/* Card Content */}
                <div className="p-4 pb-6">
                  {/* Exercise Name and Muscle Group */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-foreground mb-1 line-clamp-2 text-base leading-tight font-bold">
                        {item.exercise?.name ?? "Exercise"}
                      </h4>
                      {item.exercise?.muscleGroup && (
                        <p className="text-muted-foreground text-xs font-medium">
                          {item.exercise.muscleGroup}
                        </p>
                      )}
                    </div>
                    <div className="text-muted-foreground/40 group-hover/item:text-muted-foreground/60 flex shrink-0 items-center gap-1 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Metrics with Labels */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground text-lg font-bold tabular-nums">
                        {item.sets}
                      </span>
                      <span className="text-muted-foreground text-xs font-medium">
                        sets
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground text-lg font-bold tabular-nums">
                        {item.reps ?? 0}
                      </span>
                      <span className="text-muted-foreground text-xs font-medium">
                        reps
                      </span>
                    </div>
                    {item.weight && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground text-lg font-bold tabular-nums">
                          {item.weight}
                        </span>
                        <span className="text-muted-foreground text-xs font-medium">
                          kg
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom connection bar */}
                <div className="from-primary/20 via-primary/40 to-primary/20 absolute right-0 bottom-0 left-0 h-1 bg-linear-to-r" />
              </div>
            ))
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted/30 mb-5 flex h-20 w-20 items-center justify-center rounded-2xl">
                <Dumbbell className="text-muted-foreground/40 h-9 w-9" />
              </div>
              <span className="text-foreground/80 mb-2 text-sm font-semibold">
                No exercises yet
              </span>
              <p className="text-muted-foreground mb-5 max-w-[220px] text-xs">
                Is this a rest day or would you like to add exercises?
              </p>
              <div className="flex w-full flex-col gap-2 px-6">
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 w-full gap-2 rounded-lg text-xs font-semibold shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDrawer(dayData.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Exercise
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full gap-2 rounded-lg text-xs font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRestDay(dayData.id);
                  }}
                >
                  <Moon className="h-4 w-4" />
                  Mark as Rest Day
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
