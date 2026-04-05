This is a [Next.js](https://nextjs.org) starter for a gaming survey app with:

- Tailwind CSS v4
- `shadcn/ui`
- OpenAI SDK integration
- Google Sheets submission support

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Environment setup

Copy `.env.example` to `.env.local` and set:

```bash
OPENAI_API_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Responses
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Share your target Google Sheet with the `GOOGLE_SHEETS_CLIENT_EMAIL` service
account email so the app can append rows.

## Submission API

`POST /api/submissions`

Example JSON body:

```json
{
  "name": "Sam",
  "email": "sam@example.com",
  "favoriteGame": "Helldivers 2",
  "platform": "PC",
  "notes": "Plays co-op games every weekend."
}
```

The route appends the submission to Google Sheets and, when `OPENAI_API_KEY`
is present, generates a short AI summary for the final column.
