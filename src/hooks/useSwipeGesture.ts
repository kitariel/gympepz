"use client";

import { useCallback, useRef, useState } from "react";

export interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  maxSwipeDistance?: number;
}

export interface SwipeGestureReturn {
  offset: number;
  isSwiping: boolean;
  direction: "left" | "right" | null;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  reset: () => void;
}

export function useSwipeGesture(config: SwipeGestureConfig = {}): SwipeGestureReturn {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 80,
    velocityThreshold = 0.5,
    maxSwipeDistance = 120,
  } = config;

  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const startX = useRef(0);
  const startTime = useRef(0);
  const isTracking = useRef(false);

  const handleStart = useCallback((clientX: number) => {
    startX.current = clientX;
    startTime.current = Date.now();
    isTracking.current = true;
    setIsSwiping(true);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isTracking.current) return;

    const deltaX = clientX - startX.current;
    const clampedOffset = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, deltaX));

    setOffset(clampedOffset);
    setDirection(clampedOffset > 0 ? "right" : clampedOffset < 0 ? "left" : null);
  }, [maxSwipeDistance]);

  const handleEnd = useCallback(() => {
    if (!isTracking.current) return;

    const deltaTime = Date.now() - startTime.current;
    const velocity = Math.abs(offset) / deltaTime;
    const isSwipe = Math.abs(offset) >= threshold || velocity >= velocityThreshold;

    if (isSwipe) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    isTracking.current = false;
    setOffset(0);
    setIsSwiping(false);
    setDirection(null);
  }, [offset, threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  const reset = useCallback(() => {
    isTracking.current = false;
    setOffset(0);
    setIsSwiping(false);
    setDirection(null);
  }, []);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleStart(touch.clientX);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleMove(touch.clientX);
    },
    onTouchEnd: handleEnd,
    onMouseDown: (e: React.MouseEvent) => handleStart(e.clientX),
    onMouseMove: (e: React.MouseEvent) => handleMove(e.clientX),
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  };

  return {
    offset,
    isSwiping,
    direction,
    handlers,
    reset,
  };
}
