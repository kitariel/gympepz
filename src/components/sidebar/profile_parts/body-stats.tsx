"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";

interface BodyStatsProps {
  weight?: number;
  bodyFat?: number;
}

export function BodyStats({ weight, bodyFat }: BodyStatsProps) {
  const router = useRouter();

  if (!weight) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Body Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Weight</span>
          <span className="font-semibold">{weight} kg</span>
        </div>
        {bodyFat && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Body Fat</span>
              <span className="font-semibold">{bodyFat}%</span>
            </div>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => router.push("/portal/log?tab=progress")}
        >
          Update Progress
        </Button>
      </CardContent>
    </Card>
  );
}
