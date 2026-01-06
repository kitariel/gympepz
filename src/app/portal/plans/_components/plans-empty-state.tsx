/**
 * Empty state component for plans list
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlansEmptyStateProps {
  onCreateClick: () => void;
}

export function PlansEmptyState({ onCreateClick }: PlansEmptyStateProps) {
  const router = useRouter();

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="flex flex-col items-center justify-center px-4 py-16">
        <div className="bg-muted/50 mb-4 rounded-full p-4">
          <Dumbbell className="text-muted-foreground h-12 w-12 opacity-60" />
        </div>
        <h3 className="mb-2 text-xl font-bold">No Battle Plan?</h3>
        <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
          You can&apos;t win without a strategy. Let me build a custom program
          for you.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="sm"
            onClick={() => router.push("/portal/ai-planner")}
            className="h-10 gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            Ask Coach to Build It
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateClick}
            className="h-10 gap-2"
          >
            <Plus className="h-4 w-4" />
            I&apos;ll Write It Myself
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
