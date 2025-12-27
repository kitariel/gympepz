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
    actualWeight?.toString() ?? ""
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
        "flex items-center gap-2 sm:gap-3 md:gap-4 p-2.5 sm:p-2.5 md:p-3 rounded-lg transition-colors touch-manipulation",
        completed ? "bg-primary/10" : "bg-muted/50"
      )}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={handleCheckboxChange}
        className="shrink-0 h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5"
      />

      <span className="w-8 sm:w-10 md:w-12 text-xs sm:text-sm md:text-base font-medium text-muted-foreground shrink-0">
        #{setNumber}
      </span>

      <div className="flex-1 flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
        <div className="flex items-center gap-1 md:gap-1.5 flex-1 min-w-0">
          <Input
            type="number"
            value={localWeight}
            onChange={(e) => setLocalWeight(e.target.value)}
            onBlur={handleBlur}
            className="w-16 sm:w-20 md:w-24 h-9 sm:h-8 md:h-10 text-center text-sm sm:text-base md:text-base"
            placeholder={targetWeight?.toString() ?? "kg"}
            disabled={completed}
            inputMode="decimal"
          />
          <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground shrink-0">kg</span>
        </div>

        <span className="text-xs md:text-sm text-muted-foreground shrink-0">×</span>

        <div className="flex items-center gap-1 md:gap-1.5 flex-1 min-w-0">
          <Input
            type="number"
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            onBlur={handleBlur}
            className="w-14 sm:w-16 md:w-20 h-9 sm:h-8 md:h-10 text-center text-sm sm:text-base md:text-base"
            placeholder={targetReps?.toString() ?? "0"}
            disabled={completed}
            inputMode="numeric"
          />
          <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground shrink-0">reps</span>
        </div>

        <Select
          value={localRpe}
          onValueChange={(value) => {
            setLocalRpe(value);
            onUpdate({ rpe: parseInt(value) });
          }}
          disabled={completed}
        >
          <SelectTrigger className="w-20 sm:w-24 md:w-28 h-9 sm:h-8 md:h-10 text-xs sm:text-sm md:text-base">
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
        <Badge variant="default" className="shrink-0 text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-2.5 py-0.5 md:py-1">
          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 mr-1" />
          Done
        </Badge>
      )}

      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-8 sm:w-8 md:h-9 md:w-9 shrink-0 touch-manipulation"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      )}
    </div>
  );
}
