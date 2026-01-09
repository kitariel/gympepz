"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Send,
  Sparkles,
  Dumbbell,
  User,
  CheckCircle2,
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
  "Create a push/pull/legs 6-day split",
  "I want a full body workout 3x per week",
  "Give me an upper/lower 4-day program",
  "Create a 5-day bodybuilding split",
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
      <div className="max-w-3xl mx-auto">
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-base">{p.name}</h3>
            </div>
            <div className="space-y-4">
              {(p.days ?? []).map((d) => (
                <div key={d.id} className="space-y-2">
                  <div className="text-sm font-medium text-foreground pb-2 border-b border-border/50">
                    {d.title}
                  </div>
                  <div className="space-y-1.5">
                    {(d.items ?? []).map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Dumbbell className="h-4 w-4 shrink-0 text-primary/60" />
                        <span className="flex-1 font-medium">
                          {it.exercise?.name ?? it.exerciseId}
                        </span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
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
          { role: "assistant", text: "Plan saved successfully! 🎉 Redirecting..." },
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
      <div className="max-w-3xl mx-auto">
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base">{preview.name}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-11">
                  <Badge variant="secondary" className="text-xs">
                    {preview.days.length} {preview.days.length === 1 ? "day" : "days"}
                  </Badge>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    {totalExercises} {totalExercises === 1 ? "exercise" : "exercises"}
                  </Badge>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={savePreview}
                disabled={create.isPending}
                className="shrink-0"
              >
                {create.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Plan
                  </>
                )}
              </Button>
            </div>

            {/* Quick Adjustments */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Quick Adjustments:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Experience:</span>
                  {["Beginner", "Intermediate", "Advanced"].map((e) => (
                    <Button
                      key={e}
                      type="button"
                      size="sm"
                      variant={exp === e ? "default" : "outline"}
                      className="h-7 px-2.5 text-xs"
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
                  <span className="text-xs text-muted-foreground">Equipment:</span>
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
                      className="h-7 px-2.5 text-xs"
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
            </div>

            {/* Plan Days */}
            <div className="space-y-6">
              {preview.days.map((d, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                    <Badge variant="secondary" className="text-xs">
                      Day {idx + 1}
                    </Badge>
                    <h4 className="text-sm font-semibold">{d.title}</h4>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {d.items.length} {d.items.length === 1 ? "exercise" : "exercises"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {d.items.map((it, jdx) => (
                      <div
                        key={it.exerciseId + jdx}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {jdx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {it.exerciseName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {it.sets} sets × {it.reps} reps
                            </span>
                            {it.muscleGroup && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
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
    <div className="flex h-full flex-col bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">AI Workout Planner</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Describe your fitness goals and I'll create a personalized workout plan tailored just for you.
                </p>
              </div>

              {showSuggestions && (
                <div className="mt-8 w-full max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTION_PROMPTS.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start text-left hover:bg-muted/50 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span className="text-sm">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-4 mb-6 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`flex flex-col gap-1 max-w-[85%] ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {m.text && (
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </p>
                  </div>
                )}
                {m.planId && renderPlanCard(m.planId)}
              </div>

              {m.role === "user" && (
                <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Preview Card */}
          {preview && (
            <div className="mb-6">
              {renderPreviewCard()}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex gap-4 mb-6">
              <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
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
          <div className="flex gap-2">
            <div className="flex-1 glow-border">
              <Input
                ref={inputRef}
                placeholder="Message AI Workout Planner..."
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
                className="w-full h-11 rounded-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              type="button"
              onClick={() => {
                void send();
                setShowSuggestions(false);
              }}
              disabled={loading || !input.trim()}
              size="sm"
              className="h-11 w-11 rounded-full p-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI can make mistakes. Review your workout plan before starting.
          </p>
        </div>
      </div>
    </div>
  );
}
