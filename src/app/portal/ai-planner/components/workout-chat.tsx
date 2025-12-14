"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  useEffect(() => {
    if (plan.data && latestPlanId) {
      setMessages((m) => [...m, { role: "assistant", planId: latestPlanId }]);
    }
  }, [plan.data, latestPlanId]);

  const send = async () => {
    if (!userId) return;
    const text = input.trim();
    setInput("");
    setLastText(text);
    if (text) setMessages((m) => [...m, { role: "user", text }]);
    const scheduleDays = text.toLowerCase().includes("monday") ? 1 : days;
    const mappedEquip: "Full Gym" | "Dumbbells" | "Home Setup" | undefined =
      equip === "Hybrid" ? undefined : equip;
    const sg = (await suggest.mutateAsync({
      goal: text || goal || "Workout",
      scheduleDays,
      experience: exp,
      equipment: mappedEquip,
      useAI: true,
    })) as { ok: boolean; name: string; days: PreviewDay[] };
    if (sg?.ok) {
      setPreview({ name: sg.name, days: sg.days });
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Here are some suggestions." },
      ]);
    }
  };

  const renderPlanCard = (id: string) => {
    const p = plan.data;
    if (!p || p.id !== id) return null;
    return (
      <Card className="bg-neutral-900 p-4 text-neutral-100">
        <div className="mb-2 font-semibold">{p.name}</div>
        {(p.days ?? []).map((d) => (
          <div key={d.id} className="mb-2">
            <div className="text-sm font-medium">{d.title}</div>
            <div className="mt-1 space-y-1">
              {(d.items ?? []).map((it) => (
                <div key={it.id} className="text-xs text-neutral-300">
                  • {it.exerciseId} — {it.sets}x{it.reps}
                </div>
              ))}
            </div>
          </div>
        ))}
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
      setMessages((m) => [...m, { role: "assistant", text: "Plan saved." }]);
    }
  };

  const renderPreviewCard = () => {
    if (!preview) return null;
    return (
      <Card className="bg-neutral-900 p-4 text-neutral-100">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">{preview.name}</div>
          <Button type="button" size="sm" onClick={savePreview}>
            Save Plan
          </Button>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <div className="text-xs text-neutral-400">Experience:</div>
          {["Beginner", "Intermediate", "Advanced"].map((e) => (
            <Button
              key={e}
              type="button"
              size="sm"
              variant={exp === e ? "default" : "outline"}
              onClick={async () => {
                setExp(e as typeof exp);
                const sg = (await suggest.mutateAsync({
                  goal: lastText || goal || "Workout",
                  scheduleDays: preview.days.length,
                  experience: e as typeof exp,
                  equipment: equip === "Hybrid" ? undefined : equip,
                  useAI: true,
                })) as { ok: boolean; name: string; days: PreviewDay[] };
                if (sg?.ok) setPreview({ name: sg.name, days: sg.days });
              }}
            >
              {e}
            </Button>
          ))}
          <div className="ml-4 text-xs text-neutral-400">Equipment:</div>
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
              onClick={async () => {
                setEquip(opt.value as typeof equip);
                const sg = (await suggest.mutateAsync({
                  goal: lastText || goal || "Workout",
                  scheduleDays: preview.days.length,
                  experience: exp,
                  equipment:
                    opt.value === "Hybrid"
                      ? undefined
                      : (opt.value as "Full Gym" | "Dumbbells" | "Home Setup"),
                  useAI: true,
                })) as { ok: boolean; name: string; days: PreviewDay[] };
                if (sg?.ok) setPreview({ name: sg.name, days: sg.days });
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {preview.days.map((d, idx) => (
          <div key={idx} className="mb-3">
            <div className="text-sm font-medium">{d.title}</div>
            <div className="mt-2 space-y-2">
              {d.items.map((it, jdx) => (
                <div
                  key={it.exerciseId + jdx}
                  className="flex items-center gap-3"
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(it.exerciseId)}`}
                      alt={it.exerciseName}
                    />
                    <AvatarFallback>
                      {it.exerciseName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-neutral-200">
                    <div className="font-medium">{it.exerciseName}</div>
                    <div className="text-xs text-neutral-400">
                      {it.sets} sets × {it.reps} reps
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-neutral-950">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.role === "user" ? "flex justify-end" : "flex justify-start"
            }
          >
            {m.text && (
              <Card className="max-w-[75%] bg-neutral-900 p-3 text-neutral-100">
                {m.text}
              </Card>
            )}
            {m.planId && renderPlanCard(m.planId)}
          </div>
        ))}
        {preview && (
          <div className="flex justify-start">{renderPreviewCard()}</div>
        )}
      </div>
      <div className="sticky bottom-0 w-full border-t border-neutral-800 bg-neutral-900 p-3">
        <div className="flex gap-2">
          <Input
            className="bg-neutral-800 text-neutral-100"
            placeholder="Need a workout plan?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="button" onClick={send}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
