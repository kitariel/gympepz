import { cn } from "@/lib/utils";
import { GripVertical, Moon, Dumbbell } from "lucide-react";
import { forwardRef } from "react";
import type { PlanDay } from "../_types";

interface RearrangeDayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  item: { id: string; day: PlanDay | null };
  dayName: string;
  isOverlay?: boolean;
}

export const RearrangeDayCard = forwardRef<HTMLDivElement, RearrangeDayCardProps>(
  ({ item, dayName, isOverlay = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card text-card-foreground relative flex items-center gap-3 rounded-lg border p-3 shadow-sm",
          isOverlay && "z-50 cursor-grabbing shadow-xl",
          !isOverlay &&
            "data-[dragging]:relative data-[dragging]:z-50 data-[dragging]:shadow-xl",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "text-muted-foreground",
            !isOverlay && "cursor-grab active:cursor-grabbing",
          )}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          {item.day ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-medium">
                  {dayName}
                </span>
                <span className="truncate font-medium">{item.day.title}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                {item.day.isRestDay && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <Moon className="h-3 w-3" />
                    <span>Rest Day</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  <span>{item.day.items?.length || 0} exercises</span>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground italic">Empty Slot</span>
          )}
        </div>
      </div>
    );
  },
);

RearrangeDayCard.displayName = "RearrangeDayCard";
