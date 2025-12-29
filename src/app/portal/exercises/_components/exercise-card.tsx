"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
  difficulty?: string;
  category?: string;
  imageUrl?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onViewDetails?: () => void;
  onAddToPlan?: () => void;
}

export function ExerciseCard({
  id,
  name,
  muscleGroup,
  equipment,
  difficulty,
  category,
  imageUrl,
  isFavorite = false,
  onToggleFavorite,
  onViewDetails,
  onAddToPlan,
}: ExerciseCardProps) {
  // Generate random gradient based on exercise ID
  const getGradient = (seed: string) => {
    const gradients = [
      "from-orange-400 via-rose-400 to-pink-300",
      "from-amber-400 via-orange-400 to-rose-400",
      "from-yellow-400 via-amber-400 to-orange-300",
      "from-rose-400 via-pink-400 to-purple-300",
      "from-teal-400 via-cyan-400 to-blue-300",
      "from-emerald-400 via-teal-400 to-cyan-300",
    ];
    const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  // Generate random rating between 4.5 and 5.0
  const getRating = (seed: string) => {
    const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (4.5 + (hash % 6) / 10).toFixed(1);
  };

  // Generate random duration between 20-45 mins
  const getDuration = (seed: string) => {
    const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 20 + (hash % 26);
  };

  // Get instructor initial from muscle group
  const getInstructor = (muscle: string) => {
    const instructors: Record<string, { name: string; initial: string }> = {
      "Chest": { name: "Mike Anderson", initial: "MA" },
      "Back": { name: "Sarah Johnson", initial: "SJ" },
      "Legs": { name: "David Clark", initial: "DC" },
      "Shoulders": { name: "Emma Lee", initial: "EL" },
      "Arms": { name: "Jason White", initial: "JW" },
      "Core": { name: "Lisa Brown", initial: "LB" },
      "Cardio": { name: "Tom Garcia", initial: "TG" },
    };
    return instructors[muscle] ?? { name: "Fitness Coach", initial: "FC" };
  };

  const gradient = getGradient(id);
  const rating = getRating(id);
  const duration = getDuration(id);
  const instructor = getInstructor(muscleGroup);

  const getEquipmentColor = (equip?: string) => {
    const lower = equip?.toLowerCase() ?? "";
    if (lower.includes("yoga") || lower.includes("mat"))
      return "bg-pink-200 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
    if (lower.includes("dumbbell"))
      return "bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (lower.includes("barbell") || lower.includes("machine"))
      return "bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    return "bg-purple-200 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      onClick={onViewDetails}
    >
      {/* Image with Gradient Overlay */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {/* Gradient Background (placeholder for image) */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br",
            gradient,
          )}
        />
        
        {/* Difficulty Badge */}
        <div className="absolute left-4 top-4">
          <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm hover:bg-white">
            {difficulty ?? "Intermediate"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 bg-card p-4">
        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-base font-semibold leading-tight">
            {name}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-sm font-semibold">{rating}</span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-2 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary/10 text-[10px] font-medium">
              {instructor.initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">{instructor.name}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{duration} mins</span>
        </div>

        {/* Equipment Tags */}
        <div className="flex flex-wrap gap-2">
          {equipment && (
            <Badge
              variant="secondary"
              className={cn("rounded-full px-3 py-1 text-xs font-medium", getEquipmentColor(equipment))}
            >
              {equipment}
            </Badge>
          )}
          {category && (
            <Badge
              variant="secondary"
              className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-xs font-medium dark:bg-gray-800 dark:text-gray-300"
            >
              {category}
            </Badge>
          )}
          {muscleGroup && muscleGroup !== category && (
            <Badge
              variant="secondary"
              className="bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300"
            >
              {muscleGroup}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
