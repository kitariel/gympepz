import type { PrismaClient } from "@prisma/client";
import type {
  SuggestInput,
  SuggestOutput,
} from "../../services/workout-planner/types";
import { getExercises } from "../../services/workout-planner/exercise.service";
import { generatePlanWithAI } from "../../services/workout-planner/ai.service";
import { generatePlanManually } from "../../services/workout-planner/fallback.service";

export type { SuggestInput, SuggestOutput };

export async function handleSuggest(
  ctx: { db: PrismaClient },
  input: SuggestInput,
): Promise<SuggestOutput> {
  if (input.useAI && process.env.OPENAI_API_KEY) {
    try {
      // AI uses a limited set of exercises for context window optimization
      const aiExercises = await getExercises(ctx.db, input.equipment, 150);
      return await generatePlanWithAI(input, aiExercises);
    } catch (error) {
      console.error("AI Suggest Error:", error);
      // Fall through to manual generation
    }
  }

  // Manual generation uses all available exercises to find best matches
  const allExercises = await getExercises(ctx.db, input.equipment);
  return generatePlanManually(input, allExercises);
}
