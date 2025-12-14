"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Item = { exerciseId: string; sets: number; reps: number };

export default function WorkoutBuilderPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const [mg, setMg] = useState("");
  const [eq, setEq] = useState("");
  const ex = api.exercise.list.useQuery({ take: 200, muscleGroup: mg || undefined, equipment: eq || undefined });
  const create = api.plan.create.useMutation();

  const [name, setName] = useState("");
  const [days, setDays] = useState<{ title: string; items: Item[] }[]>([
    { title: "Push", items: [] },
  ]);

  const addDay = () => setDays((d) => [...d, { title: "New Day", items: [] }]);
  const addItem = (dayIdx: number, exId: string) =>
    setDays((d) => {
      const next = [...d];
      next[dayIdx]!.items.push({ exerciseId: exId, sets: 3, reps: 10 });
      return next;
    });

  const save = async () => {
    if (!userId || !name || days.length === 0) return;
    await create.mutateAsync({
      userId,
      name,
      days: days.map((d, i) => ({ title: d.title, order: i, items: d.items })),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 space-y-3">
        <Input placeholder="Plan name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <Button type="button" onClick={addDay}>Add day</Button>
          <Button type="button" onClick={save}>Save</Button>
        </div>
      </Card>
      <Card className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Muscle group" value={mg} onChange={(e) => setMg(e.target.value)} />
          <Input placeholder="Equipment" value={eq} onChange={(e) => setEq(e.target.value)} />
        </div>
      </Card>
      {days.map((d, idx) => (
        <Card key={idx} className="p-4 space-y-2">
          <Input value={d.title} onChange={(e) => setDays((prev) => prev.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} />
          <div className="grid grid-cols-4 gap-2">
            {(ex.data ?? []).map((e) => (
              <Button key={e.id} type="button" variant="outline" onClick={() => addItem(idx, e.id)}>
                {e.name}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {d.items.map((it, j) => (
              <div key={j} className="flex items-center gap-2">
                <span className="text-sm">{ex.data?.find((x) => x.id === it.exerciseId)?.name}</span>
                <Input className="w-20" type="number" value={it.sets} onChange={(e) => setDays((prev) => prev.map((x, i) => i === idx ? { ...x, items: x.items.map((y, k) => k === j ? { ...y, sets: Number(e.target.value) } : y) } : x))} />
                <Input className="w-20" type="number" value={it.reps} onChange={(e) => setDays((prev) => prev.map((x, i) => i === idx ? { ...x, items: x.items.map((y, k) => k === j ? { ...y, reps: Number(e.target.value) } : y) } : x))} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}