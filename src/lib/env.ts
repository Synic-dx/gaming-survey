import "server-only";

import { z } from "zod";

const sheetsEnvSchema = z.object({
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1),
  GOOGLE_SHEETS_SHEET_NAME: z.string().min(1).default("Responses"),
  GOOGLE_SHEETS_CLIENT_EMAIL: z.string().email(),
  GOOGLE_SHEETS_PRIVATE_KEY: z.string().min(1),
});

export function getOpenAIApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

export function getGoogleSheetsEnv() {
  const result = sheetsEnvSchema.parse({
    GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    GOOGLE_SHEETS_SHEET_NAME: process.env.GOOGLE_SHEETS_SHEET_NAME || "Responses",
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
  });

  return {
    spreadsheetId: result.GOOGLE_SHEETS_SPREADSHEET_ID,
    sheetName: result.GOOGLE_SHEETS_SHEET_NAME,
    clientEmail: result.GOOGLE_SHEETS_CLIENT_EMAIL,
    privateKey: result.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };
}
