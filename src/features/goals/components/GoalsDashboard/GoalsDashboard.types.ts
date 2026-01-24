import type { GoalTemplate, GoalTemplateCategory } from "@/lib/goal-templates";
import type { Goal } from "@/types/goal.types";

// ─────────────────────────────────────────────────────────────────────────────
// Container Props (external API)
// ─────────────────────────────────────────────────────────────────────────────

export type GoalsDashboardProps = {
  /** Base path for navigation (e.g., "/portal/goals") */
  basePath?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// View Model (what the view receives)
// ─────────────────────────────────────────────────────────────────────────────

export type GoalsDashboardViewModel = {
  // State
  isLoading: boolean;
  isAuthenticated: boolean;
  hasGoals: boolean;
  errorMessage?: string | null;

  // Data
  activeGoals: Goal[];
  completedGoals: Goal[];
  templateCategories: TemplateCategoryGroup[];

  // Counts for display
  activeCount: number;
  completedCount: number;

  // Handlers
  onAddGoalClick: () => void;
  onTemplateSelect: (template: GoalTemplate) => void;
  onGoalDelete: (goal: Goal) => void;
  onRetry: () => void;

  // Navigation paths
  paths: {
    startWorkout: string;
    createCustomGoal: string;
    goalDetail: (id: string) => string;
    login: string;
  };
};

export type TemplateCategoryGroup = {
  id: GoalTemplateCategory;
  label: string;
  icon: "dumbbell" | "flame" | "target" | "scale";
  templates: GoalTemplate[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component Props
// ─────────────────────────────────────────────────────────────────────────────

export type GoalsHeaderProps = {
  isAuthenticated: boolean;
  hasGoals: boolean;
  activeCount: number;
  completedCount: number;
  onAddGoalClick: () => void;
  startWorkoutPath: string;
};

export type GoalsEmptyStateProps = {
  loginPath: string;
};

export type GoalsTemplateGridProps = {
  categories: TemplateCategoryGroup[];
  onTemplateSelect: (template: GoalTemplate) => void;
  createCustomGoalPath: string;
  showIntro?: boolean;
};

export type GoalsListProps = {
  activeGoals: Goal[];
  completedGoals: Goal[];
  onDelete: (goal: Goal) => void;
};

export type GoalDeleteDialogProps = {
  goal: Goal | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal State (for container)
// ─────────────────────────────────────────────────────────────────────────────

export type GoalsDashboardState = {
  pickerOpen: boolean;
  confirmOpen: boolean;
  confirmTemplate: GoalTemplate | null;
  goalToDelete: Goal | null;
  isDeleting: boolean;
};
