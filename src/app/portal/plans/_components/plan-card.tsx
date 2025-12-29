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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

  // Generate gradient based on plan ID
  const getGradient = (seed: string) => {
    const gradients = [
      "from-blue-500 via-cyan-500 to-teal-500",
      "from-purple-500 via-pink-500 to-rose-500",
      "from-orange-500 via-amber-500 to-yellow-500",
      "from-emerald-500 via-teal-500 to-cyan-500",
      "from-indigo-500 via-purple-500 to-pink-500",
      "from-red-500 via-orange-500 to-amber-500",
      "from-violet-500 via-purple-500 to-fuchsia-500",
    ];
    const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const gradient = getGradient(id);

  return (
    <Card className={cn(
      "group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md cursor-pointer",
      isActive && "ring-2 ring-primary/50 shadow-lg"
    )}>
      {/* Image/Header Section with Gradient */}
      <div className="relative aspect-[4/2.5] w-full overflow-hidden">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          gradient
        )} />
        
        {/* Active Badge */}
        {isActive && (
          <div className="absolute left-4 top-4 z-10">
            <Badge className="bg-white/95 text-primary backdrop-blur-sm shadow-sm">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              Active
            </Badge>
          </div>
        )}

        {/* Menu Button */}
        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                router.push(`/portal/plans/${id}`);
              }}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit Plan
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}>
                  <Copy className="h-3.5 w-3.5 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Plan Name Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full bg-gradient-to-t from-black/60 via-black/20 to-transparent p-5">
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
              {name}
            </h3>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="pb-3 px-5 pt-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{daysCount}</span>
            <span className="text-xs">days</span>
          </div>
          {exercisesCount !== undefined && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">{exercisesCount}</span>
                <span className="text-xs">exercises</span>
              </div>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Updated {format(new Date(updatedAt), "MMM d, yyyy")}
        </p>
      </CardHeader>

      <CardFooter className="pt-0 pb-5 px-5 gap-2">
        {!isActive && onSetActive ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 text-xs gap-1.5 border-primary/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActive();
                  }}
                >
                  <Star className="h-3.5 w-3.5" />
                  Set Active
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Active plans are used for quick workout starts and tracking. You can only have one active plan at a time.
                </p>
              </TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/portal/plans/${id}`);
              }}
            >
              Edit
            </Button>
          </>
        ) : (
          <>
            {onStartWorkout && (
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-9 text-xs gap-1.5 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartWorkout();
                }}
              >
                <Play className="h-3.5 w-3.5" />
                Start Workout
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/portal/plans/${id}`);
              }}
            >
              Edit
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
