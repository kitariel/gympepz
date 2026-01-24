"use client";

import { use } from "react";
import { GoalDetail } from "@/features/goals/components/GoalDetail";

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = use(params);
  return <GoalDetail goalId={goalId} />;
}
