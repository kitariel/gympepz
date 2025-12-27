"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetRowProps {
  setNumber: number;
  targetReps?: number;
  targetWeight?: number;
  actualReps: number;
  actualWeight?: number;
  rpe?: number;
  completed: boolean;
  showDelete?: boolean;
  onUpdate: (data: {
    actualReps?: number;
    actualWeight?: number;
    rpe?: number;
  }) => void;
  onComplete: () => void;
  onDelete?: () => void;
}

export function SetRow({
  setNumber,
  targetReps,
  targetWeight,
  actualReps,
  actualWeight,
  rpe,
  completed,
  showDelete = true,
  onUpdate,
  onComplete,
  onDelete,
}: SetRowProps) {
  const [localReps, setLocalReps] = useState(actualReps.toString());
  const [localWeight, setLocalWeight] = useState(
    actualWeight?.toString() ?? "",
  );
  const [localRpe, setLocalRpe] = useState(rpe?.toString() ?? "");

  const handleBlur = () => {
    onUpdate({
      actualReps: localReps ? parseInt(localReps) : 0,
      actualWeight: localWeight ? parseFloat(localWeight) : undefined,
      rpe: localRpe ? parseInt(localRpe) : undefined,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked && !completed) {
      // Auto-fill with target values if empty
      if (!localWeight && targetWeight) {
        setLocalWeight(targetWeight.toString());
      }
      if (!localReps && targetReps) {
        setLocalReps(targetReps.toString());
      }
      onComplete();
    }
  };

  return (
    <div
      className={cn(
        "flex touch-manipulation items-center gap-2 rounded-lg p-2.5 ring-1 ring-transparent transition-colors sm:gap-3 sm:p-2.5 md:gap-4 md:p-3",
        completed
          ? "bg-primary/5 ring-primary/20"
          : "bg-muted/30 hover:bg-muted/50 ring-border/50",
      )}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={handleCheckboxChange}
        className="h-5 w-5 shrink-0 sm:h-4 sm:w-4 md:h-5 md:w-5"
      />

      <span className="text-muted-foreground w-8 shrink-0 text-xs font-medium tabular-nums sm:w-10 sm:text-sm md:w-12 md:text-base">
        #{setNumber}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2 md:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 md:gap-1.5">
          <Input
            type="number"
            value={localWeight}
            onChange={(e) => setLocalWeight(e.target.value)}
            onBlur={handleBlur}
            className="bg-background/50 h-9 w-16 text-center text-sm sm:h-8 sm:w-20 sm:text-base md:h-10 md:w-24 md:text-base"
            placeholder={targetWeight?.toString() ?? "kg"}
            disabled={completed}
            inputMode="decimal"
          />
          <span className="text-muted-foreground shrink-0 text-[10px] font-medium tracking-wider uppercase sm:text-xs md:text-sm">
            kg
          </span>
        </div>

        <span className="text-muted-foreground shrink-0 text-xs md:text-sm">
          ×
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-1 md:gap-1.5">
          <Input
            type="number"
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            onBlur={handleBlur}
            className="bg-background/50 h-9 w-14 text-center text-sm sm:h-8 sm:w-16 sm:text-base md:h-10 md:w-20 md:text-base"
            placeholder={targetReps?.toString() ?? "0"}
            disabled={completed}
            inputMode="numeric"
          />
          <span className="text-muted-foreground shrink-0 text-[10px] font-medium tracking-wider uppercase sm:text-xs md:text-sm">
            reps
          </span>
        </div>

        <Select
          value={localRpe}
          onValueChange={(value) => {
            setLocalRpe(value);
            onUpdate({ rpe: parseInt(value) });
          }}
          disabled={completed}
        >
          <SelectTrigger className="bg-background/50 h-9 w-20 text-xs sm:h-8 sm:w-24 sm:text-sm md:h-10 md:w-28 md:text-base">
            <SelectValue placeholder="RPE" />
          </SelectTrigger>
          <SelectContent>
            {[6, 7, 8, 9, 10].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                RPE {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {completed && (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 shrink-0 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase sm:px-2 sm:text-xs md:px-2.5 md:py-1 md:text-sm"
        >
          <Check className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
          Done
        </Badge>
      )}

      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 touch-manipulation sm:h-8 sm:w-8 md:h-9 md:w-9"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      )}
    </div>
  );
}
