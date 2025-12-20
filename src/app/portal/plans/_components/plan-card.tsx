"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Copy,
  Edit,
  MoreVertical,
  Play,
  Star,
  Trash2,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlanCardProps {
  id: string;
  name: string;
  daysCount: number;
  exercisesCount?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  onSetActive?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onStartWorkout?: () => void;
}

export function PlanCard({
  id,
  name,
  daysCount,
  exercisesCount,
  isActive = false,
  createdAt,
  updatedAt,
  onSetActive,
  onDuplicate,
  onDelete,
  onStartWorkout,
}: PlanCardProps) {
  const router = useRouter();

  return (
    <Card className="group hover:shadow-md transition-all border-0 shadow-sm">
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-sm truncate">{name}</h3>
              {isActive && (
                <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0">
                  <Star className="h-2.5 w-2.5 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {daysCount} days
              </span>
              {exercisesCount !== undefined && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {exercisesCount} ex
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/portal/plans/${id}`)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit Plan
              </DropdownMenuItem>
              {!isActive && onSetActive && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem onClick={onSetActive}>
                      <Star className="h-3.5 w-3.5 mr-2" />
                      Set as Active
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set this plan as your default for quick workout starts</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        <div className="text-[10px] text-muted-foreground">
          Updated {format(new Date(updatedAt), "MMM d")}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4 gap-2">
        {onStartWorkout && (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={onStartWorkout}
          >
            <Play className="h-3 w-3 mr-1.5" />
            Start Workout
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={() => router.push(`/portal/plans/${id}`)}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
