"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { GuestWorkoutBuilderDraft } from "@/lib/guest/types";

function defaultWorkoutName() {
  const d = new Date();
  const day = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  return `Workout - ${day} ${time}`;
}

export function BuilderDetailsStep({
  draft,
  onChange,
  onNext,
  onCancel,
}: {
  draft: GuestWorkoutBuilderDraft;
  onChange: (next: GuestWorkoutBuilderDraft) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const name = draft.name.trim();
  const canContinue = name.length > 0;

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Workout details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workout name</label>
            <Input
              value={draft.name}
              onChange={(e) => onChange({ ...draft, name: e.target.value })}
              placeholder={defaultWorkoutName()}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Required. Tip: keep it simple (e.g. “Upper A”, “Full Body”).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={draft.notes ?? ""}
              onChange={(e) =>
                onChange({ ...draft, notes: e.target.value || null })
              }
              placeholder="Warm-up, focus cues, pain notes…"
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onNext} disabled={!canContinue}>
              Next: Add exercises
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

