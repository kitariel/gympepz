"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Sparkles, Dumbbell, Lightbulb, Zap, Target } from "lucide-react";

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
    const totalExercises = preview.days.reduce((sum, day) => sum + day.items.length, 0);
    return (
      <Card className="border-2 border-teal-200 dark:border-teal-800 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/20 max-w-[90%] sm:max-w-[85%]">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-teal-100 dark:border-teal-900/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-teal-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold">{preview.name}</CardTitle>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground ml-14">
                <span>{preview.days.length} {preview.days.length === 1 ? 'day' : 'days'}</span>
                <span>•</span>
                <span>{totalExercises} {totalExercises === 1 ? 'exercise' : 'exercises'}</span>
              </div>
            </div>
            <Button 
              type="button" 
              size="sm" 
              className="h-9 gap-2 bg-teal-600 hover:bg-teal-700 text-white shrink-0" 
              onClick={savePreview}
            >
              <Sparkles className="h-4 w-4" />
              Save Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4 pt-5">
          {/* Quick Adjustments */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-background/70 border border-teal-100 dark:border-teal-900/30">
            <span className="text-xs text-muted-foreground font-medium">Adjust:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Experience:</span>
            {["Beginner", "Intermediate", "Advanced"].map((e) => (
              <Button
                key={e}
                type="button"
                size="sm"
                variant={exp === e ? "default" : "outline"}
                className="h-8 text-xs px-3"
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
            <span className="text-xs text-muted-foreground font-medium">Equipment:</span>
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
                className="h-8 text-xs px-3"
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
          </div>

          {/* Plan Days */}
          <div className="space-y-4">
            {preview.days.map((d, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-teal-100 dark:border-teal-900/30">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    Day {idx + 1}
                  </Badge>
                  <h4 className="text-sm font-semibold text-foreground">{d.title}</h4>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {d.items.length} {d.items.length === 1 ? 'exercise' : 'exercises'}
                  </span>
                </div>
                <div className="space-y-2">
                  {d.items.map((it, jdx) => (
                    <div
                      key={it.exerciseId + jdx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/70 hover:bg-background border border-teal-100/50 dark:border-teal-900/30 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold text-xs shrink-0">
                        {jdx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {it.exerciseName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-medium">
                            {it.sets} sets × {it.reps} reps
                          </span>
                          {it.muscleGroup && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
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
      const inputEl = document.querySelector('input[placeholder*="Describe"]') as HTMLInputElement;
      inputEl?.focus();
    }, 100);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="p-4 rounded-full bg-teal-100 dark:bg-teal-900/30">
              <Sparkles className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h3 className="text-lg font-semibold">AI Workout Planner</h3>
              <p className="text-sm text-muted-foreground">
                Describe your fitness goals or choose a suggestion below. I'll create a personalized workout plan for you!
              </p>
            </div>
            
            {showSuggestions && (
              <div className="w-full max-w-2xl mt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Quick suggestions to get started:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTION_PROMPTS.map((suggestion, idx) => {
                    const Icon = suggestion.icon;
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className="h-auto py-3 px-4 justify-start text-left hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-teal-300 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion.text)}
                      >
                        <Icon className="h-4 w-4 mr-2 shrink-0 text-teal-600" />
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
              <div className={`flex items-start gap-2 max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}>
                {m.role === "assistant" && (
                  <div className="p-1.5 rounded-full bg-teal-100 dark:bg-teal-900/30 shrink-0">
                    <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                )}
                <Card className={`border-0 shadow-sm flex-1 ${
                  m.role === "user" 
                    ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white" 
                    : "bg-muted"
                }`}>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
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
      <div className="sticky bottom-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Quick Suggestions Bar */}
        {showSuggestions && messages.length === 0 && (
          <div className="px-3 pt-3 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {SUGGESTION_PROMPTS.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0 gap-1.5 whitespace-nowrap"
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
              className="h-10 gap-2 bg-teal-600 hover:bg-teal-700 text-white"
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
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            💡 Tip: Be specific about your goals, equipment, or workout type for better results
          </p>
        </div>
      </div>
    </div>
  );
}
