"use client";

import { useEffect, useMemo, useState } from "react";

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
import { Dumbbell, Target, Wrench, BarChart3, Heart } from "lucide-react";

import type { Exercise } from "@/types/exercise";

const normalizeYouTubeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return url.pathname.split("/")[1] || null;
    }
    if (host.endsWith("youtube.com")) {
      const idParam = url.searchParams.get("v");
      if (idParam) return idParam;
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex !== -1) return parts[embedIndex + 1] || null;
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex !== -1) return parts[shortsIndex + 1] || null;
    }
  } catch {
    // Not a URL; assume it's already a video ID.
  }

  return trimmed;
};

interface ExerciseDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function ExerciseDetailModal({
  open,
  onOpenChange,
  exercise,
  isFavorite = false,
  onToggleFavorite,
}: ExerciseDetailModalProps) {
  if (!exercise) return null;

  const videoIds = useMemo(
    () => {
      const inputs = [
        ...(exercise.youtubeVideoIds ?? []),
        exercise.youtubeVideo ?? "",
      ];
      const normalized = inputs
        .map((id) => normalizeYouTubeId(id))
        .filter(Boolean) as string[];
      return Array.from(new Set(normalized));
    },
    [exercise.youtubeVideo, exercise.youtubeVideoIds],
  );
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    videoIds[0] ?? null,
  );

  useEffect(() => {
    setActiveVideoId(videoIds[0] ?? null);
  }, [exercise.id, videoIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
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
              <div className="mt-2 flex flex-wrap gap-2">
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

        <div className="mt-4 space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Target className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-xs">Target</p>
                <p className="font-medium">{exercise.muscleGroup}</p>
              </div>
            </div>
            {exercise.equipment && (
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Equipment</p>
                  <p className="font-medium">{exercise.equipment}</p>
                </div>
              </div>
            )}
            {exercise.difficulty && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-muted-foreground text-xs">Level</p>
                  <p className="font-medium">{exercise.difficulty}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <Dumbbell className="h-4 w-4" />
                Description
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {exercise.description}
              </p>
            </div>
          )}

          {/* How To */}
          {exercise.howTo && (
            <div>
              <h3 className="mb-2 font-semibold">How To Perform</h3>
              <div className="space-y-2">
                {exercise.howTo
                  .split("\n")
                  .filter(Boolean)
                  .map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground pt-0.5 text-sm">
                        {step}
                      </p>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videoIds.length > 0 && activeVideoId ? (
            <div>
              <h3 className="mb-3 font-semibold">Video demo</h3>
              <div className="space-y-3">
                <div className="aspect-video overflow-hidden rounded-xl border bg-muted/30">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideoId}`}
                    title={`${exercise.name} video`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {videoIds.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {videoIds.map((id, index) => (
                      <button
                        key={`${id}-${index}`}
                        type="button"
                        onClick={() => setActiveVideoId(id)}
                        className={`overflow-hidden rounded-lg border transition ${
                          id === activeVideoId
                            ? "border-primary/60 ring-2 ring-primary/20"
                            : "border-border/60"
                        }`}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                          alt={`${exercise.name} video ${index + 1}`}
                          className="h-16 w-28 object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Watch on YouTube
                  </a>
                </Button>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onToggleFavorite}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
              />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
