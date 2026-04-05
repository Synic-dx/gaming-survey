import "server-only";

import { google } from "googleapis";

import { getGoogleSheetsEnv } from "@/lib/env";

export type SurveySubmissionRow = {
  submittedAt: string;
  name: string;
  email: string;
  favoriteGame: string;
  platform: string;
  notes: string;
  aiSummary: string;
};

function createSheetsClient() {
  const env = getGoogleSheetsEnv();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.clientEmail,
      private_key: env.privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return {
    env,
    sheets: google.sheets({ version: "v4", auth }),
  };
}

export async function appendSurveySubmission(row: SurveySubmissionRow) {
  const { env, sheets } = createSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: env.spreadsheetId,
    range: `${env.sheetName}!A:G`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          row.submittedAt,
          row.name,
          row.email,
          row.favoriteGame,
          row.platform,
          row.notes,
          row.aiSummary,
        ],
      ],
    },
  });
}
