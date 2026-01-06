/**
 * Plan header component with title and stats
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Eye,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Plan } from "../_types";
import { cn } from "@/lib/utils";

interface PlanHeaderProps {
  plan: Plan | null | undefined;
  totalExercises: number;
  planName: string;
  onPlanNameChange: (name: string) => void;
  onSaveName: () => void;
  isSavingName: boolean;
}

export function PlanHeader({
  plan,
  totalExercises,
  planName,
  onPlanNameChange,
  onSaveName,
  isSavingName,
}: PlanHeaderProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSaveName();
    setIsEditing(false);
  };

  const handleCancel = () => {
    onPlanNameChange(plan?.name ?? "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="flex flex-col gap-6 border-b pb-6">
      {/* Top Bar: Back Button & Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 gap-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/portal/log`)}
          className="h-8 gap-2"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">View Logs</span>
          <span className="sm:hidden">Logs</span>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-4">
          {/* Title Section */}
          <div className="space-y-1.5">
            {isEditing ? (
              <div className="flex max-w-2xl items-center gap-2">
                <Input
                  ref={inputRef}
                  value={planName}
                  onChange={(e) => onPlanNameChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="hover:border-input focus:border-input -ml-2 h-10 border-transparent bg-transparent px-2 text-2xl font-bold transition-colors md:text-3xl"
                  placeholder="Plan Name"
                />
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-500 hover:bg-green-500/10 hover:text-green-600"
                    onClick={handleSave}
                    disabled={isSavingName || !planName.trim()}
                  >
                    {isSavingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={handleCancel}
                    disabled={isSavingName}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="group flex items-start gap-2">
                <h1
                  onClick={() => setIsEditing(true)}
                  className="text-foreground hover:text-primary/90 cursor-pointer text-2xl font-bold tracking-tight transition-colors md:text-3xl"
                >
                  {plan?.name ?? "Untitled Plan"}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <p className="text-muted-foreground text-sm">
              Build and organize your weekly workout schedule
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-card inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm shadow-sm">
              <Calendar className="text-primary h-3.5 w-3.5" />
              <span className="font-medium">{plan?.days?.length ?? 0}</span>
              <span className="text-muted-foreground">Days</span>
            </div>
            <div className="bg-card inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm shadow-sm">
              <Dumbbell className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium">{totalExercises}</span>
              <span className="text-muted-foreground">Exercises</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
