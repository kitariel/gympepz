/**
 * Stats cards component for plans overview
 */

import { Card, CardContent } from "@/components/ui/card";
import { Folder, Star, Dumbbell } from "lucide-react";
import type { PlanStats } from "../_types";

interface PlansStatsProps {
  stats: PlanStats;
}

export function PlansStats({ stats }: PlansStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-3 sm:p-4">
          <CardContent className="px-0 pt-0 pb-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">
                  Saved Programs
                </p>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform">
                <Folder className="text-blue-600 h-4 w-4 sm:h-5 sm:w-5 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3 sm:p-4">
          <CardContent className="px-0 pt-0 pb-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">
                  Current Mission
                </p>
              </div>
              <div className="bg-amber-500/20 rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform">
                <Star className="text-amber-600 h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-3 sm:p-4">
          <CardContent className="px-0 pt-0 pb-0">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.totalDays}
                </p>
                <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">
                  Weekly Commitment
                </p>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-2 sm:p-3 group-hover:scale-110 transition-transform">
                <Dumbbell className="text-purple-600 h-4 w-4 sm:h-5 sm:w-5 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

