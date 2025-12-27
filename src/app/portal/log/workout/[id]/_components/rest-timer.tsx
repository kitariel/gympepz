"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Minus, X, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  remainingSeconds: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onAddTime: (seconds: number) => void;
}

export function RestTimer({
  remainingSeconds,
  isActive,
  onPause,
  onResume,
  onCancel,
  onAddTime,
}: RestTimerProps) {
  useEffect(() => {
    // Play sound when timer completes
    if (remainingSeconds === 0 && !isActive) {
      // Optional: Play notification sound
      // new Audio('/sounds/timer-complete.mp3').play();
    }
  }, [remainingSeconds, isActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercent = (): number => {
    // Assume rest is typically 180 seconds
    const maxRest = 180;
    return ((maxRest - remainingSeconds) / maxRest) * 100;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 shadow-2xl">
      <Card className="max-w-md mx-auto p-4 border-0 shadow-sm ring-1 ring-border bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-semibold uppercase tracking-wider">Rest Timer</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative mb-4">
          {/* Progress bar */}
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-linear shadow-sm",
                remainingSeconds > 30
                  ? "bg-green-500"
                  : remainingSeconds > 10
                    ? "bg-yellow-500"
                    : "bg-red-500"
              )}
              style={{ width: `${getProgressPercent()}%` }}
            />
          </div>

          {/* Time display */}
          <div className="text-center mt-4">
            <div
              className={cn(
                "text-6xl font-black tabular-nums tracking-tight",
                remainingSeconds <= 10 && "text-red-500 animate-pulse"
              )}
            >
              {formatTime(remainingSeconds)}
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
              {remainingSeconds === 0
                ? "Rest complete!"
                : "Time remaining"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onAddTime(-15)}
            disabled={remainingSeconds <= 15}
            className="h-10 w-10 border-border/50"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onAddTime(-30)}
            disabled={remainingSeconds <= 30}
            className="text-xs h-10 w-10 border-border/50 font-medium"
          >
            -30
          </Button>

          <Button
            variant={isActive ? "default" : "secondary"}
            size="lg"
            onClick={isActive ? onPause : onResume}
            className="min-w-28 font-semibold shadow-sm"
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2 fill-current" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2 fill-current" />
                Resume
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onAddTime(30)}
            className="text-xs h-10 w-10 border-border/50 font-medium"
          >
            +30
          </Button>

          <Button variant="outline" size="icon" onClick={() => onAddTime(15)} className="h-10 w-10 border-border/50">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {remainingSeconds === 0 && (
          <div className="mt-4 text-center animate-in fade-in slide-in-from-bottom-2">
            <Button onClick={onCancel} variant="default" className="w-full font-semibold shadow-md">
              Start Next Set
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
