"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useCustomPrograms } from "@/hooks/useCustomPrograms";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";

function nowIso(): string {
  return new Date().toISOString();
}

export default function TrainPlansPage() {
  const router = useRouter();
  const { items, hydrated, remove, upsert } = useCustomPrograms();
  const { saveActiveProgram, selectTemplate } = useActiveProgram();
  const { clearDraft } = useWorkoutDraft();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved locally on this device. Create, edit, reuse anytime.
          </p>
        </div>
        <Button asChild className="h-10">
          <Link href="/train/build">Create new</Link>
        </Button>
      </div>

      {!hydrated ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">No saved plans yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <p className="text-sm text-muted-foreground">
              Create a plan to save it here.
            </p>
            <Button asChild className="h-10 w-full sm:w-auto">
              <Link href="/train/build">Create your first plan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <Card key={p.id} className="border-0 shadow-sm">
              <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {p.plan.days.filter((d) => !d.isRestDay && d.items.length > 0).length} training days
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-4 pb-4 sm:flex-row">
                <Button
                  className="h-10 flex-1"
                  onClick={() => {
                    clearDraft();
                    selectTemplate(p.id);
                    saveActiveProgram({
                      templateId: p.id,
                      name: p.name,
                      createdAt: p.createdAt,
                      updatedAt: nowIso(),
                      plan: p.plan,
                    });
                    router.push("/train/overview");
                  }}
                >
                  Use
                </Button>
                <Button asChild variant="outline" className="h-10 flex-1">
                  <Link href={`/train/build?id=${encodeURIComponent(p.id)}`}>
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => {
                    const copyId = `${p.id}_copy_${Date.now()}`;
                    upsert({
                      ...p,
                      id: copyId,
                      name: `${p.name} (Copy)`,
                      createdAt: nowIso(),
                      updatedAt: nowIso(),
                    });
                  }}
                >
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  className="h-10 flex-1"
                  onClick={() => remove(p.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button asChild variant="outline" className="h-10 w-full sm:w-auto">
        <Link href="/train">Back</Link>
      </Button>
    </div>
  );
}

