-- Performance: frequent idea like lookups by idea_id
create index if not exists likes_idea_id_idx on public.likes (idea_id);

-- Enable RLS explicitly on all user-content tables.
alter table public.users enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.comment_likes enable row level security;

-- Public read access for non-deleted comments on published ideas.
drop policy if exists "Published idea comments are readable" on public.comments;
create policy "Published idea comments are readable"
  on public.comments
  for select
  to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.ideas
      where ideas.id = comments.idea_id
        and ideas.status = 'published'
    )
  );

