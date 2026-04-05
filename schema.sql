create table responses (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  age text,
  gender text,
  education text,
  laptop_price text,
  platform text,
  gaming_hours text,
  games_selected jsonb default '[]',
  genre_scores jsonb default '{}',
  trait_scores jsonb default '{}',
  premiumness_avg float,
  top_genres jsonb default '[]',
  gaming_motivation jsonb default '[]',
  personality_responses jsonb default '{}',
  big_five_scores jsonb default '{}',
  mbti_type text,
  series_selected jsonb default '[]',
  books_selected jsonb default '[]',
  hobbies_selected jsonb default '[]',
  socioeconomic_score float,
  completed boolean default false
);

-- Enable RLS
alter table responses enable row level security;

-- Allow anonymous inserts
create policy "Allow anonymous inserts" on responses for insert with check (true);

-- Allow anonymous updates
create policy "Allow anonymous updates" on responses for update using (true);

-- Allow anonymous selects
create policy "Allow anonymous selects" on responses for select using (true);
