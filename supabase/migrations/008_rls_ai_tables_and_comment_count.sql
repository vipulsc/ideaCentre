-- Harden orphaned AI satellite tables (created in 001 before the auto-RLS
-- event trigger in 002) and keep ideas.comment_count in sync atomically.

-- 1) Enable RLS on the legacy AI tables. With no policies defined, anon and
-- authenticated roles are denied all access via PostgREST; the service role
-- (used by the app's API routes) still bypasses RLS.
alter table if exists public.idea_ai_insights enable row level security;
alter table if exists public.idea_roadmap_steps enable row level security;
alter table if exists public.idea_competitors enable row level security;
alter table if exists public.idea_audience_tags enable row level security;

-- 2) Keep ideas.comment_count correct without racy app-side recounts.
create or replace function public.sync_idea_comment_count()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.deleted_at is null then
      update public.ideas
        set comment_count = comment_count + 1, updated_at = now()
        where id = new.idea_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.deleted_at is null then
      update public.ideas
        set comment_count = greatest(comment_count - 1, 0), updated_at = now()
        where id = old.idea_id;
    end if;
    return old;
  elsif tg_op = 'UPDATE' then
    -- Soft delete / restore transitions on deleted_at.
    if old.deleted_at is null and new.deleted_at is not null then
      update public.ideas
        set comment_count = greatest(comment_count - 1, 0), updated_at = now()
        where id = new.idea_id;
    elsif old.deleted_at is not null and new.deleted_at is null then
      update public.ideas
        set comment_count = comment_count + 1, updated_at = now()
        where id = new.idea_id;
    end if;
    return new;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_comments_sync_count on public.comments;
create trigger trg_comments_sync_count
  after insert or update of deleted_at or delete on public.comments
  for each row execute function public.sync_idea_comment_count();

-- 3) Backfill counts so existing rows are consistent with the new trigger.
update public.ideas i
  set comment_count = coalesce(sub.cnt, 0)
  from (
    select idea_id, count(*)::int as cnt
    from public.comments
    where deleted_at is null
    group by idea_id
  ) sub
  where sub.idea_id = i.id;

update public.ideas
  set comment_count = 0
  where id not in (
    select distinct idea_id from public.comments where deleted_at is null
  );

-- 4) Feed performance: published ideas ordered by recency.
create index if not exists ideas_status_created_at_idx
  on public.ideas (status, created_at desc);

-- Bookmarks ordered by save time for the saved feed.
create index if not exists bookmarks_user_created_at_idx
  on public.bookmarks (user_id, created_at desc);
