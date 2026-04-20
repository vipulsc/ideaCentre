-- Core IdeaCentre schema (production baseline)
create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'idea_status') then
    create type public.idea_status as enum ('published', 'removed');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  image text,
  username text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  title text not null,
  idea text not null,
  description text,
  background_color text,
  like_count int not null default 0,
  comment_count int not null default 0,
  view_count int not null default 0,
  status public.idea_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ideas_created_at_idx on public.ideas (created_at desc);
create index if not exists ideas_category_created_idx on public.ideas (category_id, created_at desc);
create index if not exists ideas_author_id_idx on public.ideas (author_id);

create table if not exists public.likes (
  user_id uuid not null references public.users(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, idea_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists comments_idea_created_idx on public.comments (idea_id, created_at);

create table if not exists public.bookmarks (
  user_id uuid not null references public.users(id) on delete cascade,
  idea_id uuid not null references public.ideas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, idea_id)
);

create table if not exists public.idea_ai_insights (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null unique references public.ideas(id) on delete cascade,
  acceptance_score int not null check (acceptance_score >= 0 and acceptance_score <= 100),
  demand_level text not null check (demand_level in ('low', 'moderate', 'high')),
  competition_level text not null check (competition_level in ('low', 'moderate', 'high')),
  summary text,
  model text,
  generated_at timestamptz not null default now()
);

create table if not exists public.idea_roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  step_order int not null,
  phase text not null,
  detail text,
  unique (idea_id, step_order)
);

create table if not exists public.idea_competitors (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  name text not null,
  strength text,
  gap text
);

create table if not exists public.idea_audience_tags (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  tag text not null,
  unique (idea_id, tag)
);

-- Public read policies (writes should go through trusted server using service role key).
alter table public.categories enable row level security;
alter table public.ideas enable row level security;

drop policy if exists "Public categories are readable" on public.categories;
create policy "Public categories are readable"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Published ideas are readable" on public.ideas;
create policy "Published ideas are readable"
  on public.ideas
  for select
  to anon, authenticated
  using (status = 'published');
