"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ExercisesPage() {
  const [q, setQ] = useState("");
  const list = api.exercise.list.useQuery({ q });
  const create = api.exercise.create.useMutation();
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <div className="flex gap-2">
          <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="button" onClick={() => list.refetch()}>Search</Button>
        </div>
      </Card>
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Muscle group" value={group} onChange={(e) => setGroup(e.target.value)} />
          <Button
            type="button"
            onClick={async () => {
              if (!name || !group) return;
              await create.mutateAsync({ name, muscleGroup: group });
              setName("");
              setGroup("");
              await list.refetch();
            }}
          >
            Add
          </Button>
        </div>
      </Card>
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {(list.data ?? []).map((e) => (
            <div key={e.id} className="border rounded p-2">
              <div className="font-medium">{e.name}</div>
              <div className="text-sm text-muted-foreground">{e.muscleGroup}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}