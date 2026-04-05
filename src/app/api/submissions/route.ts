import { NextResponse } from "next/server";
import { z } from "zod";

import { appendSurveySubmission } from "@/lib/google-sheets";
import { summarizeSubmission } from "@/lib/openai";

const submissionSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  favoriteGame: z.string().min(1).max(120),
  platform: z.string().min(1).max(80),
  notes: z.string().max(1000).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const payload = submissionSchema.parse(await request.json());

    const aiSummary = await summarizeSubmission({
      favoriteGame: payload.favoriteGame,
      platform: payload.platform,
      notes: payload.notes,
    });

    await appendSurveySubmission({
      submittedAt: new Date().toISOString(),
      name: payload.name,
      email: payload.email,
      favoriteGame: payload.favoriteGame,
      platform: payload.platform,
      notes: payload.notes,
      aiSummary,
    });

    return NextResponse.json({
      ok: true,
      message: "Submission saved to Google Sheets.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request body.",
          issues: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Unable to save the submission. Check your OpenAI and Google Sheets environment variables.",
      },
      { status: 500 }
    );
  }
}
