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
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

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
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{name}</h3>
              {isActive && (
                <Badge variant="default" className="shrink-0">
                  <Star className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {daysCount} days
              </span>
              {exercisesCount !== undefined && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {exercisesCount} exercises
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/portal/plans/${id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </DropdownMenuItem>
              {!isActive && onSetActive && (
                <DropdownMenuItem onClick={onSetActive}>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Active
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Created {format(new Date(createdAt), "MMM d, yyyy")}</div>
          <div>Updated {format(new Date(updatedAt), "MMM d, yyyy")}</div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {onStartWorkout && (
          <Button
            variant={isActive ? "default" : "outline"}
            className="flex-1"
            onClick={onStartWorkout}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Workout
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/portal/plans/${id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
