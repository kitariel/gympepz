export type ChatMessage = { role: "user" | "assistant"; content: string };

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
  suggestedActions?: string[];
};

export type ExerciseData = {
  id: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
};
