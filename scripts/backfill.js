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

const seriesOptions = [
  "Action / Superhero (The Boys, Daredevil, Invincible, The Punisher)",
  "Thriller / Suspense (Breaking Bad, Better Call Saul, Dark, Narcos, Barry)",
  "Crime / Mafia (Peaky Blinders, Ozark, Narcos, Mirzapur, Gangs of Wasseypur)",
  "Political / Power Drama (Succession, House of Cards, Yes Minister, Scam 1992)",
  "Comedy / Sitcom (The Office, Brooklyn Nine Nine, Friends, Seinfeld, Panchayat)",
  "Horror (Stranger Things, Haunting of Hill House, Wednesday)",
  "Sci-Fi (Black Mirror, Westworld, Love Death and Robots, The Expanse)",
  "Fantasy (Game of Thrones, The Witcher, House of the Dragon, Shadow and Bone)",
  "Anime (Attack on Titan, Death Note, Naruto, One Piece, Demon Slayer, Jujutsu Kaisen)",
  "K-Drama / Asian (Squid Game, Crash Landing on You, Parasite)",
  "Spy / Espionage / Military (The Family Man, Special Ops, Band of Brothers, Homeland)",
  "Slice of Life / Feel Good (Panchayat, Ted Lasso, Kota Factory, Studio Ghibli)",
  "Documentary / True Crime (Making a Murderer, Our Planet, Wild Wild Country)",
  "Drama / Prestige TV (Succession, The Sopranos, Mad Men, Chernobyl, The Crown)",
];

const booksOptions = [
  "Only time I picked a book was for clearing IPMAT VA",
  "Literary Fiction / Classics (The Kite Runner, A Fine Balance, 1984, Animal Farm, Norwegian Wood, To Kill a Mockingbird, The Great Gatsby)",
  "Fantasy / Sci-Fi (Harry Potter, Dune, LOTR, Mistborn, Foundation, Hitchhiker's Guide)",
  "Mystery / Thriller (Da Vinci Code, Agatha Christie, Gone Girl, Sidney Sheldon)",
  "Dark / Psychological Fiction (Dostoevsky, Kafka, Camus, Notes from Underground, The Stranger, The Trial)",
  "Comedy / Satire / Wit (Catch-22, Three Men in a Boat, P.G. Wodehouse, Roald Dahl, Douglas Adams)",
  "Romance (Colleen Hoover, Nicholas Sparks, Jane Austen, Pride and Prejudice)",
  "Self-Help / Personal Growth (Atomic Habits, Ikigai, Subtle Art, Deep Work)",
  "Business / Finance / Entrepreneurship (Zero to One, Psychology of Money, Rich Dad Poor Dad)",
  "Biography / Memoir (Steve Jobs, Wings of Fire, Shoe Dog, Becoming, Born a Crime)",
  "Manga / Comics / Graphic Novels (One Piece, Naruto, Berserk, Chainsaw Man, Maus)",
  "History / Philosophy / Science (Sapiens, Thinking Fast and Slow, Meditations, A Brief History of Time)",
  "Poetry (Rumi, Rupi Kaur, Sylvia Plath, Pablo Neruda, Faiz Ahmed Faiz)",
  "Children's / Young Adult that you still love (Roald Dahl, Diary of a Wimpy Kid, Percy Jackson, Enid Blyton, Tintin, Ruskin Bond)",
];

