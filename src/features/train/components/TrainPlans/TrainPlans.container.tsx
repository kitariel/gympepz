"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useCustomPrograms } from "@/hooks/useCustomPrograms";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import type { CustomProgramRecord } from "@/lib/storage/customProgramsRepo";
import { TrainPlansView } from "./TrainPlans.view";

function nowIso(): string {
  return new Date().toISOString();
}

export function TrainPlans() {
  // Container: owns plan actions + routing, keeps the view stateless.
  const router = useRouter();
  const { items, hydrated, remove, upsert } = useCustomPrograms();
  const { saveActiveProgram, selectTemplate } = useActiveProgram();
  const { clearDraft } = useWorkoutDraft();

  const handleUse = useCallback(
    (id: string) => {
      const plan = items.find((p) => p.id === id);
      if (!plan) return;
      clearDraft();
      selectTemplate(plan.id);
      saveActiveProgram({
        templateId: plan.id,
        name: plan.name,
        createdAt: plan.createdAt,
        updatedAt: nowIso(),
        plan: plan.plan,
      });
      router.push("/train/overview");
    },
    [items, clearDraft, selectTemplate, saveActiveProgram, router],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const plan = items.find((p) => p.id === id);
      if (!plan) return;
      const copyId = `${plan.id}_copy_${Date.now()}`;
      const next: CustomProgramRecord = {
        ...plan,
        id: copyId,
        name: `${plan.name} (Copy)`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      upsert(next);
    },
    [items, upsert],
  );

  return (
    <TrainPlansView
      hydrated={hydrated}
      items={items}
      createHref="/train/build"
      backHref="/train"
      getEditHref={(id) => `/train/build?id=${encodeURIComponent(id)}`}
      onUse={handleUse}
      onDuplicate={handleDuplicate}
      onDelete={remove}
    />
  );
}
