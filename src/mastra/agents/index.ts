import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "@/mastra/tools";
import { listExercisesTool } from "@/mastra/tools/workout";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const AgentState = z.object({
  proverbs: z.array(z.string()).default([]),
});

export const weatherAgent = new Agent({
  name: "Weather Agent",
  tools: { weatherTool },
  model: openai("gpt-4o"),
  instructions: "You are a helpful assistant.",
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: AgentState,
      },
    },
  }),
});

export const workoutPlannerAgent = new Agent({
  name: "Workout Planner Agent",
  tools: { listExercisesTool },
  model: openai("gpt-4o"),
  instructions:
    "Before generating, ask concise clarifying questions when missing: equipment preference (Bodyweight, Dumbbells, Full Gym, or Hybrid) and experience (Beginner, Intermediate, Advanced). Once enough info is provided, output strictly JSON: {name, days:[{title, items:[{exerciseId, sets, reps}]}]}. Always include a warmup item first in each day's items. Use only exercises returned by tools.",
});
