"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Send,
  Sparkles,
  Dumbbell,
  User,
  CheckCircle2,
  MessageSquare,
  Zap,
} from "lucide-react";

type Props = {
  userId: string;
  goal: string;
  days: number;
  experience: "Beginner" | "Intermediate" | "Advanced";
  equipment: "Full Gym" | "Dumbbells" | "Home Setup" | "Hybrid";
  onPlanCreated: (id: string) => void;
};

type Msg = {
  role: "user" | "assistant";
  text?: string;
  planId?: string;
  suggestedActions?: string[];
};
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
  {
    text: "Create a push/pull/legs 6-day split",
    icon: Dumbbell,
  },
  {
    text: "I want a full body workout 3x per week",
    icon: Zap,
  },
  {
    text: "Give me an upper/lower 4-day program",
    icon: Dumbbell,
  },
  {
    text: "Create a 5-day bodybuilding split",
    icon: Sparkles,
  },
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-scroll to bottom when messages, preview, or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, preview, loading]);

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
        suggestedActions?: string[];
      };
      if (sg?.assistantText !== undefined) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: sg.assistantText,
            suggestedActions: sg.suggestedActions,
          },
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
      <div className="mx-auto max-w-3xl">
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base font-semibold">{p.name}</h3>
            </div>
            <div className="space-y-4">
              {(p.days ?? []).map((d) => (
                <div key={d.id} className="space-y-2">
                  <div className="text-foreground border-violet-500/20 border-b pb-2 text-sm font-medium">
                    {d.title}
                  </div>
                  <div className="space-y-1.5">
                    {(d.items ?? []).map((it) => (
                      <div
                        key={it.id}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-3 text-sm transition-colors"
                      >
                        <Dumbbell className="text-violet-500/60 h-4 w-4 shrink-0" />
                        <span className="flex-1 font-medium">
                          {it.exercise?.name ?? it.exerciseId}
                        </span>
                        <span className="bg-violet-500/10 text-violet-700 dark:text-violet-300 rounded px-2 py-0.5 text-xs">
                          {it.sets}x{it.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const savePreview = async () => {
    if (!preview || !userId) return;
    try {
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
        setPreview(null);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: "Plan saved successfully! Redirecting to your program...",
          },
        ]);
        setTimeout(() => {
          onPlanCreated(created.id);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Failed to save plan. Please try again." },
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
      <div className="mx-auto max-w-3xl">
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{preview.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                      >
                        {preview.days.length}{" "}
                        {preview.days.length === 1 ? "day" : "days"}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                      >
                        {totalExercises}{" "}
                        {totalExercises === 1 ? "exercise" : "exercises"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={savePreview}
                disabled={create.isPending}
                className="shrink-0 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
              >
                {create.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Plan
                  </>
                )}
              </Button>
            </div>

            {/* Quick Adjustments */}
            <div className="bg-background/50 border-violet-500/20 mb-6 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs font-medium mb-3">
                Quick Adjustments
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-xs min-w-[80px]">
                    Experience:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((e) => (
                      <Button
                        key={e}
                        type="button"
                        size="sm"
                        variant={exp === e ? "default" : "outline"}
                        className={cn(
                          "h-7 px-3 text-xs rounded-full",
                          exp === e &&
                            "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
                        )}
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
                          })) as {
                            ok: boolean;
                            name: string;
                            days: PreviewDay[];
                          };
                          if (sg?.ok)
                            setPreview({ name: sg.name, days: sg.days });
                          setLoading(false);
                        }}
                      >
                        {e}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-xs min-w-[80px]">
                    Equipment:
                  </span>
                  <div className="flex flex-wrap gap-2">
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
                        className={cn(
                          "h-7 px-3 text-xs rounded-full",
                          equip === opt.value &&
                            "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
                        )}
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
                          })) as {
                            ok: boolean;
                            name: string;
                            days: PreviewDay[];
                          };
                          if (sg?.ok)
                            setPreview({ name: sg.name, days: sg.days });
                          setLoading(false);
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Days */}
            <div className="space-y-6">
              {preview.days.map((d, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="border-violet-500/20 flex items-center gap-3 border-b pb-2">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20"
                    >
                      Day {idx + 1}
                    </Badge>
                    <h4 className="text-sm font-semibold">{d.title}</h4>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {d.items.length}{" "}
                      {d.items.length === 1 ? "exercise" : "exercises"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {d.items.map((it, jdx) => (
                      <div
                        key={it.exerciseId + jdx}
                        className="border-violet-500/10 hover:bg-violet-500/5 flex items-center gap-3 rounded-xl border p-3 transition-colors"
                      >
                        <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                          {jdx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {it.exerciseName}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              {it.sets} sets × {it.reps} reps
                            </span>
                            {it.muscleGroup && (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[10px] border-violet-500/20"
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
      </div>
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-violet-500/25">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h2 className="mb-2 text-xl font-semibold">
                  Let&apos;s Build Your Plan
                </h2>
                <p className="text-muted-foreground max-w-md text-sm">
                  Describe your fitness goals and I&apos;ll create a
                  personalized workout plan tailored just for you.
                </p>
              </div>

              {showSuggestions && (
                <div className="mt-6 w-full max-w-lg">
                  <p className="text-xs text-muted-foreground mb-3">
                    Try one of these prompts:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTION_PROMPTS.map((suggestion, idx) => {
                      const Icon = suggestion.icon;
                      return (
                        <button
                          key={idx}
                          className="group flex items-center gap-3 rounded-xl border border-border/50 hover:border-violet-500/30 hover:bg-violet-500/5 p-3 text-left transition-all"
                          onClick={() => handleSuggestionClick(suggestion.text)}
                        >
                          <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 group-hover:bg-violet-500/20 transition-colors">
                            <Icon className="h-4 w-4 text-violet-500" />
                          </div>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {suggestion.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                "mb-4 flex gap-3",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {m.role === "assistant" && (
                <Avatar className="h-8 w-8 shrink-0 border-0">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "flex max-w-[85%] flex-col gap-1",
                  m.role === "user" ? "items-end" : "items-start"
                )}
              >
                {m.text && (
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      m.role === "user"
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                        : "bg-muted/50 border border-border/50 text-foreground"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </p>
                  </div>
                )}
                {m.planId && renderPlanCard(m.planId)}

                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.suggestedActions.map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full px-3 text-xs border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-500/50"
                        onClick={() => handleSuggestionClick(action)}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <Avatar className="h-8 w-8 shrink-0 border-0">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Preview Card */}
          {preview && <div className="mb-4">{renderPreviewCard()}</div>}

          {/* Loading State */}
          {loading && (
            <div className="mb-4 flex gap-3">
              <Avatar className="h-8 w-8 shrink-0 border-0">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" />
                  </div>
                  <span className="text-muted-foreground text-sm">
                    Creating your workout plan...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Describe your ideal workout plan..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.trim()) setShowSuggestions(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                    setShowSuggestions(false);
                  }
                }}
                disabled={loading}
                className="h-12 w-full rounded-full border-border/50 bg-muted/30 pl-5 pr-12 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
              />
              <Button
                type="button"
                onClick={() => {
                  void send();
                  setShowSuggestions(false);
                }}
                disabled={loading || !input.trim()}
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full p-0 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-center text-xs">
            AI can make mistakes. Review your workout plan before starting.
          </p>
        </div>
      </div>
    </div>
  );
}
