"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface PR {
  id: string;
  exercise?: {
    name: string;
  };
  prType: string;
  value: number;
  reps?: number;
}

interface RecentPRsProps {
  prs: PR[];
}

export function RecentPRs({ prs }: RecentPRsProps) {
  const router = useRouter();

  if (!prs || prs.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            Recent PRs
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-primary"
            onClick={() => router.push("/portal/log?tab=analytics")}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {prs.map((pr) => (
          <div
            key={pr.id}
            className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {pr.exercise?.name ?? "Exercise"}
              </div>
              <div className="text-xs text-muted-foreground">
                {pr.prType === "max_weight"
                  ? `${pr.value} kg × ${pr.reps ?? 1}`
                  : `${pr.value} kg`}
              </div>
            </div>
            <Badge variant="secondary" className="ml-2">
              <Award className="h-3 w-3 mr-1" />
              PR
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
