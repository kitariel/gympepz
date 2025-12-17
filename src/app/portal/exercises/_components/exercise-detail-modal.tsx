"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dumbbell, Target, Wrench, BarChart3, Plus, Heart } from "lucide-react";

interface ExerciseDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: {
    id: string;
    name: string;
    muscleGroup: string;
    equipment?: string;
    difficulty?: string;
    category?: string;
    description?: string;
    howTo?: string;
    imageUrl?: string;
  } | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onAddToPlan?: () => void;
}

export function ExerciseDetailModal({
  open,
  onOpenChange,
  exercise,
  isFavorite = false,
  onToggleFavorite,
  onAddToPlan,
}: ExerciseDetailModalProps) {
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={
                  exercise.imageUrl ??
                  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(exercise.id)}`
                }
                alt={exercise.name}
              />
              <AvatarFallback>
                {exercise.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {exercise.difficulty && (
                  <Badge variant="secondary">{exercise.difficulty}</Badge>
                )}
                {exercise.equipment && (
                  <Badge variant="outline">{exercise.equipment}</Badge>
                )}
                {exercise.category && (
                  <Badge variant="outline">{exercise.category}</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-medium">{exercise.muscleGroup}</p>
              </div>
            </div>
            {exercise.equipment && (
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Equipment</p>
                  <p className="font-medium">{exercise.equipment}</p>
                </div>
              </div>
            )}
            {exercise.difficulty && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="font-medium">{exercise.difficulty}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {exercise.description}
              </p>
            </div>
          )}

          {/* How To */}
          {exercise.howTo && (
            <div>
              <h3 className="font-semibold mb-2">How To Perform</h3>
              <div className="space-y-2">
                {exercise.howTo.split('\n').filter(Boolean).map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onToggleFavorite}
            >
              <Heart
                className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
              />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
            <Button className="flex-1" onClick={onAddToPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
