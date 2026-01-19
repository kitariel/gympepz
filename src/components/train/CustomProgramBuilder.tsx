"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useActiveProgram } from "@/hooks/useActiveProgram";
import { useCustomPrograms } from "@/hooks/useCustomPrograms";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useTrainBuilderDraft } from "@/hooks/useTrainBuilderDraft";
import { useWorkoutDraft } from "@/hooks/useWorkoutDraft";
import { api } from "@/trpc/react";
import type { ProgramTemplateDay, ProgramTemplateItem, TemplateDayNumber } from "@/lib/program-templates/types";

type BuilderDay = {
  day: TemplateDayNumber;
  label: string;
  isRestDay: boolean;
  items: ProgramTemplateItem[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function defaultDays(): BuilderDay[] {
  const days: BuilderDay[] = [];
  for (let i = 1; i <= 7; i += 1) {
    const d = i as TemplateDayNumber;
    days.push({
      day: d,
      label: `Day ${d}`,
      isRestDay: false,
      items: [],
    });
  }
  return days;
}

export function CustomProgramBuilder() {
  const router = useRouter();
  const { isOnline } = useOnlineStatus();
  const { saveActiveProgram, selectTemplate } = useActiveProgram();
  const { clearDraft } = useWorkoutDraft();
  const { get: getCustomProgram, upsert: upsertCustomProgram } = useCustomPrograms();
  const { hydrated: draftHydrated, draft, save: saveDraft, clear: clearDraftStorage } =
    useTrainBuilderDraft();

  const [programName, setProgramName] = useState("My 7-day plan");
  const [days, setDays] = useState<BuilderDay[]>(() => defaultDays());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [restoredNotice, setRestoredNotice] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState<TemplateDayNumber | null>(null);
  const [pickerTab, setPickerTab] = useState<"library" | "manual">("manual");
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [manualName, setManualName] = useState("");

  const exercisesQuery = api.exercise.list.useQuery(
    {
      q: query.trim() || undefined,
      muscleGroup: muscleGroup.trim() || undefined,
      equipment: equipment.trim() || undefined,
      difficulty: difficulty.trim() || undefined,
      take: 50,
    },
    { enabled: isOnline && pickerOpen && pickerTab === "library" },
  );

  // Offline-safe: if offline or the library request fails, force Manual tab.
  useEffect(() => {
    if (!pickerOpen) return;
    if (!isOnline) {
      setPickerTab("manual");
      return;
    }
    if (pickerTab === "library" && exercisesQuery.isError) {
      setPickerTab("manual");
    }
  }, [pickerOpen, isOnline, pickerTab, exercisesQuery.isError]);

  const openPicker = (day: TemplateDayNumber) => {
    setPickerDay(day);
    setPickerTab(isOnline ? "library" : "manual");
    setQuery("");
    setMuscleGroup("");
    setEquipment("");
    setDifficulty("");
    setManualName("");
    setPickerOpen(true);
  };

  const addItemToDay = (day: TemplateDayNumber, partial: Pick<ProgramTemplateItem, "nameFallback"> & Partial<ProgramTemplateItem>) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const nextOrder = d.items.length;
        const next: ProgramTemplateItem = {
          order: nextOrder,
          nameFallback: partial.nameFallback,
          exerciseId: partial.exerciseId,
          sets: partial.sets ?? 3,
          reps: partial.reps ?? "10",
          weight: partial.weight,
        };
        return { ...d, items: [...d.items, next] };
      }),
    );
  };

  const removeItem = (day: TemplateDayNumber, order: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const nextItems = d.items.filter((it) => it.order !== order).map((it, idx) => ({ ...it, order: idx }));
        return { ...d, items: nextItems };
      }),
    );
  };

  const moveItem = (day: TemplateDayNumber, fromIndex: number, toIndex: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const items = d.items.slice().sort((a, b) => a.order - b.order);
        if (fromIndex < 0 || fromIndex >= items.length) return d;
        if (toIndex < 0 || toIndex >= items.length) return d;
        const next = items.slice();
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved!);
        const normalized = next.map((it, idx) => ({ ...it, order: idx }));
        return { ...d, items: normalized };
      }),
    );
  };

  const updateItem = (
    day: TemplateDayNumber,
    order: number,
    patch: Partial<Pick<ProgramTemplateItem, "sets" | "reps" | "weight" | "nameFallback">>,
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const nextItems = d.items.map((it) => (it.order === order ? { ...it, ...patch } : it));
        return { ...d, items: nextItems };
      }),
    );
  };

  const totalExercises = useMemo(
    () => days.reduce((sum, d) => sum + d.items.length, 0),
    [days],
  );

  const canSave = totalExercises > 0 && programName.trim().length > 0;

  const saveProgram = () => {
    const planDays: ProgramTemplateDay[] = days.map((d) => ({
      day: d.day,
      label: d.label.trim() || `Day ${d.day}`,
      isRestDay: d.isRestDay,
      items: d.isRestDay ? [] : d.items,
    }));

    const id = editingId ?? makeId("custom");
    const now = nowIso();

    // Ensure a fresh workout uses this program
    clearDraft();
    selectTemplate(id);
    saveActiveProgram({
      templateId: id,
      name: programName.trim(),
      createdAt: now,
      updatedAt: now,
      plan: { days: planDays },
    });
    upsertCustomProgram({
      id,
      name: programName.trim(),
      createdAt: now,
      updatedAt: now,
      plan: { days: planDays },
    });

    router.push("/train/overview");
  };

  const { debounced: debouncedSaveDraft } = useDebouncedCallback(
    (next: { editingId: string | null; programName: string; days: BuilderDay[] }) => {
      saveDraft({
        editingId: next.editingId,
        programName: next.programName,
        days: next.days,
        updatedAt: nowIso(),
      });
    },
    600,
  );

  // If editing, load plan from storage via ?id=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;
    const record = getCustomProgram(id);
    if (!record) return;

    setEditingId(record.id);
    setProgramName(record.name);
    // Ensure 7 days exist
    const seeded = defaultDays();
    const merged = seeded.map((seed) => {
      const found = record.plan.days.find((d) => d.day === seed.day);
      if (!found) return seed;
      return {
        day: found.day,
        label: found.label,
        isRestDay: Boolean(found.isRestDay),
        items: (found.items ?? []).slice().sort((a, b) => a.order - b.order),
      };
    });
    setDays(merged);
  }, [getCustomProgram]);

  // Restore-on-load for "new plan": if there's an unsaved builder draft, restore it.
  useEffect(() => {
    if (!draftHydrated) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) return; // editing flow handled above
    if (!draft) return;
    if (draft.editingId != null) return; // don't apply edit-drafts on new plan

    setEditingId(null);
    setProgramName(draft.programName);
    const seeded = defaultDays();
    const merged = seeded.map((seed) => {
      const found = draft.days.find((d) => d.day === seed.day);
      if (!found) return seed;
      return {
        day: found.day,
        label: found.label,
        isRestDay: Boolean(found.isRestDay),
        items: (found.items ?? []).slice().sort((a, b) => a.order - b.order),
      };
    });
    setDays(merged);
    setRestoredNotice(true);
  }, [draftHydrated, draft]);

  // Autosave draft (debounced) whenever builder state changes.
  useEffect(() => {
    if (!draftHydrated) return;
    debouncedSaveDraft({ editingId, programName, days });
  }, [draftHydrated, editingId, programName, days, debouncedSaveDraft]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {editingId ? "Edit your plan" : "Create your plan"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan your week ahead. Works offline; when online you can search your exercise library.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "secondary" : "outline"} className="text-[10px]">
            {isOnline ? "Online" : "Offline"}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {totalExercises} exercises
          </Badge>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Program name</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Input value={programName} onChange={(e) => setProgramName(e.target.value)} />
        </CardContent>
      </Card>

      {restoredNotice ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Draft restored</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              We restored your unsaved draft. You can keep editing or clear it.
            </p>
            <Button
              variant="outline"
              className="h-10"
              onClick={() => {
                clearDraftStorage();
                setRestoredNotice(false);
              }}
            >
              Clear draft
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {days.map((d) => (
          <Card key={d.day} className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <CardTitle className="text-sm">Day {d.day}</CardTitle>
                  <Input
                    value={d.label}
                    onChange={(e) =>
                      setDays((prev) =>
                        prev.map((x) => (x.day === d.day ? { ...x, label: e.target.value } : x)),
                      )
                    }
                    placeholder="Label (e.g. Upper Body, Cardio)"
                  />
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {d.isRestDay ? "Rest" : `${d.items.length} ex`}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Checkbox
                  checked={d.isRestDay}
                  onCheckedChange={(v) =>
                    setDays((prev) =>
                      prev.map((x) =>
                        x.day === d.day ? { ...x, isRestDay: Boolean(v), items: Boolean(v) ? [] : x.items } : x,
                      ),
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">Rest day</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              {d.isRestDay ? (
                <p className="text-sm text-muted-foreground">Rest / recovery.</p>
              ) : d.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No exercises yet.</p>
              ) : (
                <div className="space-y-2">
                  {d.items
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((it, idx, arr) => (
                      <div key={`${d.day}-${it.order}`} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Input
                            value={it.nameFallback ?? ""}
                            onChange={(e) => updateItem(d.day, it.order, { nameFallback: e.target.value })}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9"
                              disabled={idx === 0}
                              onClick={() => moveItem(d.day, idx, idx - 1)}
                            >
                              Up
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9"
                              disabled={idx === arr.length - 1}
                              onClick={() => moveItem(d.day, idx, idx + 1)}
                            >
                              Down
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9"
                              onClick={() => removeItem(d.day, it.order)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-12 gap-2">
                          <div className="col-span-4">
                            <Label className="text-xs">Sets</Label>
                            <Input
                              value={String(it.sets)}
                              inputMode="numeric"
                              onChange={(e) =>
                                updateItem(d.day, it.order, {
                                  sets: Math.max(0, Number(e.target.value) || 0),
                                })
                              }
                            />
                          </div>
                          <div className="col-span-4">
                            <Label className="text-xs">Reps / time</Label>
                            <Input
                              value={it.reps}
                              onChange={(e) => updateItem(d.day, it.order, { reps: e.target.value })}
                              placeholder="e.g. 10 or 20 min"
                            />
                          </div>
                          <div className="col-span-4">
                            <Label className="text-xs">Weight / notes</Label>
                            <Input
                              value={it.weight ?? ""}
                              onChange={(e) =>
                                updateItem(d.day, it.order, {
                                  weight: e.target.value.trim() ? e.target.value : undefined,
                                })
                              }
                              placeholder="optional"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {!d.isRestDay && (
                <Button className="h-10 w-full" variant="outline" onClick={() => openPicker(d.day)}>
                  Add exercise
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="h-10 flex-1" disabled={!canSave} onClick={saveProgram}>
          {editingId ? "Save changes" : "Save program"}
        </Button>
        <Button variant="outline" className="h-10 flex-1" onClick={() => router.push("/train")}>
          Cancel
        </Button>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add exercise {pickerDay ? `to Day ${pickerDay}` : ""}</DialogTitle>
          </DialogHeader>

          <Tabs value={pickerTab} onValueChange={(v) => setPickerTab(v as "library" | "manual")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library" disabled={!isOnline}>
                Available exercises
              </TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="mt-4 space-y-4">
              {!isOnline ? (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="px-4 pt-4 pb-2">
                    <CardTitle className="text-base">Offline</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground">
                      You’re offline, so the exercise library isn’t available. Use Manual.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {exercisesQuery.isError ? (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="px-4 pt-4 pb-2">
                        <CardTitle className="text-base">Exercise library unavailable</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 px-4 pb-4">
                        <p className="text-sm text-muted-foreground">
                          We couldn’t load exercises right now. You can still add exercises manually.
                        </p>
                        <Button
                          variant="outline"
                          className="h-10 w-full sm:w-auto"
                          onClick={() => setPickerTab("manual")}
                        >
                          Switch to Manual
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}

                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, muscle group, equipment…"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Muscle group</Label>
                      <Input
                        value={muscleGroup}
                        onChange={(e) => setMuscleGroup(e.target.value)}
                        placeholder="e.g. Chest"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Equipment</Label>
                      <Input
                        value={equipment}
                        onChange={(e) => setEquipment(e.target.value)}
                        placeholder="e.g. Dumbbell"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Difficulty</Label>
                      <Input
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        placeholder="e.g. Beginner"
                      />
                    </div>
                  </div>

                  <div className="max-h-72 overflow-auto rounded-lg border">
                    {exercisesQuery.isLoading ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Loading exercises…
                      </div>
                    ) : exercisesQuery.isError ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        Failed to load exercises.
                      </div>
                    ) : (
                      <>
                        {(exercisesQuery.data ?? []).map((ex) => (
                          <button
                            key={ex.id}
                            type="button"
                            className="flex w-full items-start justify-between gap-3 border-b px-3 py-2 text-left text-sm hover:bg-accent"
                            onClick={() => {
                              if (!pickerDay) return;
                              addItemToDay(pickerDay, { nameFallback: ex.name, exerciseId: ex.id });
                              setPickerOpen(false);
                            }}
                          >
                            <span className="font-medium">{ex.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {ex.muscleGroup}
                            </span>
                          </button>
                        ))}
                        {(exercisesQuery.data ?? []).length === 0 && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            No results. Try clearing filters.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-4 space-y-2">
              <Label>Manual entry</Label>
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Push-ups, Brisk walk"
              />
              <Button
                className="h-10 w-full"
                disabled={!pickerDay || manualName.trim().length === 0}
                onClick={() => {
                  if (!pickerDay) return;
                  addItemToDay(pickerDay, { nameFallback: manualName.trim() });
                  setPickerOpen(false);
                }}
              >
                Add
              </Button>
              <p className="text-xs text-muted-foreground">
                Tip: For cardio, use reps/time like “20 min” and sets as “1”.
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

