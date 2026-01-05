/**
 * Custom hook for managing day order and weekly slots
 */

import { useState, useEffect } from "react";
import type { PlanDay, Plan } from "../_types";

export function useDayOrderManagement(plan: Plan | null | undefined) {
  const [localDays, setLocalDays] = useState<(PlanDay | null)[]>([]);

  // Initialize local days from plan data
  useEffect(() => {
    if (plan?.days && plan.days.length > 0) {
      // Sort days by order
      const sortedDays = [...plan.days].sort((a, b) => a.order - b.order);

      // Create array with 7 slots (Sunday = 0, Monday = 1, etc.)
      const weekSlots: (PlanDay | null)[] = Array.from(
        { length: 7 },
        () => null,
      );

      // Map days to slots: order should directly map to slot (0-6)
      sortedDays.forEach((day) => {
        // For weekly view, order values 0-6 map directly to slots 0-6
        if (day.order >= 0 && day.order < 7) {
          const slotIndex = day.order;
          if (!weekSlots[slotIndex]) {
            weekSlots[slotIndex] = day;
          } else {
            // Conflict: day with same order already exists
            console.warn(
              `Order conflict: day ${day.id} has order ${day.order} but slot is taken`,
            );
            for (let i = 0; i < 7; i++) {
              const checkSlot = (slotIndex + 1 + i) % 7;
              if (!weekSlots[checkSlot]) {
                weekSlots[checkSlot] = day;
                break;
              }
            }
          }
        } else if (day.order >= 7) {
          // Orders >= 7 are outside weekly view range, place in first available slot
          for (let i = 0; i < 7; i++) {
            if (!weekSlots[i]) {
              weekSlots[i] = day;
              break;
            }
          }
        }
      });
      setLocalDays(weekSlots);
    } else {
      setLocalDays(Array(7).fill(null));
    }
  }, [plan?.days]);

  return {
    localDays,
    setLocalDays,
  };
}

