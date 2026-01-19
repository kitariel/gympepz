"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Debounced callback for client-side autosave patterns.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  cb: (...args: TArgs) => void,
  delayMs: number,
) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  const timeoutRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debounced = useMemo(() => {
    return (...args: TArgs) => {
      cancel();
      timeoutRef.current = window.setTimeout(() => {
        cbRef.current(...args);
      }, delayMs);
    };
  }, [cancel, delayMs]);

  // Cleanup on unmount
  useEffect(() => cancel, [cancel]);

  return { debounced, cancel } as const;
}

