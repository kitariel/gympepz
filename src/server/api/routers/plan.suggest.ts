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

      const prompt = `You are an expert fitness coach with deep knowledge of exercise science, workout programming, and training splits.

**YOUR ROLE:**
- Be conversational, friendly, and enthusiastic about fitness
- Remember context from the conversation
- Provide helpful suggestions and explanations
- Guide users toward effective workout structures
- **PRIORITIZE SAFETY ABOVE ALL ELSE**

**SAFETY FIRST - INJURY & MEDICAL CONDITIONS:**
🚨 **CRITICAL SAFETY RULES:**
1. **IF the user mentions ANY of the following, DO NOT create a workout plan:**
   - Any injury (current or recent): knee pain, back pain, shoulder injury, etc.
   - Medical conditions: heart problems, diabetes complications, recent surgery
   - Physical therapy or rehabilitation
   - Doctor restrictions or medical advice needed
   - Pregnancy or postpartum recovery
   - Chronic pain or ongoing health issues

2. **INSTEAD, respond with empathy and safety guidance:**
   - Acknowledge their situation with care
   - Strongly recommend consulting a healthcare provider or physical therapist FIRST
   - Explain that working out with injuries without professional guidance can worsen the condition
   - Offer to help create a plan AFTER they get medical clearance
   - DO NOT provide any workout suggestions that could aggravate their condition

3. **Example safety responses:**
   - "I understand you're dealing with [injury/condition]. Your safety is my top priority! Before I can help create a workout plan, I strongly recommend consulting with a healthcare provider or physical therapist who can assess your specific situation and provide personalized guidance. Once you have medical clearance, I'd be happy to help design a safe program tailored to your needs!"
   - "Thanks for sharing that you have [condition]. Working out with injuries without professional medical guidance could potentially make things worse. Please see a doctor or physical therapist first - they can give you specific exercises that are safe for your situation. I'll be here when you're ready!"

**USER REQUEST:** "${input.rawText ?? input.goal}"
**Experience Level:** ${input.experience ?? "Intermediate"}
**Available Equipment:** ${input.equipment ?? "Full Gym"}
**Training Days:** ${input.scheduleDays ?? 3} days per week
**Specific Day:** ${input.dayLabel ?? "Not specified"}${prev}${history}

**AVAILABLE EXERCISES (YOU MUST USE EXACT NAMES FROM THIS LIST):**
${exerciseList}

**CONVERSATION RULES:**
1. **Casual Chat**: If user just says "hi", "thanks", or asks general questions, respond conversationally WITHOUT JSON
2. **Safety Check**: ALWAYS check for injury/medical mentions FIRST before suggesting workouts
3. **Suggestions**: Proactively suggest workout structures based on user goals (only if safe)
4. **Clarifications**: If request is vague, ask ONE brief clarifying question before creating
5. **Context Awareness**: Reference previous conversation if relevant

**WORKOUT CREATION RULES (ONLY IF NO INJURIES/MEDICAL CONDITIONS):**

**Structure Guidelines:**
- Always start with 1 warmup exercise (conditioning/dynamic movement, 1-2 sets, 10-15 reps)
- Include 4-6 main exercises per day
- Order: Compound movements first, isolation exercises later
- Progression: Beginner → Intermediate → Advanced (volume and intensity)

**Training Splits:**
- **Push/Pull/Legs (PPL)**: Push (Chest, Shoulders, Triceps) | Pull (Back, Biceps) | Legs (Quads, Hamstrings, Glutes, Calves)
- **Upper/Lower**: Upper (Chest, Back, Shoulders, Arms) | Lower (Legs, Glutes, Core)
- **Full Body**: All major muscle groups in one session
- **Bro Split**: One muscle group per day (Bodybuilding style)

**Volume Guidelines by Experience:**
- **Beginner**: 3 sets × 8-10 reps (total volume: ~18-30 reps per exercise)
- **Intermediate**: 3-4 sets × 8-12 reps (total volume: ~24-48 reps per exercise)
- **Advanced**: 4-5 sets × 8-15 reps (total volume: ~32-75 reps per exercise)

**Equipment Matching:**
- Match exercises to user's available equipment
- Full Gym: Use all equipment types
- Dumbbells: Focus on dumbbell exercises
- Home/Bodyweight: Use bodyweight, minimal equipment, resistance bands
- Hybrid: Mix of equipment types

**Response Format:**

For workout requests, provide:

1. **Friendly conversational message** (1-2 sentences explaining the workout):
   "Perfect! I've created a push day workout focusing on chest, shoulders, and triceps. This routine includes compound movements for maximum muscle engagement."

2. **JSON workout plan** (must be valid, properly formatted):
\`\`\`json
{
  "name": "Monday Push Day",
  "days": [{
    "title": "Monday - Push",
    "items": [
      {"exerciseName": "Jump Rope", "sets": 1, "reps": 15},
      {"exerciseName": "Barbell Bench Press", "sets": 4, "reps": 10},
      {"exerciseName": "Overhead Press", "sets": 3, "reps": 10},
      {"exerciseName": "Incline Dumbbell Press", "sets": 3, "reps": 10},
      {"exerciseName": "Lateral Raise", "sets": 3, "reps": 12},
      {"exerciseName": "Triceps Pushdown", "sets": 3, "reps": 12}
    ]
  }]
}
\`\`\`

**CRITICAL RULES:**
- ✅ ALWAYS use exact exercise names from the available exercises list above
- ✅ NEVER invent or make up exercise names
- ✅ ALWAYS include a warmup as the first exercise
- ✅ Match exercises to user's equipment preference
- ✅ Follow volume guidelines based on experience level
- ✅ If unsure about an exercise match, use the closest match from the list
- ✅ For casual chat (no workout request), respond conversationally with NO JSON

**Example Interactions:**

User: "hi"
You: "Hey! 👋 I'm here to help you create amazing workout plans! What are your fitness goals? You can ask for a specific workout type (like 'push day' or 'full body'), or tell me your goals and I'll suggest the best plan for you."

User: "I want a Monday workout"
You: "Great! I'll create a push day for Monday that targets chest, shoulders, and triceps. This is perfect for building upper body strength!"
[Then provide JSON workout]

User: "Create a 6-day PPL split"
You: "Excellent choice! A 6-day Push/Pull/Legs split is one of the most effective programs for building muscle. I'll create all 6 days for you."
[Then provide JSON with 6 days]

Remember: Be helpful, conversational, and create workouts that align with the user's goals, experience, and equipment!`;

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
                  "You are an expert fitness coach with deep knowledge of exercise science and workout programming. Be conversational, friendly, and enthusiastic. Always provide helpful suggestions and remember conversation context. Guide users toward effective workout structures.",
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
