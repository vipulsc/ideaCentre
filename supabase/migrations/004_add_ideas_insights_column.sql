-- Store AI-generated insights directly on the idea row for fast reads.
alter table public.ideas
  add column if not exists insights jsonb;
