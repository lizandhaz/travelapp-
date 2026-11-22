-- Three things (owner, Nov 2026):
--   1. Followers and following (like Instagram) instead of mutual friends.
--   2. Boards (lists) can hold hotels, restaurants, beaches and things to do, not just places,
--      and can have a chosen cover photo.
--   3. Want to go can be shared: invite people you follow (who follow you back) to a place,
--      and it shows on their Want to go too, with each other's names.
-- Safe to run twice.

-- ───────────────────────── 1. Followers and following ─────────────────────────
-- follower_id follows followee_id. Private accounts (everyone for now: is_public is off) approve
-- followers, so a follow starts as 'pending'; public accounts are followed straight away.
-- Rule 3: under-18s never appear in search for people who don't already follow them or whom they
-- don't follow, and nobody can ask to follow them unless they already follow that person.

create table if not exists public.follows (
  follower_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  followee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists follows_followee on public.follows (followee_id);

alter table public.follows enable row level security;

drop policy if exists "People see follows they're part of" on public.follows;
create policy "People see follows they're part of"
  on public.follows for select to authenticated
  using ((select auth.uid()) in (follower_id, followee_id));

-- Unfollow, cancel a request, decline a request, or remove a follower.
drop policy if exists "Either person can remove a follow" on public.follows;
create policy "Either person can remove a follow"
  on public.follows for delete to authenticated
  using ((select auth.uid()) in (follower_id, followee_id));

revoke all on public.follows from anon;
revoke all on public.follows from authenticated;
grant select, delete on public.follows to authenticated;

-- Bring over the friendships made so far: friends follow each other; a waiting request becomes
-- a waiting follow. (The friendships table is left as it was.)
insert into public.follows (follower_id, followee_id, status, created_at, responded_at)
select requester_id, addressee_id, status, created_at, responded_at from public.friendships
on conflict do nothing;
insert into public.follows (follower_id, followee_id, status, created_at, responded_at)
select addressee_id, requester_id, 'accepted', created_at, responded_at from public.friendships where status = 'accepted'
on conflict do nothing;

-- Does a follow exist (accepted) from a to b?
create or replace function public.follows_accepted(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.follows where follower_id = p_a and followee_id = p_b and status = 'accepted');
$$;
revoke execute on function public.follows_accepted(uuid, uuid) from public, anon, authenticated;

-- Follows someone. Returns 'following' (public account), 'requested' (private account), or the
-- current state if you already do.
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

-- Lets someone who asked to follow you do so.
create or replace function public.accept_follower(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  update public.follows set status = 'accepted', responded_at = now()
  where follower_id = p_user and followee_id = auth.uid() and status = 'pending';
  if not found then
    raise exception 'That request isn''t there any more';
  end if;
end;
$$;
revoke execute on function public.accept_follower(uuid) from public, anon;
grant execute on function public.accept_follower(uuid) to authenticated;

-- Finds people by name or @handle (2+ characters). Says whether you follow them (following /
-- requested / none) and whether they follow you. Leaves out you, and under-18s with no follow
-- either way.
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
    order by (p.handle = v_q) desc, lower(p.name)
    limit 25;
end;
$$;
revoke execute on function public.search_people_follows(text) from public, anon;
grant execute on function public.search_people_follows(text) to authenticated;

-- Your followers, who you follow, and requests either way, with names and handles.
-- relation: 'follower' (they follow you) or 'following' (you follow them).
create or replace function public.my_follows()
returns table (user_id uuid, handle text, name text, relation text, status text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.handle, p.name, 'follower', f.status, f.created_at
  from public.follows f join public.profiles p on p.id = f.follower_id
  where f.followee_id = auth.uid()
  union all
  select p.id, p.handle, p.name, 'following', f.status, f.created_at
  from public.follows f join public.profiles p on p.id = f.followee_id
  where f.follower_id = auth.uid()
  order by 6 desc;
$$;
revoke execute on function public.my_follows() from public, anon;
grant execute on function public.my_follows() to authenticated;

-- ───────────────────────── 2. Spots on boards, and cover photos ─────────────────────────
-- kind: a place (the default, as before), or a stay / eat / do / gem; parent_name/parent_slug:
-- the place a spot is in ("Copenhagen"), so it can sit under that place on a board.
alter table public.board_items add column if not exists kind text not null default 'place';
alter table public.board_items add column if not exists parent_name text;
alter table public.board_items add column if not exists parent_slug text;
do $$ begin
  alter table public.board_items add constraint board_items_kind check (kind in ('place', 'stay', 'eat', 'do', 'gem'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.board_items add constraint board_items_parent check (
    (parent_name is null or char_length(btrim(parent_name)) between 1 and 80)
    and (parent_slug is null or parent_slug ~ '^[a-z0-9-]{1,60}$'));
exception when duplicate_object then null; end $$;

-- A board's chosen cover: one of the app's photos (by name), or none for the photo collage.
alter table public.boards add column if not exists cover text;
do $$ begin
  alter table public.boards add constraint boards_cover check (cover is null or cover ~ '^[a-z0-9-]{1,40}$');
exception when duplicate_object then null; end $$;
grant update (name, visibility, cover) on public.boards to authenticated;

-- ───────────────────────── 3. Shared Want to go ─────────────────────────
-- Items shared together carry the same share_id. Each person keeps their own copy on their own
-- Want to go (so removing yours doesn't remove theirs), and sees who else has it.
alter table public.board_items add column if not exists share_id uuid;
create index if not exists board_items_share on public.board_items (share_id) where share_id is not null;

-- Invites people to a place on your Want to go: it's added to theirs too. Only people you follow
-- who follow you back (so it's never a stranger, and rule 3 holds). Returns how many were added.
create or replace function public.share_wish_item(p_item uuid, p_users uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_item public.board_items;
  v_share uuid;
  v_user uuid;
  v_board uuid;
  v_added integer := 0;
begin
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  select i.* into v_item from public.board_items i join public.boards b on b.id = i.board_id
  where i.id = p_item and i.owner_id = v_me and b.kind = 'wish';
  if not found then
    raise exception 'That place isn''t on your Want to go';
  end if;
  if coalesce(array_length(p_users, 1), 0) > 20 then
    raise exception 'Invite up to 20 people at a time';
  end if;
  v_share := coalesce(v_item.share_id, gen_random_uuid());
  update public.board_items set share_id = v_share where id = v_item.id;

  foreach v_user in array coalesce(p_users, '{}') loop
    continue when v_user = v_me;
    if not (public.follows_accepted(v_me, v_user) and public.follows_accepted(v_user, v_me)) then
      raise exception 'You can only invite people you follow who follow you back';
    end if;
    select id into v_board from public.boards where owner_id = v_user and kind = 'wish';
    if not found then
      insert into public.boards (owner_id, name, kind, visibility) values (v_user, 'Want to go', 'wish', 'private') returning id into v_board;
    end if;
    insert into public.board_items (board_id, owner_id, place_slug, name, country, kind, parent_name, parent_slug, share_id)
    values (v_board, v_user, v_item.place_slug, v_item.name, v_item.country, v_item.kind, v_item.parent_name, v_item.parent_slug, v_share)
    on conflict (board_id, lower(btrim(name)), lower(btrim(country))) do update set share_id = v_share;
    v_added := v_added + 1;
  end loop;
  return v_added;
end;
$$;
revoke execute on function public.share_wish_item(uuid, uuid[]) from public, anon;
grant execute on function public.share_wish_item(uuid, uuid[]) to authenticated;

-- For each of your shared items, the other people who have it (names for "with Maya").
create or replace function public.my_shared_wishes()
returns table (item_id uuid, user_id uuid, name text, handle text)
language sql
stable
security definer
set search_path = ''
as $$
  select mine.id, p.id, p.name, p.handle
  from public.board_items mine
  join public.board_items other on other.share_id = mine.share_id and other.owner_id <> mine.owner_id
  join public.profiles p on p.id = other.owner_id
  where mine.owner_id = auth.uid() and mine.share_id is not null;
$$;
revoke execute on function public.my_shared_wishes() from public, anon;
grant execute on function public.my_shared_wishes() to authenticated;
