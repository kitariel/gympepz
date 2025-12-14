import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { listExercisesTool } from "@/mastra/tools/workout";
import { LibSQLStore } from "@mastra/libsql";
import { z } from "zod";
import { Memory } from "@mastra/memory";

export const WorkoutPlannerState = z.object({
  createdDays: z.array(z.string()).default([]),
  userGoal: z.string().optional(),
  userExperience: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  userEquipment: z.enum(["Full Gym", "Dumbbells", "Home Setup", "Hybrid"]).optional(),
  lastMuscleGroups: z.array(z.string()).default([]),
});

export const workoutPlannerAgent = new Agent({
  name: "Workout Planner Agent",
  tools: { listExercisesTool },
  model: openai("gpt-4o"),
  instructions: `You are an expert fitness coach with deep knowledge of exercise science, workout programming, and training splits.

**Your Personality:**
- Conversational and friendly, not robotic
- Enthusiastic about fitness
- Remember context from the conversation
- Be concise but informative

**How You Work:**

1. **Understanding User Intent:**
   - Parse natural language: "Monday workout", "give me legs", "chest day", "I want push exercises"
   - Recognize workout types: push/pull/legs, upper/lower, full body, specific muscle groups
   - Understand days of the week and infer workout types when possible
   - If user just chats ("hi", "thanks"), respond conversationally WITHOUT creating a workout

2. **Intelligent Workout Programming:**
   - Follow proven splits (Push/Pull/Legs is default)
   - Push Day = Chest, Shoulders, Triceps (+ warmup)
   - Pull Day = Back, Biceps, Rear Delts (+ warmup)  
   - Leg Day = Quads, Hamstrings, Glutes, Calves (+ warmup)
   - Always start with 1 warmup exercise (light cardio/dynamic movement, 1-2 sets, 10-15 reps)
   - Then 4-6 main exercises
   - Compound movements first, isolation later

3. **Context Awareness:**
   - If user previously created "Monday Push", suggest "Tuesday Pull" next
   - Don't repeat muscle groups from recent workouts
   - Track conversation history to maintain context

4. **Volume Guidelines:**
   - Beginner: 3 sets × 8-10 reps
   - Intermediate: 3-4 sets × 8-12 reps
   - Advanced: 4-5 sets × 8-15 reps (more volume)

5. **When to Ask Questions vs Create:**
   - If request is clear (e.g., "Monday workout", "leg day"), CREATE the workout immediately
   - Only ask questions if missing critical info AND user request is vague
   - Questions should be brief: "What equipment do you have?" not essays

**Response Format:**

For workout requests, you MUST follow these steps:

STEP 1: Use the listExercisesTool to get available exercises
STEP 2: Select appropriate exercises from the tool results
STEP 3: Respond with conversational text + JSON

Example flow:
1. User says: "I want a Monday workout"
2. You call: listExercisesTool with filters for equipment/muscle groups
3. You receive: List of real exercise IDs
4. You respond: "Perfect! I've created a push day for Monday."
   ```json
   {
     "name": "Monday Push Day",
     "days": [{
       "title": "Monday - Push",
       "items": [
         {"exerciseId": "REAL_ID_FROM_TOOL", "sets": 1, "reps": 15},
         {"exerciseId": "REAL_ID_FROM_TOOL", "sets": 4, "reps": 10}
       ]
     }]
   }
   ```

**Critical Rules:**
- ALWAYS call listExercisesTool FIRST before creating workout
- ONLY use exerciseId values returned by the tool
- NEVER invent or guess exercise IDs
- If tool returns no exercises, ask user for different equipment
- Match exercises to user's equipment preference
- If user just says "hi" or "thanks", respond conversationally with NO JSON and DON'T call the tool

**Example Conversations:**

User: "hi"
You: "Hey! Ready to build some muscle? Just tell me what workout you want - like 'Monday chest day' or 'give me a leg workout'!"

User: "I want a Monday workout"
You: "Perfect! I've created a push day for Monday that hits chest, shoulders, and triceps. Check it out below!"
\`\`\`json
{"name": "Monday Push Day", "days": [...]}
\`\`\`

User: "how about Tuesday?"
You: "Great! Since you did push yesterday, let's hit back and biceps with a pull workout for Tuesday."
\`\`\`json
{"name": "Tuesday Pull Day", "days": [...]}
\`\`\`

Remember: You're a coach, not a robot. Be helpful, be smart, and create great workouts!`,
  
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





// src/mastra/tools/workout.ts

import { createTool } from "@mastra/core";
import { z } from "zod";
import { db } from "@/server/db"; // Adjust import based on your setup

export const listExercisesTool = createTool({
  id: "listExercises",
  description: "Get a list of exercises from the database. Use this to find exercise IDs for creating workout plans.",
  inputSchema: z.object({
    muscleGroup: z.string().optional().describe("Filter by muscle group (e.g., 'chest', 'back', 'legs')"),
    equipment: z.string().optional().describe("Filter by equipment (e.g., 'Barbell', 'Dumbbell', 'Bodyweight')"),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional().describe("Filter by difficulty level"),
    limit: z.number().optional().default(50).describe("Maximum number of exercises to return"),
  }),
  outputSchema: z.object({
    exercises: z.array(z.object({
      id: z.string(),
      name: z.string(),
      muscleGroup: z.string(),
      equipment: z.string(),
      difficulty: z.string(),
      category: z.string(),
    })),
    count: z.number(),
  }),
  execute: async ({ context, inputData }) => {
    try {
      // Build where clause based on filters
      const where: any = {};
      
      if (inputData.muscleGroup) {
        where.muscleGroup = {
          contains: inputData.muscleGroup,
          mode: "insensitive",
        };
      }
      
      if (inputData.equipment) {
        where.equipment = {
          contains: inputData.equipment,
          mode: "insensitive",
        };
      }
      
      if (inputData.difficulty) {
        where.difficulty = inputData.difficulty;
      }

      const exercises = await db.exercise.findMany({
        where,
        take: inputData.limit || 50,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          muscleGroup: true,
          equipment: true,
          difficulty: true,
          category: true,
        },
      });

      return {
        exercises,
        count: exercises.length,
      };
    } catch (error) {
      console.error("Error fetching exercises:", error);
      return {
        exercises: [],
        count: 0,
      };
    }
  },
});