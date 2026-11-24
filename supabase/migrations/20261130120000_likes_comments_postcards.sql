-- Plan Step H (owner, Nov 2026): likes and comments on trips are stored for real (until now they stayed on
-- the phone that made them), and Postcards (the app's notifications, product rule 4) show what happened:
-- likes and comments on your trips, follow requests and new followers.
--  * You can like or comment on a trip only if you can see it (yours, or a "Followers" trip of someone you
--    follow, accepted: can_see_trip from 20261128120000_followers_see_trips.sql).
--  * Names next to likes and comments only show for people you know (you, the trip's owner, and people you
--    follow or who follow you, accepted); anyone else reads as "Someone". So under-18s never become
--    visible to strangers this way (rule 3).
--  * You delete your own likes and comments; a trip's owner can also delete comments on it.
-- Safe to run twice.

-- Likes: one per person per trip.
create table if not exists public.trip_likes (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);
create index if not exists trip_likes_user on public.trip_likes (user_id);
alter table public.trip_likes enable row level security;

drop policy if exists "See likes on trips you can see" on public.trip_likes;
create policy "See likes on trips you can see"
  on public.trip_likes for select to authenticated
  using (public.can_see_trip(trip_id));
drop policy if exists "Like trips you can see" on public.trip_likes;
create policy "Like trips you can see"
  on public.trip_likes for insert to authenticated
  with check (user_id = auth.uid() and public.can_see_trip(trip_id));
drop policy if exists "Remove your own likes" on public.trip_likes;
create policy "Remove your own likes"
  on public.trip_likes for delete to authenticated
  using (user_id = auth.uid());

revoke all on public.trip_likes from anon, authenticated;
grant select, delete on public.trip_likes to authenticated;
grant insert (trip_id) on public.trip_likes to authenticated;

-- Comments: up to 500 characters.
create table if not exists public.trip_comments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists trip_comments_trip on public.trip_comments (trip_id, created_at);
create index if not exists trip_comments_user on public.trip_comments (user_id, created_at);
alter table public.trip_comments enable row level security;

drop policy if exists "See comments on trips you can see" on public.trip_comments;
create policy "See comments on trips you can see"
  on public.trip_comments for select to authenticated
  using (public.can_see_trip(trip_id));
drop policy if exists "Comment on trips you can see" on public.trip_comments;
create policy "Comment on trips you can see"
  on public.trip_comments for insert to authenticated
  with check (user_id = auth.uid() and public.can_see_trip(trip_id));
drop policy if exists "Remove your comments, or comments on your trip" on public.trip_comments;
create policy "Remove your comments, or comments on your trip"
  on public.trip_comments for delete to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = auth.uid()));

revoke all on public.trip_comments from anon, authenticated;
grant select, delete on public.trip_comments to authenticated;
grant insert (trip_id, body) on public.trip_comments to authenticated;

-- No more than 60 comments an hour each (stops floods).
create or replace function public.comments_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.trip_comments
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'That''s a lot of comments. Try again a little later.';
  end if;
  return new;
end;
$$;
drop trigger if exists trip_comments_rate_limit on public.trip_comments;
create trigger trip_comments_rate_limit before insert on public.trip_comments
  for each row execute function public.comments_rate_limit();

-- Is p_user someone I know: me, or an accepted follow either way?
create or replace function public.i_know(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_user = auth.uid() or exists (
    select 1 from public.follows f
    where f.status = 'accepted'
      and ((f.follower_id = auth.uid() and f.followee_id = p_user)
           or (f.followee_id = auth.uid() and f.follower_id = p_user)));
$$;
revoke execute on function public.i_know(uuid) from public, anon, authenticated;

-- Likes and comments on one trip, with names (for people you know, or the trip's owner).
create or replace function public.trip_reactions(p_trip uuid)
returns table (kind text, id uuid, user_id uuid, name text, handle text, avatar_path text, body text, created_at timestamptz, mine boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with t as (select owner_id from public.trips where id = p_trip and public.can_see_trip(p_trip))
  select r.kind, r.id, r.user_id,
         case when public.i_know(r.user_id) or r.user_id = (select owner_id from t) then p.name else 'Someone' end,
         case when public.i_know(r.user_id) or r.user_id = (select owner_id from t) then p.handle end,
         case when public.i_know(r.user_id) or r.user_id = (select owner_id from t) then p.avatar_path end,
         r.body, r.created_at, r.user_id = auth.uid()
  from (
    select 'like'::text as kind, null::uuid as id, l.user_id, null::text as body, l.created_at
    from public.trip_likes l where l.trip_id = p_trip and exists (select 1 from t)
    union all
    select 'comment', c.id, c.user_id, c.body, c.created_at
    from public.trip_comments c where c.trip_id = p_trip and exists (select 1 from t)
  ) r
  join public.profiles p on p.id = r.user_id
  order by r.created_at;
$$;
revoke execute on function public.trip_reactions(uuid) from public, anon;
grant execute on function public.trip_reactions(uuid) to authenticated;

-- Like counts for several trips at once (feed cards): how many, and whether I liked it.
create or replace function public.trip_like_counts(p_trips uuid[])
returns table (trip_id uuid, likes bigint, comments bigint, liked boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select t.id,
         (select count(*) from public.trip_likes l where l.trip_id = t.id),
         (select count(*) from public.trip_comments c where c.trip_id = t.id),
         exists (select 1 from public.trip_likes l where l.trip_id = t.id and l.user_id = auth.uid())
  from public.trips t
  where t.id = any (p_trips) and public.can_see_trip(t.id);
$$;
revoke execute on function public.trip_like_counts(uuid[]) from public, anon;
grant execute on function public.trip_like_counts(uuid[]) to authenticated;

-- When I last opened Postcards (for the unread count on Home's paper plane).
create table if not exists public.postcards_seen (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  seen_at timestamptz not null default now()
);
alter table public.postcards_seen enable row level security;
drop policy if exists "See when you last opened Postcards" on public.postcards_seen;
create policy "See when you last opened Postcards"
  on public.postcards_seen for select to authenticated
  using (user_id = auth.uid());
revoke all on public.postcards_seen from anon, authenticated;
grant select on public.postcards_seen to authenticated;

create or replace function public.mark_postcards_seen()
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.postcards_seen (user_id, seen_at) values (auth.uid(), now())
  on conflict (user_id) do update set seen_at = excluded.seen_at;
$$;
revoke execute on function public.mark_postcards_seen() from public, anon;
grant execute on function public.mark_postcards_seen() to authenticated;

-- My Postcards, newest first (last 90 days, up to 100): likes and comments on my trips by others,
-- follow requests waiting for me, and people who follow me. Everyone here follows me or asked to,
-- so their names are mine to see.
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
  where e.created_at > now() - interval '90 days' or e.kind = 'follow_request'
  order by e.created_at desc
  limit 100;
$$;
revoke execute on function public.my_postcards() from public, anon;
grant execute on function public.my_postcards() to authenticated;
