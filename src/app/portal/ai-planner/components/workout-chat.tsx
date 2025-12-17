"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, Dumbbell } from "lucide-react";

type Props = {
  userId: string;
  goal: string;
  days: number;
  experience: "Beginner" | "Intermediate" | "Advanced";
  equipment: "Full Gym" | "Dumbbells" | "Home Setup";
  onPlanCreated: (id: string) => void;
};

type Msg = { role: "user" | "assistant"; text?: string; planId?: string };
type PreviewItem = {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  muscleGroup?: string;
};
type PreviewDay = { title: string; order: number; items: PreviewItem[] };
type PreviewPlan = { name: string; days: PreviewDay[] };

export default function WorkoutChat({
  userId,
  goal,
  days,
  experience,
  equipment,
  onPlanCreated,
}: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [latestPlanId, setLatestPlanId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const suggest = api.plan.suggest.useMutation();
  const create = api.plan.create.useMutation();
  const [preview, setPreview] = useState<PreviewPlan | null>(null);
  const [exp, setExp] = useState<"Beginner" | "Intermediate" | "Advanced">(
    experience,
  );
  const [equip, setEquip] = useState<
    "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid"
  >(equipment);
  const [lastText, setLastText] = useState<string>("");
  const plan = api.plan.get.useQuery(
    { id: latestPlanId },
    { enabled: !!latestPlanId },
  );

  const formatGroup = (s?: string) =>
    s
      ? s
          .split(/\s+/)
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
          .join(" ")
      : undefined;

  useEffect(() => {
    if (plan.data && latestPlanId) {
      setMessages((m) => [...m, { role: "assistant", planId: latestPlanId }]);
    }
  }, [plan.data, latestPlanId]);

  const send = async () => {
    if (!userId || !input.trim()) return;
    const text = input.trim();
    setInput("");
    setLastText(text);
    if (text) setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    const scheduleDays = days;
    const mappedEquip: "Full Gym" | "Dumbbells" | "Home Setup" | undefined =
      equip === "Hybrid" ? undefined : equip;
    try {
      const sg = (await suggest.mutateAsync({
        goal: text || goal || "Workout",
        scheduleDays,
        experience: exp,
        equipment: mappedEquip,
        rawText: text,
        conversationHistory: messages
          .filter((m) => m.text)
          .map((m) => ({ role: m.role, content: m.text! })),
        useAI: true,
      })) as {
        ok: boolean;
        name: string;
        days: PreviewDay[];
        assistantText?: string;
      };
      if (sg?.assistantText !== undefined) {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: sg.assistantText },
        ]);
      }
      if (sg?.ok) {
        setPreview({ name: sg.name, days: sg.days });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (id: string) => {
    const p = plan.data;
    if (!p || p.id !== id) return null;
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 max-w-[85%]">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            {p.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {(p.days ?? []).map((d) => (
            <div key={d.id} className="space-y-1.5">
              <div className="text-xs font-semibold text-foreground">{d.title}</div>
              <div className="space-y-1">
                {(d.items ?? []).map((it) => (
                  <div key={it.id} className="text-xs text-muted-foreground flex items-center gap-2">
                    <Dumbbell className="h-3 w-3 shrink-0" />
                    <span className="truncate">{it.exercise?.name ?? it.exerciseId}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {it.sets}x{it.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const savePreview = async () => {
    if (!preview || !userId) return;
    const created = await create.mutateAsync({
      userId,
      name: preview.name,
      days: preview.days.map((d, idx) => ({
        title: d.title,
        order: idx,
        items: d.items.map((it) => ({
          exerciseId: it.exerciseId,
          sets: it.sets,
          reps: it.reps,
        })),
      })),
    });
    if (created?.id) {
      setLatestPlanId(created.id);
      onPlanCreated(created.id);
      setPreview(null);
      setMessages((m) => [...m, { role: "assistant", text: "Plan saved successfully! 🎉" }]);
    }
  };

  const renderPreviewCard = () => {
    if (!preview) return null;
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 max-w-[85%]">
        <CardHeader className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              {preview.name}
            </CardTitle>
            <Button type="button" size="sm" className="h-8 text-xs" onClick={savePreview}>
              Save Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {/* Quick Adjustments */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-background/50">
            <span className="text-[10px] text-muted-foreground font-medium">Experience:</span>
            {["Beginner", "Intermediate", "Advanced"].map((e) => (
              <Button
                key={e}
                type="button"
                size="sm"
                variant={exp === e ? "default" : "outline"}
                className="h-7 text-[10px] px-2"
                onClick={async () => {
                  setExp(e as typeof exp);
                  setLoading(true);
                  const sg = (await suggest.mutateAsync({
                    goal: lastText || goal || "Workout",
                    scheduleDays: preview.days.length,
                    experience: e as typeof exp,
                    equipment: equip === "Hybrid" ? undefined : equip,
                    rawText: lastText,
                    useAI: true,
                  })) as { ok: boolean; name: string; days: PreviewDay[] };
                  if (sg?.ok) setPreview({ name: sg.name, days: sg.days });
                  setLoading(false);
                }}
              >
                {e}
              </Button>
            ))}
            <span className="text-[10px] text-muted-foreground font-medium ml-2">Equipment:</span>
            {[
              { label: "Bodyweight", value: "Home Setup" },
              { label: "Dumbbells", value: "Dumbbells" },
              { label: "Full Gym", value: "Full Gym" },
              { label: "Hybrid", value: "Hybrid" },
            ].map((opt) => (
              <Button
                key={opt.label}
                type="button"
                size="sm"
                variant={equip === opt.value ? "default" : "outline"}
                className="h-7 text-[10px] px-2"
                onClick={async () => {
                  setEquip(opt.value as typeof equip);
                  setLoading(true);
                  const sg = (await suggest.mutateAsync({
                    goal: lastText || goal || "Workout",
                    scheduleDays: preview.days.length,
                    experience: exp,
                    equipment:
                      opt.value === "Hybrid"
                        ? undefined
                        : (opt.value as "Full Gym" | "Dumbbells" | "Home Setup"),
                    rawText: lastText,
                    useAI: true,
                  })) as { ok: boolean; name: string; days: PreviewDay[] };
                  if (sg?.ok) setPreview({ name: sg.name, days: sg.days });
                  setLoading(false);
                }}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Plan Days */}
          <div className="space-y-3">
            {preview.days.map((d, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-xs font-semibold text-foreground">{d.title}</div>
                <div className="space-y-1.5">
                  {d.items.map((it, jdx) => (
                    <div
                      key={it.exerciseId + jdx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <Avatar className="size-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(it.exerciseId)}`}
                          alt={it.exerciseName}
                        />
                        <AvatarFallback className="text-[10px]">
                          {it.exerciseName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {it.exerciseName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {it.sets} sets × {it.reps} reps
                          </span>
                          {it.muscleGroup && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                              {formatGroup(it.muscleGroup)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-10 w-10 text-teal-600 mb-3 opacity-50" />
            <h3 className="text-base font-semibold mb-1">Start a conversation</h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Describe your fitness goals and I'll create a personalized workout plan for you
            </p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.role === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            {m.text && (
              <Card className={`max-w-[75%] border-0 shadow-sm ${
                m.role === "user" 
                  ? "bg-teal-600 text-white" 
                  : "bg-muted"
              }`}>
                <CardContent className="p-3">
                  <p className="text-sm">{m.text}</p>
                </CardContent>
              </Card>
            )}
            {m.planId && renderPlanCard(m.planId)}
          </div>
        ))}
        {preview && (
          <div className="flex justify-start">{renderPreviewCard()}</div>
        )}
        {loading && (
          <div className="flex justify-start">
            <Card className="max-w-[75%] border-0 shadow-sm bg-muted">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  <span className="text-sm text-muted-foreground">Thinking…</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 w-full border-t bg-background/95 backdrop-blur p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Describe your fitness goals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
            className="h-9"
          />
          <Button 
            type="button" 
            onClick={send} 
            disabled={loading || !input.trim()}
            size="sm"
            className="h-9 gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
