"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

export function ProgressView() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");

  const utils = api.useUtils();
  const progress = api.progress.list.useQuery({ userId }, { enabled: !!userId });
  const createEntry = api.progress.create.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setWeight("");
      setBodyFat("");
      setNotes("");
      utils.progress.list.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    await createEntry.mutateAsync({
      userId,
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      notes,
    });
  };

  const data = progress.data?.map((p) => ({
    date: format(new Date(p.date), "MMM d"),
    weight: p.weight,
    bodyFat: p.bodyFat,
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Progress</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 75.5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bodyFat">Body Fat (%)</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="e.g. 15.0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling?"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createEntry.isPending}>
                {createEntry.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Body Fat %</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {data.length > 0 && data.some((d) => d.bodyFat) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bodyFat" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No body fat data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.data?.slice().reverse().slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{format(new Date(entry.date), "PPP")}</p>
                  <p className="text-sm text-muted-foreground">{entry.notes || "No notes"}</p>
                </div>
                <div className="text-right">
                  {entry.weight && <p className="font-bold">{entry.weight} kg</p>}
                  {entry.bodyFat && <p className="text-sm text-muted-foreground">{entry.bodyFat}% BF</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
