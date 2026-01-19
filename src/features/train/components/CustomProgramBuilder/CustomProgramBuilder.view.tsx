import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { CustomProgramBuilderViewProps } from "./CustomProgramBuilder.types";

export function CustomProgramBuilderView(props: CustomProgramBuilderViewProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-6 pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {props.editingId ? "Edit your plan" : "Create your plan"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan your week ahead. Works offline; when online you can search your exercise library.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={props.isOnline ? "secondary" : "outline"} className="text-[10px]">
            {props.isOnline ? "Online" : "Offline"}
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            {props.totalExercises} exercises
          </Badge>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Program name</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Input
            value={props.programName}
            onChange={(e) => props.onProgramNameChange(e.target.value)}
          />
        </CardContent>
      </Card>

      {props.restoredNotice ? (
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">Draft restored</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              We restored your unsaved draft. You can keep editing or clear it.
            </p>
            <Button variant="outline" className="h-10" onClick={props.onClearDraft}>
              Clear draft
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {props.days.map((d) => (
          <Card key={d.day} className="border-0 shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <CardTitle className="text-sm">Day {d.day}</CardTitle>
                  <Input
                    value={d.label}
                    onChange={(e) => props.onDayLabelChange(d.day, e.target.value)}
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
                  onCheckedChange={(v) => props.onDayRestChange(d.day, Boolean(v))}
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
                            onChange={(e) =>
                              props.onUpdateItem(d.day, it.order, { nameFallback: e.target.value })
                            }
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9"
                              disabled={idx === 0}
                              onClick={() => props.onMoveItem(d.day, idx, idx - 1)}
                            >
                              Up
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9"
                              disabled={idx === arr.length - 1}
                              onClick={() => props.onMoveItem(d.day, idx, idx + 1)}
                            >
                              Down
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9"
                              onClick={() => props.onRemoveItem(d.day, it.order)}
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
                                props.onUpdateItem(d.day, it.order, {
                                  sets: Math.max(0, Number(e.target.value) || 0),
                                })
                              }
                            />
                          </div>
                          <div className="col-span-4">
                            <Label className="text-xs">Reps / time</Label>
                            <Input
                              value={it.reps}
                              onChange={(e) => props.onUpdateItem(d.day, it.order, { reps: e.target.value })}
                              placeholder="e.g. 10 or 20 min"
                            />
                          </div>
                          <div className="col-span-4">
                            <Label className="text-xs">Weight / notes</Label>
                            <Input
                              value={it.weight ?? ""}
                              onChange={(e) =>
                                props.onUpdateItem(d.day, it.order, {
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
                <Button
                  className="h-10 w-full"
                  variant="outline"
                  onClick={() => props.onOpenPicker(d.day)}
                >
                  Add exercise
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="h-10 flex-1" disabled={!props.canSave} onClick={props.onSave}>
          {props.editingId ? "Save changes" : "Save program"}
        </Button>
        <Button variant="outline" className="h-10 flex-1" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>

      <Dialog open={props.pickerOpen} onOpenChange={props.onPickerOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Add exercise {props.pickerDay ? `to Day ${props.pickerDay}` : ""}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={props.pickerTab} onValueChange={(v) => props.onPickerTabChange(v as "library" | "manual")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library" disabled={!props.isOnline}>
                Available exercises
              </TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="mt-4 space-y-4">
              {!props.isOnline ? (
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
                  {props.exercises.status === "error" ? (
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
                          onClick={() => props.onPickerTabChange("manual")}
                        >
                          Switch to Manual
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null}

                  <div className="space-y-2">
                    <Label>Search</Label>
                    <Input
                      value={props.query}
                      onChange={(e) => props.onQueryChange(e.target.value)}
                      placeholder="Search by name, muscle group, equipment…"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Muscle group</Label>
                      <Input
                        value={props.muscleGroup}
                        onChange={(e) => props.onMuscleGroupChange(e.target.value)}
                        placeholder="e.g. Chest"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Equipment</Label>
                      <Input
                        value={props.equipment}
                        onChange={(e) => props.onEquipmentChange(e.target.value)}
                        placeholder="e.g. Dumbbell"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Difficulty</Label>
                      <Input
                        value={props.difficulty}
                        onChange={(e) => props.onDifficultyChange(e.target.value)}
                        placeholder="e.g. Beginner"
                      />
                    </div>
                  </div>

                  <div className="max-h-72 overflow-auto rounded-lg border">
                    {props.exercises.status === "loading" ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">Loading exercises…</div>
                    ) : props.exercises.status === "error" ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">Failed to load exercises.</div>
                    ) : (
                      <>
                        {props.exercises.items.map((ex) => (
                          <button
                            key={ex.id}
                            type="button"
                            className="flex w-full items-start justify-between gap-3 border-b px-3 py-2 text-left text-sm hover:bg-accent"
                            onClick={() => props.onSelectExercise({ id: ex.id, name: ex.name })}
                          >
                            <span className="font-medium">{ex.name}</span>
                            <span className="text-xs text-muted-foreground">{ex.muscleGroup}</span>
                          </button>
                        ))}
                        {props.exercises.items.length === 0 && (
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
                value={props.manualName}
                onChange={(e) => props.onManualNameChange(e.target.value)}
                placeholder="e.g. Push-ups, Brisk walk"
              />
              <Button
                className="h-10 w-full"
                disabled={!props.pickerDay || props.manualName.trim().length === 0}
                onClick={props.onAddManual}
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

