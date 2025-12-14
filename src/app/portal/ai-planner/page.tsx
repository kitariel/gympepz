"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AIPlannerPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState(3);
  const [experience, setExperience] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [equipment, setEquipment] = useState<"Full Gym" | "Dumbbells" | "Home Setup">("Full Gym");
  const gen = api.plan.generate.useMutation();
  const adjust = api.plan.adjustDifficulty.useMutation();
  const [createdId, setCreatedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!userId || !goal) return;
    const res = await gen.mutateAsync({ userId, goal, scheduleDays: days, experience, equipment, useAI: true });
    if (res?.id) setCreatedId(res.id);
  };

  const handleMakeHarder = async () => {
    if (!createdId) return;
    await adjust.mutateAsync({ planId: createdId, mode: "harder" });
  };

  const handleMakeEasier = async () => {
    if (!createdId) return;
    await adjust.mutateAsync({ planId: createdId, mode: "easier" });
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 space-y-3">
        <Input placeholder="Goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
        <Input type="number" min={3} max={6} value={days} onChange={(e) => setDays(Number(e.target.value))} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Experience" value={experience} onChange={(e) => setExperience(e.target.value as any)} />
          <Input placeholder="Equipment" value={equipment} onChange={(e) => setEquipment(e.target.value as any)} />
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={handleGenerate}>Generate Workout Plan</Button>
          <Link href="/portal/plans"><Button type="button" variant="outline">View Plans</Button></Link>
        </div>
        {createdId && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleMakeHarder}>Make harder</Button>
            <Button type="button" variant="outline" onClick={handleMakeEasier}>Make easier</Button>
          </div>
        )}
      </Card>
    </div>
  );
}