"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PlanDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const plan = api.plan.get.useQuery({ id }, { enabled: !!id });
  const updateMeta = api.plan.updateMeta.useMutation();
  const addDay = api.plan.addDay.useMutation();
  const addEx = api.plan.addExercise.useMutation();
  const updItem = api.plan.updateItem.useMutation();
  const delItem = api.plan.deleteItem.useMutation();
  const [name, setName] = useState("");
  const [newDayTitle, setNewDayTitle] = useState("");
  const [newExId, setNewExId] = useState("");
  const [targetDayId, setTargetDayId] = useState<string | null>(null);

  const p = plan.data as any;

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 space-y-2">
        <Input placeholder="Plan name" value={name || p?.name || ""} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <Button type="button" onClick={async () => { if (!id && !p?.id) return; await updateMeta.mutateAsync({ id: id || p.id, name: name || p?.name || "" }); await plan.refetch(); }}>Save Name</Button>
          <Input placeholder="New day title" value={newDayTitle} onChange={(e) => setNewDayTitle(e.target.value)} />
          <Button type="button" onClick={async () => { if (!p?.days) return; await addDay.mutateAsync({ planId: id, title: newDayTitle || "New Day", order: p.days.length }); setNewDayTitle(""); await plan.refetch(); }}>Add Day</Button>
        </div>
      </Card>
      {(p?.days ?? []).map((d: any) => (
        <Card key={d.id} className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="font-medium">{d.title}</div>
            <Button type="button" variant="outline" onClick={() => setTargetDayId(d.id)}>Target Day</Button>
          </div>
          <div className="space-y-2">
            {(d.items ?? []).map((it: any) => (
              <div key={it.id} className="flex items-center gap-2">
                <span className="text-sm">{it.exerciseId}</span>
                <Input className="w-20" type="number" value={it.sets ?? 3} onChange={async (e) => { await updItem.mutateAsync({ id: it.id, sets: Number(e.target.value) }); await plan.refetch(); }} />
                <Input className="w-20" type="number" value={it.reps ?? 8} onChange={async (e) => { await updItem.mutateAsync({ id: it.id, reps: Number(e.target.value) }); await plan.refetch(); }} />
                <Button type="button" variant="destructive" onClick={async () => { await delItem.mutateAsync({ id: it.id }); await plan.refetch(); }}>Delete</Button>
              </div>
            ))}
          </div>
        </Card>
      ))}
      <Card className="p-4 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Exercise ID" value={newExId} onChange={(e) => setNewExId(e.target.value)} />
          <Button type="button" onClick={async () => { if (!targetDayId || !newExId) return; await addEx.mutateAsync({ dayId: targetDayId, exerciseId: newExId, sets: 3, reps: 10 }); setNewExId(""); await plan.refetch(); }}>Add Exercise</Button>
        </div>
      </Card>
    </div>
  );
}