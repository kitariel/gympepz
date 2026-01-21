export interface SwipeableSetRowProps {
  id: string;
  setNumber: number;
  repsValue: string;
  repsPlaceholder: string;
  weightValue: string;
  weightPlaceholder: string;
  completed: boolean;
  onUpdateReps: (value: string) => void;
  onUpdateWeight: (value: string | null) => void;
  onToggleComplete: (completed: boolean) => void;
  onSwipeComplete?: () => void;
  onSwipeDelete?: () => void;
}
