"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { Plus, Scale, Percent } from "lucide-react";

export function ProgressView() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [notes, setNotes] = useState("");

  const utils = api.useUtils();
  const progress = api.progress.list.useQuery(
    { userId },
    { enabled: !!userId },
  );
  const createEntry = api.progress.create.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setWeight("");
      setBodyFat("");
      setNotes("");
      void utils.progress.list.invalidate();
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

  const data =
    progress.data?.map((p) => ({
      date: format(new Date(p.date), "MMM d"),
      weight: p.weight,
      bodyFat: p.bodyFat,
    })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Progress Tracking
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Track your weight and body composition over time
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
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
              <Button
                type="submit"
                className="w-full"
                disabled={createEntry.isPending}
              >
                {createEntry.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Scale className="text-primary h-4 w-4" />
              Weight History
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] px-4 pb-4">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Percent className="text-secondary-foreground h-4 w-4" />
              Body Fat %
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] px-4 pb-4">
            {data.length > 0 && data.some((d) => d.bodyFat) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bodyFat"
                    stroke="hsl(var(--secondary-foreground))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No body fat data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            {progress.data
              ?.slice()
              .reverse()
              .slice(0, 5)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="border-border/50 hover:bg-accent/50 flex items-center justify-between rounded-lg border p-2.5 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {entry.notes ?? "No notes"}
                    </p>
                  </div>
                  <div className="ml-3 text-right">
                    {entry.weight && (
                      <p className="text-sm font-bold">{entry.weight} kg</p>
                    )}
                    {entry.bodyFat && (
                      <p className="text-muted-foreground text-xs">
                        {entry.bodyFat}% BF
                      </p>
                    )}
                  </div>
                </div>
              ))}
            {(!progress.data || progress.data.length === 0) && (
              <div className="text-muted-foreground py-8 text-center text-sm">
                <Scale className="mx-auto mb-3 h-10 w-10 opacity-50" />
                <p>No progress entries yet. Add your first entry!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
