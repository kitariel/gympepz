import type { Exercise } from "@prisma/client";
import type { SuggestInput, SuggestOutput } from "./types";
import { generateSystemPrompt } from "./prompt.service";
import { parseAIResponse } from "./parser.service";

export const generatePlanWithAI = async (
  input: SuggestInput,
  exercises: Exercise[],
): Promise<SuggestOutput> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API Key");
  }

  const prompt = generateSystemPrompt(input, exercises);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            "You are an expert fitness coach. Your highest priority is SAFETY. You must strictly refuse harmful, violent, or medically unsafe requests. For safe requests, be conversational, friendly, and enthusiastic.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const text = data.choices[0]?.message?.content ?? "";

  return parseAIResponse(text, exercises);
};
