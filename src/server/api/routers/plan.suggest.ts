import type { PrismaClient, Exercise } from "@prisma/client";

type ChatMessage = { role: "user" | "assistant"; content: string };
export type SuggestInput = {
  goal: string;
  scheduleDays: number;
  experience?: "Beginner" | "Intermediate" | "Advanced";
  equipment?: "Full Gym" | "Dumbbells" | "Home Setup";
  dayLabel?: string;
  rawText?: string;
  conversationHistory?: ChatMessage[];
  previousDays?: string[];
  useAI?: boolean;
};

export type SuggestOutput = {
  ok: boolean;
  name: string;
  days: Array<{
    title: string;
    order: number;
    items: Array<{
      exerciseId: string;
      exerciseName: string;
      muscleGroup: string;
      sets: number;
      reps: number;
    }>;
  }>;
  assistantText: string;
};

export async function handleSuggest(
  ctx: { db: PrismaClient },
  input: SuggestInput,
): Promise<SuggestOutput> {
  if (input.useAI && process.env.OPENAI_API_KEY) {
    try {
      const eqFilter =
        input.equipment === "Full Gym"
          ? undefined
          : input.equipment === "Dumbbells"
            ? "Dumbbell"
            : "Bodyweight";

      const all: Exercise[] = await ctx.db.exercise.findMany({
        where: eqFilter
          ? { equipment: { contains: eqFilter, mode: "insensitive" } }
          : undefined,
        take: 150,
        orderBy: { name: "asc" },
      });

      const prev = input.previousDays?.length
        ? `\nPrevious workouts: ${input.previousDays.join(", ")}`
        : "";
      const history = input.conversationHistory?.length
        ? "\nRecent chat:\n" +
          input.conversationHistory
            .slice(-3)
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n")
        : "";

      const byGroup = all.reduce(
        (acc: Record<string, Exercise[]>, e: Exercise) => {
          const group = (e.muscleGroup ?? "").toLowerCase();
          acc[group] ??= [];
          acc[group].push(e);
          return acc;
        },
        {} as Record<string, Exercise[]>,
      );

      const exerciseList = Object.entries(byGroup)
        .slice(0, 10)
        .map(
          ([group, exercises]) =>
            `${group.toUpperCase()}:\n` +
            exercises
              .slice(0, 8)
              .map((e) => `  - ${e.name} (ID: ${e.id})`)
              .join("\n"),
        )
        .join("\n\n");

      const prompt = `You are an expert fitness coach creating a workout plan.

USER REQUEST: "${input.rawText ?? input.goal}"
Experience: ${input.experience ?? "Intermediate"}
Equipment: ${input.equipment ?? "Full Gym"}
Specific Day: ${input.dayLabel ?? "Not specified"}${prev}${history}

AVAILABLE EXERCISES (USE THESE IDs):
${exerciseList}

INSTRUCTIONS:
1. If user just says "hi" or casual chat, respond conversationally WITHOUT JSON
2. For workout requests, create 1 day with 5-6 exercises
3. Start with 1 warmup (conditioning exercise, 1-2 sets, 10-15 reps)
4. Follow Push/Pull/Legs split:
   - Push: Chest, Shoulders, Triceps
   - Pull: Back, Biceps
   - Legs: Quads, Hamstrings, Glutes, Calves
5. Volume: Beginner (3x8), Intermediate (3x10), Advanced (4x10)

RESPONSE FORMAT:
Brief friendly message (1-2 sentences)

{
  "name": "Monday Push Day",
  "days": [{
    "title": "Monday - Push",
    "items": [
      {"exerciseName": "Jump Rope", "sets": 1, "reps": 15},
      {"exerciseName": "Barbell Bench Press", "sets": 4, "reps": 10}
    ]
  }]
}

CRITICAL: Use exact exercise names from the list above!`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are a professional fitness coach. Be conversational and helpful.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 1500,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        choices: { message: { content: string } }[];
      };
      const text: string = data.choices[0]?.message?.content ?? "";

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
      const parsed = JSON.parse(jsonStr) as {
        name?: string;
        days?: Array<{
          title: string;
          items: Array<{
            exerciseName?: string;
            exerciseId?: string;
            sets: number;
            reps: number;
          }>;
        }>;
      };

      const daysFromAi = parsed.days ?? [];
      if (daysFromAi.length === 0) {
        return {
          ok: false,
          name: "",
          days: [],
          assistantText:
            assistantText ||
            "Couldn't create a workout. Try being more specific?",
        };
      }

      const mapNameToId = (name?: string): string | null => {
        if (!name) return null;
        const normalized = name.toLowerCase().trim();
        const match = all.find(
          (e) => e.name.toLowerCase().trim() === normalized,
        );
        return match?.id ?? null;
      };

      const normalized = daysFromAi.map((d, idx) => ({
        title: d.title || `Day ${idx + 1}`,
        order: idx,
        items: d.items
          .map((it) => {
            const id = it.exerciseId ?? mapNameToId(it.exerciseName);
            const exercise = all.find((e) => e.id === id);
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

      if (
        normalized.length > 0 &&
        normalized.every((d) => d.items.length > 0)
      ) {
        return {
          ok: true,
          name: parsed.name ?? `${input.goal} Plan`,
          days: normalized,
          assistantText: assistantText || "Here's your workout plan!",
        };
      }

      return {
        ok: false,
        name: "",
        days: [],
        assistantText:
          assistantText ||
          "Couldn't create exercises. Try different equipment?",
      };
    } catch (error) {}
  }

  const eqFilter =
    input.equipment === "Full Gym"
      ? undefined
      : input.equipment === "Dumbbells"
        ? "Dumbbell"
        : "Bodyweight";

  const all: Exercise[] = await ctx.db.exercise.findMany({
    where: eqFilter
      ? { equipment: { contains: eqFilter, mode: "insensitive" } }
      : undefined,
    orderBy: { name: "asc" },
  });

  const vol =
    input.experience === "Advanced"
      ? { sets: 4, reps: 10 }
      : input.experience === "Intermediate"
        ? { sets: 3, reps: 10 }
        : { sets: 3, reps: 8 };

  const pickWarmup = () => {
    const e = all.find((e) =>
      e.muscleGroup.toLowerCase().includes("conditioning"),
    );
    return e
      ? [
          {
            exerciseId: e.id,
            exerciseName: e.name,
            muscleGroup: e.muscleGroup,
            sets: 1,
            reps: 15,
          },
        ]
      : [];
  };

  const pick = (group: string, n: number) => {
    const pool = all.filter((e) => e.muscleGroup.toLowerCase().includes(group));
    return pool.slice(0, n).map((e) => ({
      exerciseId: e.id,
      exerciseName: e.name,
      muscleGroup: e.muscleGroup,
      sets: vol.sets,
      reps: vol.reps,
    }));
  };

  let dayType: "push" | "pull" | "legs" = "push";
  if (input.previousDays?.length) {
    const last =
      input.previousDays[input.previousDays.length - 1]?.toLowerCase() ?? "";
    if (last.includes("push")) dayType = "pull";
    else if (last.includes("pull")) dayType = "legs";
    else if (last.includes("legs")) dayType = "push";
  }

  const items =
    dayType === "push"
      ? [
          ...pickWarmup(),
          ...pick("chest", 2),
          ...pick("shoulders", 1),
          ...pick("triceps", 1),
        ]
      : dayType === "pull"
        ? [...pickWarmup(), ...pick("back", 3), ...pick("biceps", 1)]
        : [
            ...pickWarmup(),
            ...pick("legs", 2),
            ...pick("glutes", 1),
            ...pick("calves", 1),
          ];

  const title =
    input.dayLabel ?? dayType.charAt(0).toUpperCase() + dayType.slice(1);

  return {
    ok: true,
    name: `${input.goal} Plan`,
    days: [{ title, order: 0, items }],
    assistantText: "Here's your workout plan!",
  };
}
