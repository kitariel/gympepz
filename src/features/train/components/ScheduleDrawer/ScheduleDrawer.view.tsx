"use client";

import { AlertTriangle, Calendar, Pencil } from "lucide-react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPreferredDays } from "@/features/train/domain/missedDayDetection";

import type { ScheduleDrawerViewProps } from "./ScheduleDrawer.types";

export function ScheduleDrawerView({
  open,
  onOpenChange,
  nextSession,
  lastCompletedSession,
  missedDay,
  preferredDays,
  onEditPreferredDays,
}: ScheduleDrawerViewProps) {
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Schedule">
      <div className="space-y-4">
        {/* Subtitle */}
        <p className="text-muted-foreground text-sm">
          Based on your last completed workout
        </p>

        {/* Up Next Section */}
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Up Next
          </h3>
          <Card elevation="subtle">
            <CardContent className="py-3">
              {nextSession ? (
                <div className="space-y-1">
                  <p className="font-semibold">
                    {nextSession.label} — Day {nextSession.dayNumber}
                  </p>
                  {lastCompletedSession && (
                    <p className="text-muted-foreground text-sm">
                      Last completed: {lastCompletedSession.label} (
                      {lastCompletedSession.relativeDate})
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No upcoming session
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Missed Day Section */}
        {missedDay?.show && (
          <div className="space-y-3">
            <div className="bg-warning/10 border-warning/20 flex items-start gap-3 rounded-lg border p-3">
              <AlertTriangle className="text-warning h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  You missed a planned workout {missedDay.dateText}
                </p>
                <p className="text-muted-foreground text-xs">
                  What would you like to do?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={missedDay.onTrainToday}
                className="flex-1"
              >
                Train today
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={missedDay.onRestToday}
                className="flex-1"
              >
                Rest today
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={missedDay.onSkipSession}
                className="text-muted-foreground"
              >
                Skip session
              </Button>
            </div>
          </div>
        )}

        {/* Preferences Section */}
        {preferredDays && preferredDays.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Training Days
            </h3>
            <button
              onClick={onEditPreferredDays}
              className="bg-muted/50 hover:bg-muted flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatPreferredDays(preferredDays)}
                </span>
              </div>
              {onEditPreferredDays && (
                <Pencil className="text-muted-foreground h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
