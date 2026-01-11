/**
 * Step 1: Body Part Selection
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight } from "lucide-react";
import {
  BODY_PARTS,
  BODY_PART_DESCRIPTIONS,
  type BodyPart,
} from "../../_types";

interface Step1BodyPartProps {
  onSelectBodyPart: (bodyPart: BodyPart) => void;
  onCancel: () => void;
}

export function Step1BodyPart({
  onSelectBodyPart,
  onCancel,
}: Step1BodyPartProps) {
  return (
    <Card className="border-0 py-4 shadow-sm">
      <CardHeader>
        <CardTitle>Select Body Part Focus</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Choose which muscle groups you want to train today
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {BODY_PARTS.map((bodyPart) => (
            <Card
              key={bodyPart}
              className="hover:border-primary cursor-pointer border-2 transition-all hover:shadow-md"
              onClick={() => onSelectBodyPart(bodyPart)}
            >
              <CardContent className="space-y-2 p-6 text-center">
                <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                  <Target className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">{bodyPart}</h3>
                <p className="text-muted-foreground text-xs">
                  {BODY_PART_DESCRIPTIONS[bodyPart]}
                </p>
                <ArrowRight className="text-primary mx-auto mt-2 h-4 w-4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
