"use client";

import { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PlansPage() {
  const { data: session } = useSession();
  const userId = useMemo(() => session?.user?.id ?? "", [session?.user?.id]);
  const list = api.plan.listByUser.useQuery({ userId }, { enabled: !!userId });
  const dup = api.plan.duplicate.useMutation();
  const del = api.plan.delete.useMutation();
  const setActive = api.plan.setActive.useMutation();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState<{ title: string; order: number; items: { exerciseId: string; sets: number; reps: number }[] }[]>([]);
  const [mg, setMg] = useState("");
  const [eq, setEq] = useState("");
  const ex = api.exercise.list.useQuery({ take: 200, muscleGroup: mg || undefined, equipment: eq || undefined });
  const create = api.plan.create.useMutation();

  const addDay = () => setDays((d) => [...d, { title: `Day ${d.length + 1}`, order: d.length, items: [] }]);
  const addItem = (dayIdx: number, exId: string) => setDays((d) => { const next = [...d]; next[dayIdx]!.items.push({ exerciseId: exId, sets: 3, reps: 10 }); return next; });
  const save = async () => { if (!userId || !name || days.length === 0) return; await create.mutateAsync({ userId, name, days }); setOpen(false); setName(""); setDays([]); await list.refetch(); };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div className="font-semibold">My Plans</div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button">Create Plan</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Card className="p-4 space-y-2">
                  <Input placeholder="Plan name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Button type="button" variant="outline" onClick={addDay}>Add Day</Button>
                </Card>
                {days.map((d, idx) => (
                  <Card key={idx} className="p-4 space-y-2">
                    <div className="font-medium">{d.title}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Muscle group" value={mg} onChange={(e) => setMg(e.target.value)} />
                      <Input placeholder="Equipment" value={eq} onChange={(e) => setEq(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(ex.data ?? []).slice(0, 10).map((e) => (
                        <Button key={e.id} type="button" variant="outline" onClick={() => addItem(idx, e.id)}>{e.name}</Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {d.items.map((it, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm">{it.exerciseId}</span>
                          <Input className="w-20" type="number" value={it.sets} onChange={(e) => { const v = Number(e.target.value); setDays((prev) => { const next = [...prev]; next[idx]!.items[i]!.sets = v; return next; }); }} />
                          <Input className="w-20" type="number" value={it.reps} onChange={(e) => { const v = Number(e.target.value); setDays((prev) => { const next = [...prev]; next[idx]!.items[i]!.reps = v; return next; }); }} />
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={save}>Save Plan</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {(list.data ?? []).map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">Days: {p.daysCount} • Updated: {new Date(p.updatedAt as unknown as string).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/portal/plans/${p.id}`}><Button type="button" variant="outline">Edit</Button></Link>
                <Button type="button" variant={p.isActive ? "default" : "outline"} onClick={async () => { if (!userId) return; await setActive.mutateAsync({ userId, planId: p.id }); await list.refetch(); }}>{p.isActive ? "Active" : "Set Active"}</Button>
                <Button type="button" variant="outline" onClick={async () => { await dup.mutateAsync({ id: p.id }); await list.refetch(); }}>Duplicate</Button>
                <Button type="button" variant="destructive" onClick={async () => { await del.mutateAsync({ id: p.id }); await list.refetch(); }}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}