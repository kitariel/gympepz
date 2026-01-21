"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  ProgramOverviewViewProps,
  ProgramOverviewSelectedDay,
} from "./ProgramOverview.types";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

type ReadyProps = Extract<ProgramOverviewViewProps, { kind: "ready" }>;

function HorizontalWeekPicker({
  week,
  selectedDay,
  onSelectedDayChange,
}: {
  week: ReadyProps["week"];
  selectedDay: ProgramOverviewSelectedDay;
  onSelectedDayChange: (value: ProgramOverviewSelectedDay) => void;
}) {
  const effectiveDay = selectedDay === "auto" ? null : selectedDay;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Week</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectedDayChange("auto")}
          className={cn(
            "h-7 text-xs",
            selectedDay === "auto" && "text-primary",
          )}
        >
          Auto
        </Button>
      </div>

      <div className="flex gap-2">
        {week.map((day, idx) => {
          const isSelected = day.dayIndex === effectiveDay;
          const isRestDay = day.exercisesCount === 0;

          return (
            <button
              key={day.dayIndex}
              onClick={() => onSelectedDayChange(day.dayIndex)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-3 transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : isRestDay
                    ? "bg-muted/50 text-muted-foreground"
                    : "bg-muted hover:bg-muted/80",
              )}
            >
              <span className="text-[10px] font-medium uppercase">
                {WEEKDAY_LABELS[idx]}
              </span>
              <span
                className={cn(
                  "text-lg font-bold",
                  isRestDay && !isSelected && "text-muted-foreground/50",
                )}
              >
                {isRestDay ? "R" : day.dayIndex}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayDetailsAccordion({
  week,
  selectedDay,
  onSelectedDayChange,
}: {
  week: ReadyProps["week"];
  selectedDay: ProgramOverviewSelectedDay;
  onSelectedDayChange: (value: ProgramOverviewSelectedDay) => void;
}) {
  const [expandedDay, setExpandedDay] = useState<number | null>(
    selectedDay === "auto" ? null : selectedDay,
  );

  return (
    <div className="space-y-2">
      {week.map((day) => {
        const isExpanded = expandedDay === day.dayIndex;
        const isRestDay = day.exercisesCount === 0;

        return (
          <Card key={day.dayIndex} elevation="subtle">
            <CardContent className="p-0">
              <button
                onClick={() => {
                  setExpandedDay(isExpanded ? null : day.dayIndex);
                  if (!isExpanded) {
                    onSelectedDayChange(day.dayIndex);
                  }
                }}
                className="flex w-full items-center justify-between p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                      isRestDay
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {isRestDay ? "R" : day.dayIndex}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{day.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {isRestDay
                        ? "Rest day"
                        : `${day.exercisesCount} exercises`}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground h-4 w-4 transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function ProgramOverviewView(props: ProgramOverviewViewProps) {
  const [repeatPromptOpen, setRepeatPromptOpen] = useState(false);

  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-muted h-32 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (props.kind === "noProgram") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            No active program
          </h1>
          <p className="text-muted-foreground">
            Select a template to generate your program.
          </p>
        </div>
        <Button className="touch-target h-12" onClick={props.onBrowseTemplates}>
          Browse templates
        </Button>
      </div>
    );
  }

  const {
    programName,
    selectedDay,
    onSelectedDayChange,
    onClearProgram,
    picked,
    week,
    primaryCtaText,
    onPrimaryCta,
    repeatPromptEnabled,
    onConfirmRepeat,
  } = props;

  const handlePrimary = () => {
    if (repeatPromptEnabled) {
      setRepeatPromptOpen(true);
      return;
    }
    onPrimaryCta();
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm">{programName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Active</Badge>
          <Button variant="outline" size="sm" onClick={onClearProgram}>
            Clear
          </Button>
        </div>
      </div>

      {/* Hero card for today's workout */}
      {picked ? (
        <Card elevation="hero" className="animate-fade-up overflow-hidden">
          <CardContent className="relative space-y-4 p-5">
            <div className="bg-primary/10 absolute -top-8 -right-8 h-32 w-32 rounded-full" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {picked.title}
                  </Badge>
                  <p className="text-lg font-semibold">{picked.label}</p>
                  <p className="text-muted-foreground text-sm">
                    {picked.items.length} exercises
                  </p>
                </div>
                <div className="bg-primary/15 text-primary flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold">
                  {picked.dayIndex}
                </div>
              </div>
            </div>

            {/* Exercise preview */}
            <div className="space-y-1.5">
              {picked.items.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-background/50 flex items-center justify-between rounded-lg px-3 py-2"
                >
                  <span className="truncate text-sm">{item.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {item.setsText}
                  </span>
                </div>
              ))}
              {picked.items.length > 4 ? (
                <p className="text-muted-foreground px-3 text-xs">
                  +{picked.items.length - 4} more
                </p>
              ) : null}
            </div>

            <Button
              className="touch-target h-12 w-full text-base font-semibold"
              onClick={handlePrimary}
            >
              <Play className="mr-2 h-5 w-5" />
              {primaryCtaText}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Horizontal week picker */}
      <HorizontalWeekPicker
        week={week}
        selectedDay={selectedDay}
        onSelectedDayChange={onSelectedDayChange}
      />

      {/* Day details accordion */}
      <DayDetailsAccordion
        week={week}
        selectedDay={selectedDay}
        onSelectedDayChange={onSelectedDayChange}
      />

      {/* Bottom actions */}
      <div className="flex gap-3">
        <Button asChild variant="outline" className="h-10 flex-1">
          <Link href="/train/templates">Change program</Link>
        </Button>
      </div>

      {/* Repeat workout dialog */}
      <AlertDialog open={repeatPromptOpen} onOpenChange={setRepeatPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Workout already completed</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve already finished a workout today. It&apos;s usually
              better to rest and recover, but you can repeat if you feel good.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Take a rest day</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setRepeatPromptOpen(false);
                onConfirmRepeat();
              }}
            >
              Repeat workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
