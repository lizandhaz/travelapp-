-- Safety basics (plan Step J, owner Nov 2026): block people, report people, trips and comments, and delete
-- your own account and everything in it. Needed before real users join (UK GDPR, the UK Children's Code and
-- both app stores). Safe to run twice.

-- ───────────────────────── 1. Blocking ─────────────────────────
-- A block is one-way to set up, but it cuts both ways: neither of you can follow the other, you stop appearing
-- in each other's search, and existing follows between you are removed. The blocked person isn't told.
create table if not exists public.blocks (
  blocker_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index if not exists blocks_blocked on public.blocks (blocked_id);
alter table public.blocks enable row level security;

drop policy if exists "See who you've blocked" on public.blocks;
create policy "See who you've blocked"
  on public.blocks for select to authenticated
  using (blocker_id = auth.uid());
drop policy if exists "Unblock people" on public.blocks;
create policy "Unblock people"
  on public.blocks for delete to authenticated
  using (blocker_id = auth.uid());
revoke all on public.blocks from anon, authenticated;
grant select, delete on public.blocks to authenticated;

-- Is there a block between these two people, either way round? (Not callable by users.)
create or replace function public.blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.blocks
                 where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a));
$$;
revoke execute on function public.blocked_between(uuid, uuid) from public, anon, authenticated;

