"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Info, Plus } from "lucide-react";
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
  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={
                  imageUrl ??
                  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(id)}`
                }
                alt={name}
              />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{name}</h3>
              <p className="text-sm text-muted-foreground">{muscleGroup}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleFavorite}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all",
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              )}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {difficulty && (
            <Badge variant="secondary" className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
          )}
          {equipment && (
            <Badge variant="outline" className="text-xs">
              {equipment}
            </Badge>
          )}
          {category && (
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewDetails}
          >
            <Info className="h-3.5 w-3.5 mr-1.5" />
            Details
          </Button>
          <Button size="sm" className="flex-1" onClick={onAddToPlan}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
