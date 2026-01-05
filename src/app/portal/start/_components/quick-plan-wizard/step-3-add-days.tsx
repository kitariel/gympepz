/**
 * Step 3: Add More Days or Finish
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus, Zap } from "lucide-react";

interface Step3AddDaysProps {
  daysCount: number;
  onAddAnotherDay: () => void;
  onAutoGenerate: () => void;
  onBack: () => void;
  onFinish: () => void;
}

export function Step3AddDays({
  daysCount,
  onAddAnotherDay,
  onAutoGenerate,
  onBack,
  onFinish,
}: Step3AddDaysProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Add More Days?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          You&apos;ve created {daysCount} workout day
          {daysCount !== 1 ? "s" : ""}. Would you like to add more days or
          auto-generate a full week?
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card
            className="cursor-pointer border-2 transition-all hover:shadow-md"
            onClick={onAddAnotherDay}
          >
            <CardContent className="space-y-2 p-6 text-center">
              <Plus className="mx-auto h-8 w-8 text-teal-600" />
              <h3 className="font-semibold">Add Another Day</h3>
              <p className="text-muted-foreground text-xs">
                Manually add more workout days
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer border-2 transition-all hover:shadow-md"
            onClick={onAutoGenerate}
          >
            <CardContent className="space-y-2 p-6 text-center">
              <Zap className="mx-auto h-8 w-8 text-purple-600" />
              <h3 className="font-semibold">Auto-Generate 5 Days</h3>
              <p className="text-muted-foreground text-xs">
                Create Push/Pull/Legs rotation
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onFinish}>
            Finish Setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

