"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Dumbbell, Target, Wrench } from "lucide-react";

interface ExerciseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedMuscle: string;
  onMuscleChange: (muscle: string) => void;
  selectedEquipment: string;
  onEquipmentChange: (equipment: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Glutes",
  "Calves",
  "Forearms",
];

const EQUIPMENT_OPTIONS = [
  "All",
  "Barbell",
  "Dumbbell",
  "Cable",
  "Machine",
  "Bodyweight",
  "Kettlebell",
  "Resistance Band",
];

const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export function ExerciseFilters({
  searchQuery,
  onSearchChange,
  selectedMuscle,
  onMuscleChange,
  selectedEquipment,
  onEquipmentChange,
  selectedDifficulty,
  onDifficultyChange,
  onClearFilters,
  activeFiltersCount,
}: ExerciseFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMuscle} onValueChange={onMuscleChange}>
            <SelectTrigger className="w-[180px]">
              <Target className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Muscle Group" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUPS.map((muscle) => (
                <SelectItem key={muscle} value={muscle}>
                  {muscle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedEquipment} onValueChange={onEquipmentChange}>
            <SelectTrigger className="w-[180px]">
              <Wrench className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Equipment" />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <SelectItem key={equipment} value={equipment}>
                  {equipment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
            <SelectTrigger className="w-[180px]">
              <Dumbbell className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
