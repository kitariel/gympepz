"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseWorkoutTimerReturn {
  elapsedSeconds: number;
  elapsedTime: string;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * Hook to track workout duration in real-time
 */
export function useWorkoutTimer(autoStart = true): UseWorkoutTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
  }, []);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    elapsedSeconds,
    elapsedTime: formatTime(elapsedSeconds),
    isRunning,
    start,
    pause,
    resume,
    reset,
  };
}

interface UseRestTimerReturn {
  remainingSeconds: number;
  isActive: boolean;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  addTime: (seconds: number) => void;
}

/**
 * Hook for rest timer between sets
 */
export function useRestTimer(): UseRestTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            // Play sound or show notification here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, remainingSeconds]);

  const start = useCallback((seconds: number) => {
    setRemainingSeconds(seconds);
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const resume = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsActive(true);
    }
  }, [remainingSeconds]);

  const cancel = useCallback(() => {
    setIsActive(false);
    setRemainingSeconds(0);
  }, []);

  const addTime = useCallback((seconds: number) => {
    setRemainingSeconds((prev) => prev + seconds);
  }, []);

  return {
    remainingSeconds,
    isActive,
    start,
    pause,
    resume,
    cancel,
    addTime,
  };
}
