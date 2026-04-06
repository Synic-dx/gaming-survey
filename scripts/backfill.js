import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Exact values from the new frontend
const BOOKS_OPTIONS = [
  "I don't read books",
  "1–3 books/year",
  "4–6 books/year",
  "7–12 books/year",
  "13–24 books/year",
  "25+ books/year",
];

const SERIES_OPTIONS = [
  "I don't watch series",
  "1–3 shows/year",
  "4–6 shows/year",
  "7–12 shows/year",
  "13–20 shows/year",
  "20+ shows/year",
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const { data: responses, error } = await supabase
    .from('responses')
    .select('id, name, age, gender, mbti_type, top_genres, books_selected, series_selected, reads_books_freq, watches_series_freq');

  if (error || !responses) {
    console.error("Failed to fetch:", error);
    process.exit(1);
  }

  // Backfill all records that don't have the new frequency columns set
  // We'll use the existing books_selected/series_selected arrays as hints
  const toProcess = responses.filter(r => !r.reads_books_freq || !r.watches_series_freq);

  console.log(`Processing ${toProcess.length} of ${responses.length} records...`);

  for (let i = 0; i < toProcess.length; i++) {
    const r = toProcess[i];
    console.log(`[${i+1}/${toProcess.length}] ${r.name || r.id}...`);

    const hasBooks = Array.isArray(r.books_selected) && r.books_selected.length > 0 &&
      !r.books_selected.includes("Only time I picked a book was for clearing IPMAT VA");
    const hasSeries = Array.isArray(r.series_selected) && r.series_selected.length > 0;

    const prompt = `You are an expert psychometric profiler. Given a respondent:
- Age: ${r.age || 'Unknown'}
- Gender: ${r.gender || 'Unknown'}
- MBTI Type: ${r.mbti_type || 'Unknown'}
- Game genres they like: ${Array.isArray(r.top_genres) ? r.top_genres.join(', ') : 'Unknown'}
- Books they selected (if any): ${hasBooks ? r.books_selected.join(', ') : 'None / chose the non-reader option'}
- Series they selected (if any): ${hasSeries ? r.series_selected.join(', ') : 'None'}

Pick exactly ONE option for each from these lists.

Books per year options (pick one):
${BOOKS_OPTIONS.join('\n')}

Series/shows per year options (pick one):
${SERIES_OPTIONS.join('\n')}

Important: if they chose no books, pick "I don't read books". If no series, pick "I don't watch series".
If they did choose books/series, estimate a plausible frequency based on their personality and choices.

Return ONLY valid JSON (no markdown):
{"reads_books_freq": "<exact option>", "watches_series_freq": "<exact option>"}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const parsed = JSON.parse(completion.choices[0].message.content);

      // Validate options
      const booksFreq = BOOKS_OPTIONS.includes(parsed.reads_books_freq) ? parsed.reads_books_freq : BOOKS_OPTIONS[0];
      const seriesFreq = SERIES_OPTIONS.includes(parsed.watches_series_freq) ? parsed.watches_series_freq : SERIES_OPTIONS[0];

      const { error: upErr } = await supabase
        .from('responses')
        .update({ reads_books_freq: booksFreq, watches_series_freq: seriesFreq })
        .eq('id', r.id);

      if (upErr) {
        console.error(`  -> Update failed:`, upErr.message);
      } else {
        console.log(`  -> books: "${booksFreq}", series: "${seriesFreq}"`);
      }

      await sleep(300);
    } catch (e) {
      console.error(`  -> Error:`, e.message);
    }
  }

  console.log("Done.");
}

main();
