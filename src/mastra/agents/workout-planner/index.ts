import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { listExercisesTool } from "@/mastra/tools/workout";
import { WORKOUT_PLANNER_INSTRUCTIONS } from "./instructions";
import { WORKOUT_PLANNER_CONFIG } from "./config";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { WorkoutPlannerState } from "./state";

export const workoutPlannerAgent = new Agent({
  name: WORKOUT_PLANNER_CONFIG.name,
  tools: { listExercisesTool },
  model: openai(WORKOUT_PLANNER_CONFIG.model),
  instructions: WORKOUT_PLANNER_INSTRUCTIONS,
  memory: new Memory({
    storage: new LibSQLStore({ url: "file::memory:" }),
    options: {
      workingMemory: {
        enabled: true,
        schema: WorkoutPlannerState,
      },
    },
  }),
});