const hobbiesOptions = [
  "Cricket", "Football / Soccer", "Badminton / Tennis / Table Tennis",
  "Basketball / Volleyball", "Gym / Weight training / CrossFit",
  "Running / Jogging / Marathon training", "Swimming", "Yoga / Meditation",
  "Trekking / Hiking / Camping", "Cycling / Skateboarding",
  "Martial arts / Boxing / MMA", "Dance (any form)",
  "Drawing / Painting / Sketching", "Digital art / Graphic design", "Photography",
  "Videography / Filmmaking / Video editing", "Playing a musical instrument",
  "Singing / Vocals", "Writing fiction or short stories", "Writing poetry",
  "Journaling / Diary writing", "Blogging / Newsletter writing",
  "Calligraphy / Lettering", "Craft / DIY / Origami / Model building", "Cooking / Baking",
  "Coding / Programming / App development", "Robotics / Electronics / Hardware tinkering",
  "Debating / MUN / Public speaking", "Quiz / Trivia competitions",
  "Learning new languages", "Stock market / Investing / Crypto",
  "Solving puzzles (Rubik's cube, jigsaw, logic puzzles)", "Chess (serious / tournament level)",
  "Content creation (YouTube, Instagram, Streaming, Podcasting)", "Meme making / Shitposting",
  "Music production / Beatmaking / DJing", "Curating playlists / Music discovery",
  "Film analysis / Reviewing shows and movies", "Writing reviews or threads (Reddit, Letterboxd, Goodreads)",
  "Volunteering / NGO work / Social service", "Event management / College fest organizing",
  "Student clubs / Societies / Committee work", "Board games / Card games / D&D (offline)",
  "Hosting or going to house parties / Social gatherings",
  "Collecting (coins, stamps, sneakers, figures, vintage items, cards)", "Gardening / Plant care",
  "Pet care / Animal related hobbies", "Astronomy / Stargazing", "Thrifting / Vintage shopping / Fashion curation"
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const { data: responses, error } = await supabase.from('responses').select('id, name, top_genres, age, gender, mbti_type, hobbies_selected, books_selected, series_selected, premiumness_avg');
  
  if (error || !responses) {
    console.error("Failed to fetch responses", error);
    process.exit(1);
  }

  // Filter those that literally have no arrays or are missing any of the 3 arrays. 
  // If an array is completely missing (null), we will estimate.
  const isEmpty = (arr) => !arr || (Array.isArray(arr) && arr.length === 0);

  const toBackfill = responses.filter(r => 
    isEmpty(r.hobbies_selected) && isEmpty(r.books_selected) && isEmpty(r.series_selected)
  );

  console.log(`Found ${toBackfill.length} records to backfill out of ${responses.length}.`);

  for (let i = 0; i < toBackfill.length; i++) {
    const r = toBackfill[i];
    console.log(`[${i+1}/${toBackfill.length}] Processing ${r.name || r.id}...`);

    const prompt = `You are an expert psychometric profiler. Given a survey respondent with the following profile:
- Age: ${r.age || 'Unknown'}
- Gender: ${r.gender || 'Unknown'}
- MBTI Type: ${r.mbti_type || 'Unknown'}
- Top Game Genres: ${Array.isArray(r.top_genres) ? r.top_genres.join(', ') : 'Unknown'}
- Premiumness Bias: ${r.premiumness_avg} (Higher = prefers AAA/expensive games)

Estimate their likely preferences for Series, Books, and Hobbies.
Select 1 to 5 genres from the exact Series Options.
Select 1 to 5 genres from the exact Books Options. (Use 'Only time I picked a book was for clearing IPMAT VA' if they seem totally uninterested in reading fiction/non-fiction based on their profile).
Select 1 to 10 choices from the exact Hobbies Options.

You must only return a valid JSON object strictly matching exactly this format (do not use markdown blocks):
{
  "series_selected": ["exact string 1", "exact string 2"],
  "books_selected": ["exact string 1"],
  "hobbies_selected": ["exact string 1", "exact string 2"]
}

Series Options:
${JSON.stringify(seriesOptions, null, 2)}

Books Options:
${JSON.stringify(booksOptions, null, 2)}

Hobbies Options:
${JSON.stringify(hobbiesOptions, null, 2)}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const resultStr = completion.choices[0].message.content;
      const parsed = JSON.parse(resultStr);

      const updatePayload = {};
      if (!r.series_selected || r.series_selected.length === 0) updatePayload.series_selected = parsed.series_selected || [];
      if (!r.books_selected || r.books_selected.length === 0) updatePayload.books_selected = parsed.books_selected || [];
      if (!r.hobbies_selected || r.hobbies_selected.length === 0) updatePayload.hobbies_selected = parsed.hobbies_selected || [];

      // Check if there are things to update
      if (Object.keys(updatePayload).length > 0) {
        const { error: upErr } = await supabase.from('responses').update(updatePayload).eq('id', r.id);
        if (upErr) {
          console.error("  -> Update failed:", upErr);
        } else {
          console.log("  -> Updated:", JSON.stringify(updatePayload));
        }
      } else {
        console.log("  -> Nothing to update");
      }

      await sleep(500); // rate limiting
    } catch (e) {
      console.error("  -> Error running OpenAI or processing:", e.message);
    }
  }

  console.log("Done backfilling.");
}

main();
