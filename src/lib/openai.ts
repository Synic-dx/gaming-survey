import "server-only";

import OpenAI from "openai";

import { getOpenAIApiKey } from "@/lib/env";

export function getOpenAIClient() {
  const apiKey = getOpenAIApiKey();

  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

export async function summarizeSubmission(input: {
  favoriteGame: string;
  platform: string;
  notes: string;
}) {
  const client = getOpenAIClient();

  if (!client) {
    return "";
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Summarize gaming survey submissions in one short sentence for spreadsheet review.",
      },
      {
        role: "user",
        content: `Favorite game: ${input.favoriteGame}\nPlatform: ${input.platform}\nNotes: ${input.notes || "No extra notes provided."}`,
      },
    ],
  });

  return response.output_text.trim();
}
