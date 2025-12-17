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
        "flex items-center gap-2 p-2 rounded-lg transition-colors",
        completed ? "bg-green-50 dark:bg-green-950/20" : "bg-muted/50"
      )}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={handleCheckboxChange}
        className="shrink-0"
      />

      <span className="w-10 text-sm font-medium text-muted-foreground">
        #{setNumber}
      </span>

      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={localWeight}
            onChange={(e) => setLocalWeight(e.target.value)}
            onBlur={handleBlur}
            className="w-20 h-8 text-center"
            placeholder={targetWeight?.toString() ?? "kg"}
            disabled={completed}
          />
          <span className="text-xs text-muted-foreground">kg</span>
        </div>

        <span className="text-xs text-muted-foreground">×</span>

        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={localReps}
            onChange={(e) => setLocalReps(e.target.value)}
            onBlur={handleBlur}
            className="w-16 h-8 text-center"
            placeholder={targetReps?.toString() ?? "0"}
            disabled={completed}
          />
          <span className="text-xs text-muted-foreground">reps</span>
        </div>

        <Select
          value={localRpe}
          onValueChange={(value) => {
            setLocalRpe(value);
            onUpdate({ rpe: parseInt(value) });
          }}
          disabled={completed}
        >
          <SelectTrigger className="w-24 h-8">
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
        <Badge variant="default" className="shrink-0">
          <Check className="h-3 w-3 mr-1" />
          Done
        </Badge>
      )}

      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
