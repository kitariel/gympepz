"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  Sparkles,
  Dumbbell,
  Lightbulb,
  Zap,
  Target,
} from "lucide-react";

type Props = {
  userId: string;
  goal: string;
  days: number;
  experience: "Beginner" | "Intermediate" | "Advanced";
  equipment: "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid";
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

const SUGGESTION_PROMPTS = [
  { text: "Create a push/pull/legs 6-day split", icon: Target },
  { text: "I want a full body workout 3x per week", icon: Dumbbell },
  { text: "Give me an upper/lower 4-day program", icon: Zap },
  { text: "Create a 5-day bodybuilding split", icon: Target },
];

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
  const [showSuggestions, setShowSuggestions] = useState(true);

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
    if (text) {
      setMessages((m) => [...m, { role: "user", text }]);
      setShowSuggestions(false);
    }
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
      <Card className="bg-primary/5 border-primary/20 max-w-[85%] border-0 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="text-primary h-4 w-4" />
            {p.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {(p.days ?? []).map((d) => (
            <div key={d.id} className="space-y-1.5">
              <div className="text-foreground text-xs font-semibold">
                {d.title}
              </div>
              <div className="space-y-1">
                {(d.items ?? []).map((it) => (
                  <div
                    key={it.id}
                    className="text-muted-foreground flex items-center gap-2 text-xs"
                  >
                    <Dumbbell className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {it.exercise?.name ?? it.exerciseId}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
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
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Plan saved successfully! 🎉" },
      ]);
    }
  };

  const renderPreviewCard = () => {
    if (!preview) return null;
    const totalExercises = preview.days.reduce(
      (sum, day) => sum + day.items.length,
      0,
    );
    return (
      <Card className="border-primary/20 bg-primary/5 max-w-[90%] border-2 shadow-lg sm:max-w-[85%]">
        <CardHeader className="border-primary/10 border-b px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-primary rounded-lg p-2">
                  <Sparkles className="text-primary-foreground h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {preview.name}
                </CardTitle>
              </div>
              <div className="text-muted-foreground ml-14 flex items-center gap-3 text-xs">
                <span>
                  {preview.days.length}{" "}
                  {preview.days.length === 1 ? "day" : "days"}
                </span>
                <span>•</span>
                <span>
                  {totalExercises}{" "}
                  {totalExercises === 1 ? "exercise" : "exercises"}
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 shrink-0 gap-2"
              onClick={savePreview}
            >
              <Sparkles className="h-4 w-4" />
              Save Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pt-5 pb-5">
          {/* Quick Adjustments */}
          <div className="bg-background/70 border-primary/10 flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <span className="text-muted-foreground text-xs font-medium">
              Adjust:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                Experience:
              </span>
              {["Beginner", "Intermediate", "Advanced"].map((e) => (
                <Button
                  key={e}
                  type="button"
                  size="sm"
                  variant={exp === e ? "default" : "outline"}
                  className="h-8 px-3 text-xs"
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
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                Equipment:
              </span>
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
                  className="h-8 px-3 text-xs"
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
                          : (opt.value as
                              | "Full Gym"
                              | "Dumbbells"
                              | "Home Setup"),
                      rawText: lastText,
                      conversationHistory: messages
                        .filter((m) => m.text)
                        .map((m) => ({ role: m.role, content: m.text! })),
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
          </div>

          {/* Plan Days */}
          <div className="space-y-4">
            {preview.days.map((d, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-teal-100 pb-2 dark:border-teal-900/30">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    Day {idx + 1}
                  </Badge>
                  <h4 className="text-foreground text-sm font-semibold">
                    {d.title}
                  </h4>
                  <span className="text-muted-foreground ml-auto text-xs">
                    {d.items.length}{" "}
                    {d.items.length === 1 ? "exercise" : "exercises"}
                  </span>
                </div>
                <div className="space-y-2">
                  {d.items.map((it, jdx) => (
                    <div
                      key={it.exerciseId + jdx}
                      className="bg-background/70 hover:bg-background flex items-center gap-3 rounded-lg border border-teal-100/50 p-3 transition-colors dark:border-teal-900/30"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                        {jdx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {it.exerciseName}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs font-medium">
                            {it.sets} sets × {it.reps} reps
                          </span>
                          {it.muscleGroup && (
                            <Badge
                              variant="outline"
                              className="px-2 py-0.5 text-[10px]"
                            >
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

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      const inputEl = document.querySelector(
        'input[placeholder*="Describe"]',
      ) as HTMLInputElement;
      inputEl?.focus();
    }, 100);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
            <div className="bg-primary/10 rounded-full p-4">
              <Sparkles className="text-primary h-10 w-10" />
            </div>
            <div className="max-w-lg space-y-2">
              <h3 className="text-lg font-semibold">AI Workout Planner</h3>
              <p className="text-muted-foreground text-sm">
                Describe your fitness goals or choose a suggestion below. I'll
                create a personalized workout plan for you!
              </p>
            </div>

            {showSuggestions && (
              <div className="mt-6 w-full max-w-2xl space-y-3">
                <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Quick suggestions to get started:</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTION_PROMPTS.map((suggestion, idx) => {
                    const Icon = suggestion.icon;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className="hover:border-primary/50 hover:bg-primary/5 h-auto justify-start px-4 py-3 text-left transition-colors"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                      >
                        <Icon className="text-primary mr-2 h-4 w-4 shrink-0" />
                        <span className="text-sm">{suggestion.text}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
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
              <div
                className={`flex max-w-[85%] items-start gap-2 ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {m.role === "assistant" && (
                  <div className="bg-primary/10 shrink-0 rounded-full p-1.5">
                    <Sparkles className="text-primary h-4 w-4" />
                  </div>
                )}
                <Card
                  className={`flex-1 border-0 shadow-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            {m.planId && renderPlanCard(m.planId)}
          </div>
        ))}
        {preview && (
          <div className="flex justify-start">{renderPreviewCard()}</div>
        )}
        {loading && (
          <div className="flex justify-start">
            <Card className="bg-muted max-w-[75%] border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="text-primary h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Thinking…
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-0 w-full border-t backdrop-blur">
        {/* Quick Suggestions Bar */}
        {showSuggestions && messages.length === 0 && (
          <div className="px-3 pt-3 pb-2">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              {SUGGESTION_PROMPTS.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 gap-1.5 text-xs whitespace-nowrap"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <Icon className="h-3 w-3" />
                    {suggestion.text}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ask for a workout... (e.g., 'Create a push day', 'Give me a leg workout')"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.trim()) setShowSuggestions(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                  setShowSuggestions(false);
                }
              }}
              disabled={loading}
              className="h-10 text-sm"
              onFocus={() => {
                if (messages.length > 0) setShowSuggestions(false);
              }}
            />
            <Button
              type="button"
              onClick={() => {
                send();
                setShowSuggestions(false);
              }}
              disabled={loading || !input.trim()}
              size="sm"
              className="h-10 gap-2 bg-teal-600 text-white hover:bg-teal-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 px-1 text-[10px]">
            💡 Tip: Be specific about your goals, equipment, or workout type for
            better results
          </p>
        </div>
      </div>
    </div>
  );
}
