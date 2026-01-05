/**
 * Plan name editor component
 */

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface PlanNameEditorProps {
  planName: string;
  currentPlanName?: string;
  onPlanNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function PlanNameEditor({
  planName,
  currentPlanName,
  onPlanNameChange,
  onSave,
  isSaving,
}: PlanNameEditorProps) {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Plan Name
            </label>
            <Input
              placeholder="e.g., PPL Split, Upper Lower, Full Body"
              value={planName}
              onChange={(e) => onPlanNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void onSave();
                }
              }}
              className="h-12 text-base font-semibold border-2 focus:border-primary transition-colors"
            />
          </div>
          <Button
            size="default"
            onClick={onSave}
            disabled={isSaving || !planName || planName === currentPlanName}
            className="h-12 gap-2 px-6 shrink-0 font-medium"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

