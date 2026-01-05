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
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-muted/50 rounded-full p-4 mb-4">
          <Dumbbell className="text-muted-foreground h-12 w-12 opacity-60" />
        </div>
        <h3 className="mb-2 text-lg font-bold">No plans yet</h3>
        <p className="text-muted-foreground mb-6 text-center text-sm max-w-md">
          Create your first workout plan or generate one with AI
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateClick}
            className="gap-2 h-10"
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/portal/ai-planner")}
            className="gap-2 h-10"
          >
            <Sparkles className="h-4 w-4" />
            AI Generator
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

