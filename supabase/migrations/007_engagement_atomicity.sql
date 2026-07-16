-- Durable rate limiting + atomic engagement count maintenance

create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hit_count int not null default 0
);

alter table public.rate_limits enable row level security;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
)
returns table(allowed boolean, remaining int)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := now();
  v_window interval := make_interval(secs => greatest(p_window_seconds, 1));
  v_row public.rate_limits%rowtype;
  v_count int;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return query select false, 0;
    return;
  end if;

  insert into public.rate_limits as rl (key, window_start, hit_count)
  values (p_key, v_now, 1)
  on conflict (key) do update
    set
      window_start = case
        when rl.window_start + v_window <= v_now then v_now
        else rl.window_start
      end,
      hit_count = case
        when rl.window_start + v_window <= v_now then 1
        else rl.hit_count + 1
      end
  returning * into v_row;

  v_count := v_row.hit_count;

  if v_count > p_limit then
    -- roll back the excess hit so the counter stays at the limit
    update public.rate_limits
      set hit_count = p_limit
      where key = p_key;
    return query select false, 0;
  else
    return query select true, greatest(p_limit - v_count, 0);
  end if;
end;
$$;

revoke all on function public.consume_rate_limit(text, int, int) from public;
grant execute on function public.consume_rate_limit(text, int, int) to service_role;

-- Keep idea.like_count in sync
create or replace function public.sync_idea_like_count()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    update public.ideas
      set like_count = like_count + 1, updated_at = now()
      where id = new.idea_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.ideas
      set like_count = greatest(like_count - 1, 0), updated_at = now()
      where id = old.idea_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_likes_sync_count on public.likes;
create trigger trg_likes_sync_count
  after insert or delete on public.likes
  for each row execute function public.sync_idea_like_count();

-- Keep comment.like_count in sync
create or replace function public.sync_comment_like_count()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    update public.comments
      set like_count = coalesce(like_count, 0) + 1, updated_at = now()
      where id = new.comment_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.comments
      set like_count = greatest(coalesce(like_count, 0) - 1, 0), updated_at = now()
      where id = old.comment_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_comment_likes_sync_count on public.comment_likes;
create trigger trg_comment_likes_sync_count
  after insert or delete on public.comment_likes
  for each row execute function public.sync_comment_like_count();

-- Atomic like toggle
create or replace function public.toggle_idea_like(
  p_user_id uuid,
  p_idea_id uuid
)
returns table(is_liked boolean, like_count int)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_exists boolean;
  v_count int;
begin
  select exists(
    select 1 from public.likes
    where user_id = p_user_id and idea_id = p_idea_id
  ) into v_exists;

  if v_exists then
    delete from public.likes
      where user_id = p_user_id and idea_id = p_idea_id;
    is_liked := false;
  else
    insert into public.likes (user_id, idea_id)
      values (p_user_id, p_idea_id)
      on conflict do nothing;
    is_liked := true;
  end if;

  select i.like_count into v_count from public.ideas i where i.id = p_idea_id;
  like_count := coalesce(v_count, 0);
  return next;
end;
$$;

revoke all on function public.toggle_idea_like(uuid, uuid) from public;
grant execute on function public.toggle_idea_like(uuid, uuid) to service_role;

create or replace function public.toggle_idea_bookmark(
  p_user_id uuid,
  p_idea_id uuid
)
returns table(is_bookmarked boolean)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_exists boolean;
begin
  select exists(
    select 1 from public.bookmarks
    where user_id = p_user_id and idea_id = p_idea_id
  ) into v_exists;

  if v_exists then
    delete from public.bookmarks
      where user_id = p_user_id and idea_id = p_idea_id;
    is_bookmarked := false;
  else
    insert into public.bookmarks (user_id, idea_id)
      values (p_user_id, p_idea_id)
      on conflict do nothing;
    is_bookmarked := true;
  end if;

  return next;
end;
$$;

revoke all on function public.toggle_idea_bookmark(uuid, uuid) from public;
grant execute on function public.toggle_idea_bookmark(uuid, uuid) to service_role;

create or replace function public.toggle_comment_like(
  p_user_id uuid,
  p_comment_id uuid
)
returns table(is_liked boolean, like_count int)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_exists boolean;
  v_count int;
begin
  select exists(
    select 1 from public.comment_likes
    where user_id = p_user_id and comment_id = p_comment_id
  ) into v_exists;

  if v_exists then
    delete from public.comment_likes
      where user_id = p_user_id and comment_id = p_comment_id;
    is_liked := false;
  else
    insert into public.comment_likes (user_id, comment_id)
      values (p_user_id, p_comment_id)
      on conflict do nothing;
    is_liked := true;
  end if;

  select c.like_count into v_count from public.comments c where c.id = p_comment_id;
  like_count := coalesce(v_count, 0);
  return next;
end;
$$;

revoke all on function public.toggle_comment_like(uuid, uuid) from public;
grant execute on function public.toggle_comment_like(uuid, uuid) to service_role;
