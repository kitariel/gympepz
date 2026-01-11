import type { Exercise } from "@prisma/client";
import type { SuggestOutput } from "./types";

type ParsedDayItem = {
  exerciseId?: string;
  exerciseName?: string;
  sets: number;
  reps: number;
};

type ParsedDay = {
  title?: string;
  items?: ParsedDayItem[];
};

type ParsedResponse = {
  name?: string;
  days?: ParsedDay[];
  assistantText?: string;
  suggestedActions?: string[];
};

export const parseAIResponse = (
  text: string,
  exercises: Exercise[],
): SuggestOutput => {
  const jsonMatch = /\{[\s\S]*\}/.exec(text);
  if (!jsonMatch) {
    return {
      ok: false,
      name: "",
      days: [],
      assistantText:
        text.trim() || "I need more details. What workout do you want?",
    };
  }

  const jsonStr = jsonMatch[0];
  const assistantText = text.slice(0, text.indexOf(jsonStr)).trim();

  let parsed: ParsedResponse;
  try {
    parsed = JSON.parse(jsonStr) as ParsedResponse;
  } catch (e) {
    return {
      ok: false,
      name: "",
      days: [],
      assistantText: assistantText || "Error parsing AI response.",
    };
  }

  const daysFromAi = parsed.days ?? [];
  // If we have suggested actions but no workout days (e.g. conversational response with actions)
  if (daysFromAi.length === 0) {
    // If we have suggested actions, we return them with the text
    if (parsed.suggestedActions && parsed.suggestedActions.length > 0) {
      return {
        ok: true, // It is "ok" as a response, even if no workout plan
        name: "",
        days: [],
        assistantText:
          parsed.assistantText ?? assistantText ?? "How can I help you?",
        suggestedActions: parsed.suggestedActions,
      };
    }

    return {
      ok: false,
      name: "",
      days: [],
      assistantText:
        parsed.assistantText ??
        assistantText ??
        "Couldn't create a workout. Try being more specific?",
    };
  }

  const mapNameToId = (name?: string): string | null => {
    if (!name) return null;
    const normalized = name.toLowerCase().trim();
    const match = exercises.find(
      (e) => e.name.toLowerCase().trim() === normalized,
    );
    return match?.id ?? null;
  };

  const normalized = daysFromAi.map((d, idx) => ({
    title: d.title ?? `Day ${idx + 1}`,
    order: idx,
    items: (d.items ?? [])
      .map((it) => {
        const id = it.exerciseId ?? mapNameToId(it.exerciseName);
        const exercise = exercises.find((e) => e.id === id);
        return {
          exerciseId: id ?? "",
          exerciseName: it.exerciseName ?? exercise?.name ?? "Unknown",
          muscleGroup: exercise?.muscleGroup ?? "",
          sets: it.sets,
          reps: it.reps,
        };
      })
      .filter((x) => x.exerciseId),
  }));

  if (normalized.length > 0 && normalized.every((d) => d.items.length > 0)) {
    return {
      ok: true,
      name: parsed.name ?? "Custom Plan",
      days: normalized,
      assistantText:
        parsed.assistantText ??
        assistantText ??
        `I've created a ${parsed.name ?? "workout plan"} for you!`,
      suggestedActions: parsed.suggestedActions,
    };
  }

  return {
    ok: false,
    name: "",
    days: [],
    assistantText:
      assistantText || "Couldn't create exercises. Try different equipment?",
  };
};