-- Block someone: records it and removes any follows (or requests) between you, both ways.
create or replace function public.block_user(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  if p_user is null or p_user = v_me then
    raise exception 'You can''t block yourself';
  end if;
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'That person isn''t on the app';
  end if;
  if (select count(*) from public.blocks where blocker_id = v_me) >= 1000 then
    raise exception 'You''ve blocked a lot of people. Unblock some first.';
  end if;
  insert into public.blocks (blocker_id, blocked_id) values (v_me, p_user) on conflict do nothing;
  delete from public.follows
   where (follower_id = v_me and followee_id = p_user) or (follower_id = p_user and followee_id = v_me);
end;
$$;
revoke execute on function public.block_user(uuid) from public, anon;
grant execute on function public.block_user(uuid) to authenticated;

-- The people you've blocked, with names (for Settings → Blocked people).
create or replace function public.my_blocks()
returns table (user_id uuid, name text, handle text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.handle, b.created_at
  from public.blocks b join public.profiles p on p.id = b.blocked_id
  where b.blocker_id = auth.uid()
  order by b.created_at desc;
$$;
revoke execute on function public.my_blocks() from public, anon;
grant execute on function public.my_blocks() to authenticated;

-- Following: as before (20261126120000_follows_boards_sharing.sql), plus no following across a block.
create or replace function public.follow_user(p_user uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_status text;
  v_public boolean;
begin
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  if p_user is null or p_user = v_me then
    raise exception 'You can''t follow yourself';
  end if;
  select is_public into v_public from public.profiles where id = p_user;
  if not found then
    raise exception 'That person isn''t on the app';
  end if;
  if public.blocked_between(v_me, p_user) then
    raise exception 'You can''t follow this person';
  end if;
  select status into v_status from public.follows where follower_id = v_me and followee_id = p_user;
  if found then
    return case when v_status = 'accepted' then 'following' else 'requested' end;
  end if;
  -- Rule 3: you can only ask to follow an under-18 if they already follow you.
  if not public.is_adult(p_user) and not public.follows_accepted(p_user, v_me) then
    raise exception 'You can''t follow this person';
  end if;
  if (select count(*) from public.follows where follower_id = v_me and status = 'pending') >= 300 then
    raise exception 'Too many requests waiting. Try again once some are answered.';
  end if;
  insert into public.follows (follower_id, followee_id, status, responded_at)
  values (v_me, p_user, case when v_public then 'accepted' else 'pending' end, case when v_public then now() end);
  return case when v_public then 'following' else 'requested' end;
end;
$$;
revoke execute on function public.follow_user(uuid) from public, anon;
grant execute on function public.follow_user(uuid) to authenticated;

-- Search: as before, plus people you've blocked or who've blocked you never show up.
create or replace function public.search_people_follows(p_query text)
returns table (id uuid, handle text, name text, status text, follows_you boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_q text := lower(btrim(regexp_replace(coalesce(p_query, ''), '^\s*@', '')));
  v_like text;
begin
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  if char_length(v_q) < 2 then
    return;
  end if;
  v_like := replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_');
  return query
    select p.id, p.handle, p.name,
           coalesce((select case when f.status = 'accepted' then 'following' else 'requested' end
                     from public.follows f where f.follower_id = v_me and f.followee_id = p.id), 'none'),
           public.follows_accepted(p.id, v_me)
    from public.profiles p
    where p.id <> v_me
      and (lower(p.name) like '%' || v_like || '%' or p.handle like v_like || '%')
      and (public.is_adult(p.id) or public.follows_accepted(p.id, v_me) or public.follows_accepted(v_me, p.id))
      and not public.blocked_between(v_me, p.id)
    order by (p.handle = v_q) desc, lower(p.name)
    limit 25;
end;
$$;
revoke execute on function public.search_people_follows(text) from public, anon;
grant execute on function public.search_people_follows(text) to authenticated;

-- Postcards: as before (20261130120000_likes_comments_postcards.sql), leaving out anyone you've blocked.
create or replace function public.my_postcards()
returns table (kind text, actor_id uuid, name text, handle text, avatar_path text, trip_id uuid, place text, body text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select t.id, (select d.name from public.trip_stops s join public.destinations d on d.id = s.destination_id
                  where s.trip_id = t.id order by s.position limit 1) as place
    from public.trips t where t.owner_id = auth.uid()
  ),
  events as (
    select 'like'::text as kind, l.user_id as actor, l.trip_id, null::text as body, l.created_at
    from public.trip_likes l join mine m on m.id = l.trip_id where l.user_id <> auth.uid()
    union all
    select 'comment', c.user_id, c.trip_id, c.body, c.created_at
    from public.trip_comments c join mine m on m.id = c.trip_id where c.user_id <> auth.uid()
    union all
    select case when f.status = 'pending' then 'follow_request' else 'new_follower' end, f.follower_id, null, null, f.created_at
    from public.follows f where f.followee_id = auth.uid()
  )
  select e.kind, e.actor, p.name, p.handle, p.avatar_path, e.trip_id, m.place, e.body, e.created_at
  from events e
  join public.profiles p on p.id = e.actor
  left join mine m on m.id = e.trip_id
  where (e.created_at > now() - interval '90 days' or e.kind = 'follow_request')
    and not exists (select 1 from public.blocks b where b.blocker_id = auth.uid() and b.blocked_id = e.actor)
  order by e.created_at desc
  limit 100;
$$;
revoke execute on function public.my_postcards() from public, anon;
grant execute on function public.my_postcards() to authenticated;

-- ───────────────────────── 2. Reporting ─────────────────────────
-- Report a person, a trip or a comment. Only the owner reads reports (Supabase dashboard → Table Editor → reports);
-- nobody can read them through the app. A short copy of the reported words is kept, in case it's deleted.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid default auth.uid() references auth.users (id) on delete set null,
  target_user uuid references auth.users (id) on delete set null,
  target_trip uuid references public.trips (id) on delete set null,
  target_comment uuid references public.trip_comments (id) on delete set null,
  reason text not null check (reason in ('spam', 'abuse', 'inappropriate', 'underage', 'other')),
  details text check (details is null or char_length(details) <= 500),
  snapshot text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'actioned')),
  created_at timestamptz not null default now()
);
create index if not exists reports_new on public.reports (status, created_at);
alter table public.reports enable row level security;
revoke all on public.reports from anon, authenticated;

create or replace function public.report_content(p_user uuid, p_trip uuid, p_comment uuid, p_reason text, p_details text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_user uuid := p_user;
  v_snapshot text;
begin
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  if p_reason is null or p_reason not in ('spam', 'abuse', 'inappropriate', 'underage', 'other') then
    raise exception 'Pick a reason';
  end if;
  if (select count(*) from public.reports where reporter_id = v_me and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'That''s a lot of reports. Try again a little later.';
  end if;
  if p_comment is not null then
    -- Only comments on trips you can see.
    select c.user_id, left(c.body, 500) into v_user, v_snapshot
    from public.trip_comments c where c.id = p_comment and public.can_see_trip(c.trip_id);
    if not found then
      raise exception 'That comment isn''t there any more';
    end if;
  elsif p_trip is not null then
    select t.owner_id, left(coalesce(t.note, ''), 500) into v_user, v_snapshot
    from public.trips t where t.id = p_trip and public.can_see_trip(t.id);
    if not found then
      raise exception 'That trip isn''t there any more';
    end if;
  elsif p_user is not null then
    select left(p.name || ' (@' || coalesce(p.handle, '') || ')', 500) into v_snapshot from public.profiles p where p.id = p_user;
    if not found then
      raise exception 'That person isn''t on the app';
    end if;
  else
    raise exception 'Nothing to report';
  end if;
  if v_user = v_me then
    raise exception 'You can''t report yourself';
  end if;
  insert into public.reports (reporter_id, target_user, target_trip, target_comment, reason, details, snapshot)
  values (v_me, v_user, p_trip, p_comment, p_reason, nullif(left(btrim(coalesce(p_details, '')), 500), ''), v_snapshot);
end;
$$;
revoke execute on function public.report_content(uuid, uuid, uuid, text, text) from public, anon;
grant execute on function public.report_content(uuid, uuid, uuid, text, text) to authenticated;

-- ───────────────────────── 3. Deleting your account ─────────────────────────
-- Deletes your login and, through the database's links, everything that's yours: profile, date of birth, trips
-- (and their stops, stays, restaurants, tips), boards, follows, likes, comments, place views and blocks.
-- Place names only you used go too. The app deletes your photos from storage first (it's allowed to delete
-- your own files). Reports you made stay, without your name, so moderation still works.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  -- Your trips first (their stops, stays, restaurants, tips, likes and comments go with them), then place names
  -- you added that no one else uses (e.g. "Grandma's house").
  delete from public.trips where owner_id = v_me;
  delete from public.destinations d
   where d.created_by = v_me
     and not exists (select 1 from public.trip_stops s where s.destination_id = d.id);
  delete from auth.users where id = v_me;
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
