/**
 * Types and interfaces for the Plans pages
 */

export type RestDayAction = "skip" | "add" | "mark";

export interface PlanStats {
  total: number;
  active: number;
  totalDays: number;
}

export interface Plan {
  id: string;
  name: string;
  daysCount?: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

