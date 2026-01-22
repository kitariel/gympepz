"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/trpc/react";

interface ExerciseComboboxProps {
  value: string | null;
  onChange: (exerciseId: string | null, exerciseName: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ExerciseCombobox({
  value,
  onChange,
  placeholder = "Select exercise...",
  disabled = false,
}: ExerciseComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: exercises, isLoading } = api.exercise.list.useQuery(
    { q: search || undefined, take: 50 },
    { enabled: open },
  );

  const selectedExercise = useMemo(() => {
    if (!value || !exercises) return null;
    return exercises.find((e) => e.id === value);
  }, [value, exercises]);

  // Also fetch selected exercise if we have a value but popover is closed
  const { data: selectedExerciseData } = api.exercise.list.useQuery(
    { q: undefined, take: 1000 },
    { enabled: !!value && !open },
  );

  const displayName = useMemo(() => {
    if (selectedExercise) return selectedExercise.name;
    if (value && selectedExerciseData) {
      const found = selectedExerciseData.find((e) => e.id === value);
      if (found) return found.name;
    }
    return null;
  }, [value, selectedExercise, selectedExerciseData]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {displayName ? (
            <span className="truncate">{displayName}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSearch("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : exercises && exercises.length > 0 ? (
            exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => {
                  onChange(
                    exercise.id === value ? null : exercise.id,
                    exercise.id === value ? null : exercise.name,
                  );
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-2 text-left text-sm hover:bg-accent",
                  value === exercise.id && "bg-accent",
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === exercise.id ? "opacity-100" : "opacity-0",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{exercise.name}</div>
                  {exercise.muscleGroup && (
                    <div className="truncate text-xs text-muted-foreground">
                      {exercise.muscleGroup}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No exercises found.
            </div>
          )}
        </div>
        {value && (
          <div className="border-t p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => {
                onChange(null, null);
                setOpen(false);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Clear selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
