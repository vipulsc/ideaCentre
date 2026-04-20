-- Likes on comments
alter table public.comments
  add column if not exists like_count int not null default 0;

create table if not exists public.comment_likes (
  user_id uuid not null references public.users(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

create index if not exists comment_likes_comment_id_idx
  on public.comment_likes (comment_id);
