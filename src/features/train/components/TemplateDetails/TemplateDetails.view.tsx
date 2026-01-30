"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, Dumbbell, ChevronRight } from "lucide-react";
import type { TemplateDetailsViewProps, TemplateDetailsSchedulePrompt } from "./TemplateDetails.types";
import { TemplateCalendarPreview } from "./TemplateCalendarPreview";

// Separate component for the schedule dialog to ensure type safety
function ScheduleDialog({ prompt }: { prompt: TemplateDetailsSchedulePrompt }) {
  return (
    <Dialog open={prompt.open} onOpenChange={prompt.onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize your schedule</DialogTitle>
          <DialogDescription>
            This program is built for {prompt.daysPerWeek} days per week. Today is{" "}
            {prompt.todayLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant={prompt.mode === "default" ? "default" : "outline"}
              onClick={() => prompt.onModeChange("default")}
              className="h-11"
            >
              Use default schedule
            </Button>
            <Button
              type="button"
              variant={prompt.mode === "custom" ? "default" : "outline"}
              onClick={() => prompt.onModeChange("custom")}
              className="h-11"
            >
              Start today
            </Button>
          </div>

          {prompt.mode === "default" ? (
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">Default training days</p>
              <p className="text-muted-foreground mt-1">
                {prompt.defaultDays.map((day) => day.label).join(" • ")}
              </p>
              <Button className="mt-3 h-10 w-full" onClick={prompt.onConfirmDefault}>
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-2">
                {prompt.allDays.map((day) => {
                  const selected = prompt.selectedDays.includes(day.value);
                  return (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      onClick={() => prompt.onToggleDay(day.value)}
                      className={cn("h-9 px-0 text-xs", selected && "shadow-sm")}
                    >
                      {day.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-muted-foreground text-xs">
                Select {prompt.daysPerWeek} days, including {prompt.todayLabel}.
              </p>
              <Button
                className="h-10 w-full"
                onClick={prompt.onConfirmCustom}
                disabled={!prompt.customValid}
              >
                Save custom schedule
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TemplateDetailsView(props: TemplateDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "calendar">("overview");

  if (props.kind === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
        <Button asChild variant="ghost" size="sm" className="h-8 px-2">
          <Link href={props.backHref}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to templates
          </Link>
        </Button>
        <div className="space-y-3">
          <div className="bg-muted h-8 w-64 animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
        </div>
        <Card className="border-dashed">
          <CardContent className="p-8">
            <div className="space-y-3">
              <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-5/6 animate-pulse rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (props.kind === "notFound") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
        <Button asChild variant="ghost" size="sm" className="h-8 px-2">
          <Link href={props.backHref}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to templates
          </Link>
        </Button>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Template not found</h1>
            <p className="text-sm text-muted-foreground mb-4">
              This template may have been removed or doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href={props.backHref}>Browse templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 pt-4">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="h-8 px-2">
        <Link href={props.backHref}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{props.name}</h1>
            <p className="text-sm text-muted-foreground">{props.description}</p>
            {props.offlineNotice ? (
              <p className="text-xs font-medium text-amber-600">{props.offlineNotice}</p>
            ) : null}
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Calendar className="h-3 w-3" />
            {props.daysPerWeek} days/wk
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "calendar")}>
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1">
            Calendar Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Weekly Structure */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Dumbbell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Weekly Structure</h2>
            </div>

            <div className="space-y-3">
              {props.days.map((day, index) => (
                <Card
                  key={day.label}
                  className="overflow-hidden transition-all hover:shadow-md border-border/50"
                >
                  <CardContent className="p-0">
                    {/* Day Header */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{day.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {day.items.length} exercise{day.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        Day {day.dayIndex}
                      </Badge>
                    </div>

                    {/* Exercises List */}
                    <div className="divide-y divide-border/50">
                      {day.items.map((item, idx) => (
                        <div
                          key={`${day.dayIndex}-${idx}`}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-muted-foreground w-5 shrink-0">
                              {idx + 1}.
                            </span>
                            <span className="text-sm truncate">{item.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 bg-muted/50 px-2 py-0.5 rounded">
                            {item.setsText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 w-full">
              <TemplateCalendarPreview template={props.template} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row pt-2">
        <Button className="h-11 flex-1" onClick={props.onUse}>
          Use this program
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        <Button asChild variant="outline" className="h-11 flex-1">
          <Link href={props.backHref}>Back to templates</Link>
        </Button>
      </div>

      {/* Schedule Dialog */}
      {props.schedulePrompt && <ScheduleDialog prompt={props.schedulePrompt} />}
    </div>
  );
}
