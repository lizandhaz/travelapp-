-- Plan Step C (owner, Nov 2026): people you've accepted as followers see your "Followers" trips and
-- boards (visibility 'friends' in the database). "Just me" stays yours only. Followers see the trip's
-- places, stay, restaurants, tip and photos, and your profile picture; nothing else of yours.
-- Rule 3 still holds: nobody can follow an under-18 unless the under-18 already follows them, and
-- every follow of a private account has to be accepted first.
-- Read-only: followers can't change anything. Safe to run twice.

-- Do I (the signed-in person) follow p_user, accepted?
create or replace function public.i_follow(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.follows
    where follower_id = auth.uid() and followee_id = p_user and status = 'accepted'
  );
$$;
revoke execute on function public.i_follow(uuid) from public, anon;
grant execute on function public.i_follow(uuid) to authenticated;

-- Can I see this trip? Mine, or a "Followers" trip of someone I follow.
create or replace function public.can_see_trip(p_trip uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trips t
    where t.id = p_trip
      and (t.owner_id = auth.uid()
           or (t.visibility = 'friends' and exists (
                 select 1 from public.follows f
                 where f.follower_id = auth.uid() and f.followee_id = t.owner_id and f.status = 'accepted')))
  );
$$;
revoke execute on function public.can_see_trip(uuid) from public, anon;
grant execute on function public.can_see_trip(uuid) to authenticated;

-- Can I see this board? Mine, or a "Followers" board of someone I follow.
create or replace function public.can_see_board(p_board uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.boards b
    where b.id = p_board
      and (b.owner_id = auth.uid()
           or (b.visibility = 'friends' and exists (
                 select 1 from public.follows f
                 where f.follower_id = auth.uid() and f.followee_id = b.owner_id and f.status = 'accepted')))
  );
$$;
revoke execute on function public.can_see_board(uuid) from public, anon;
grant execute on function public.can_see_board(uuid) to authenticated;

-- ── Trips and their details ──
drop policy if exists "Followers see Followers trips" on public.trips;
create policy "Followers see Followers trips"
  on public.trips for select to authenticated
  using (visibility = 'friends' and public.i_follow(owner_id));

drop policy if exists "Followers see stops of trips they can see" on public.trip_stops;
create policy "Followers see stops of trips they can see"
  on public.trip_stops for select to authenticated using (public.can_see_trip(trip_id));

drop policy if exists "Followers see stays of trips they can see" on public.stays;
create policy "Followers see stays of trips they can see"
  on public.stays for select to authenticated using (public.can_see_trip(trip_id));

drop policy if exists "Followers see restaurants of trips they can see" on public.food_picks;
create policy "Followers see restaurants of trips they can see"
  on public.food_picks for select to authenticated using (public.can_see_trip(trip_id));

drop policy if exists "Followers see tips of trips they can see" on public.top_tips;
create policy "Followers see tips of trips they can see"
  on public.top_tips for select to authenticated using (public.can_see_trip(trip_id));

-- The place names on trips you can see (so "Grandma's house" shows only to people who can see that trip).
drop policy if exists "People see places on trips they can see" on public.destinations;
create policy "People see places on trips they can see"
  on public.destinations for select to authenticated
  using (exists (select 1 from public.trip_stops s where s.destination_id = destinations.id and public.can_see_trip(s.trip_id)));

-- ── Boards ──
drop policy if exists "Followers see Followers boards" on public.boards;
create policy "Followers see Followers boards"
  on public.boards for select to authenticated
  using (visibility = 'friends' and public.i_follow(owner_id));

drop policy if exists "Followers see places on boards they can see" on public.board_items;
create policy "Followers see places on boards they can see"
  on public.board_items for select to authenticated using (public.can_see_board(board_id));

-- ── Photos ──
-- A follower can open (get a link to) a photo on a trip they can see, and the profile picture of anyone
-- they follow or who follows them (accepted either way). Nothing else in your folder.
create or replace function public.can_see_photo(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
      select 1 from public.trips t
      where p_path = any (t.photo_paths)
        and t.visibility = 'friends'
        and exists (select 1 from public.follows f
                    where f.follower_id = auth.uid() and f.followee_id = t.owner_id and f.status = 'accepted'))
    or exists (
      select 1 from public.profiles p
      where p.avatar_path = p_path
        and exists (select 1 from public.follows f
                    where f.status = 'accepted'
                      and ((f.follower_id = auth.uid() and f.followee_id = p.id)
                           or (f.followee_id = auth.uid() and f.follower_id = p.id))));
$$;
revoke execute on function public.can_see_photo(text) from public, anon;
grant execute on function public.can_see_photo(text) to authenticated;

drop policy if exists "Followers see photos they're allowed to" on storage.objects;
create policy "Followers see photos they're allowed to"
  on storage.objects for select to authenticated
  using (bucket_id = 'trip-photos' and public.can_see_photo(name));

-- ── Names and pictures of the people you follow (and who follow you), accepted either way ──
create or replace function public.my_people()
returns table (user_id uuid, name text, handle text, avatar_path text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.handle, p.avatar_path
  from public.profiles p
  where p.id <> auth.uid()
    and exists (select 1 from public.follows f
                where f.status = 'accepted'
                  and ((f.follower_id = auth.uid() and f.followee_id = p.id)
                       or (f.followee_id = auth.uid() and f.follower_id = p.id)));
$$;
revoke execute on function public.my_people() from public, anon;
grant execute on function public.my_people() to authenticated;
