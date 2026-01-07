/**
 * Dialog component for creating new plans
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanTemplates } from "./plan-templates";
import { TEMPLATE_DEFINITIONS } from "./template-exercises";
import { Plus } from "lucide-react";
import type { useTemplateCreation } from "../_hooks/use-template-creation";

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreateComplete: () => Promise<void>;
  templateCreation: ReturnType<typeof useTemplateCreation>;
  mutations: {
    create: ReturnType<
      typeof import("../_hooks/use-plans-mutations").usePlansMutations
    >["create"];
    setActive: ReturnType<
      typeof import("../_hooks/use-plans-mutations").usePlansMutations
    >["setActive"];
  };
  list: ReturnType<
    typeof import("../_hooks/use-plans-data").usePlansData
  >["list"];
}

export function CreatePlanDialog({
  open,
  onOpenChange,
  userId,
  onCreateComplete,
  templateCreation,
  mutations,
  list,
}: CreatePlanDialogProps) {
  const [newPlanName, setNewPlanName] = useState("");

  const handleCreatePlan = async () => {
    if (!userId || !newPlanName) return;
    const newPlan = await mutations.create.mutateAsync({
      userId,
      name: newPlanName,
      days: [],
    });
    setNewPlanName("");
    onOpenChange(false);
    await list.refetch();

    // Auto-set first plan as active if no active plan exists
    const plansList = await list.refetch();
    const hasActivePlan = plansList.data?.some((p) => p.isActive);
    if (!hasActivePlan) {
      await mutations.setActive.mutateAsync({ userId, planId: newPlan.id });
    }
    await onCreateComplete();
  };

  const handleCreateFromTemplate = async () => {
    if (!templateCreation.selectedTemplate || !newPlanName) return;
    await templateCreation.handleCreateFromTemplate(
      templateCreation.selectedTemplate,
      newPlanName,
    );
    setNewPlanName("");
    templateCreation.setSelectedTemplate(null);
    onOpenChange(false);
    await onCreateComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-9 min-w-[120px] flex-1 gap-2 text-xs sm:min-w-0 sm:flex-initial sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Quick Create */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Create from Scratch</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter plan name (e.g., My Custom Split)"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleCreatePlan();
                  }
                }}
              />
              <Button
                onClick={handleCreatePlan}
                disabled={!newPlanName || mutations.create.isPending}
              >
                {mutations.create.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>

          {/* Templates */}
          <PlanTemplates
            onSelectTemplate={(template) => {
              setNewPlanName(template.name);
              templateCreation.setSelectedTemplate(template.id);
            }}
          />
          {templateCreation.selectedTemplate && (
            <div className="space-y-3 border-t pt-4">
              <div className="text-muted-foreground text-sm">
                Template selected:{" "}
                {TEMPLATE_DEFINITIONS[templateCreation.selectedTemplate]?.name}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    templateCreation.setSelectedTemplate(null);
                    setNewPlanName("");
                  }}
                >
                  Clear Template
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateFromTemplate}
                  disabled={
                    !newPlanName ||
                    templateCreation.isCreating ||
                    templateCreation.exercises.isLoading ||
                    !templateCreation.exercises.data
                  }
                >
                  {templateCreation.isCreating
                    ? "Creating..."
                    : templateCreation.exercises.isLoading
                      ? "Loading..."
                      : `Create Plan with Template`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
