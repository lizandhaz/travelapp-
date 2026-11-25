-- Public profiles (owner, Nov 2026): a profile is private (the default) or public, entirely the person's choice
-- (18+ only: rule 3, enforced by the existing trigger on profiles.is_public). On a public profile they choose, for
-- each part, who sees it: everyone, or followers only:
--   share_trips   their trips set to share (visibility 'friends'); "Just me" trips are never shown to anyone else
--   share_boards  their boards set to share
--   share_stats   their trip and country counts and travel map
-- Following a public profile needs no request (as before). Blocks always win. Safe to run twice.

alter table public.profiles add column if not exists share_trips text not null default 'everyone';
alter table public.profiles add column if not exists share_boards text not null default 'everyone';
alter table public.profiles add column if not exists share_stats text not null default 'everyone';
do $$ begin
  alter table public.profiles add constraint profiles_share_values check (
    share_trips in ('everyone', 'followers') and share_boards in ('everyone', 'followers') and share_stats in ('everyone', 'followers'));
exception when duplicate_object then null; end $$;
grant update (share_trips, share_boards, share_stats) on public.profiles to authenticated;

-- Does this person show this part of their profile to everyone? Public, adult, set to "everyone", and no block
-- between them and whoever is asking.
create or replace function public.shares_with_everyone(p_owner uuid, p_what text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_owner
      and p.is_public
      and public.is_adult(p.id)
      and case p_what when 'trips' then p.share_trips when 'boards' then p.share_boards when 'stats' then p.share_stats end = 'everyone'
  ) and not public.blocked_between(auth.uid(), p_owner);
$$;
revoke execute on function public.shares_with_everyone(uuid, text) from public, anon;
-- Row policies call it as the signed-in person, so they need to be allowed to; it only says yes or no.
grant execute on function public.shares_with_everyone(uuid, text) to authenticated;

-- Can I see this trip? Mine; a shared trip of someone I follow; or a shared trip on a public profile that shows trips.
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
           or (t.visibility = 'friends'
               and (exists (select 1 from public.follows f
                            where f.follower_id = auth.uid() and f.followee_id = t.owner_id and f.status = 'accepted')
                    or public.shares_with_everyone(t.owner_id, 'trips'))))
  );
$$;
revoke execute on function public.can_see_trip(uuid) from public, anon;
grant execute on function public.can_see_trip(uuid) to authenticated;

-- Can I see this board? The same, for boards.
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
           or (b.visibility = 'friends'
               and (exists (select 1 from public.follows f
                            where f.follower_id = auth.uid() and f.followee_id = b.owner_id and f.status = 'accepted')
                    or public.shares_with_everyone(b.owner_id, 'boards'))))
  );
$$;
revoke execute on function public.can_see_board(uuid) from public, anon;
grant execute on function public.can_see_board(uuid) to authenticated;

drop policy if exists "Everyone sees shared trips on public profiles" on public.trips;
create policy "Everyone sees shared trips on public profiles"
  on public.trips for select to authenticated
  using (visibility = 'friends' and public.shares_with_everyone(owner_id, 'trips'));

drop policy if exists "Everyone sees shared boards on public profiles" on public.boards;
create policy "Everyone sees shared boards on public profiles"
  on public.boards for select to authenticated
  using (visibility = 'friends' and public.shares_with_everyone(owner_id, 'boards'));

-- Photos: as before, plus photos on trips anyone can see, and the profile picture of a public adult profile.
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
        and (exists (select 1 from public.follows f
                     where f.follower_id = auth.uid() and f.followee_id = t.owner_id and f.status = 'accepted')
             or public.shares_with_everyone(t.owner_id, 'trips')))
    or exists (
      select 1 from public.profiles p
      where p.avatar_path = p_path
        and ((p.is_public and public.is_adult(p.id) and not public.blocked_between(auth.uid(), p.id))
             or exists (select 1 from public.follows f
                        where f.status = 'accepted'
                          and ((f.follower_id = auth.uid() and f.followee_id = p.id)
                               or (f.followee_id = auth.uid() and f.follower_id = p.id)))));
$$;
revoke execute on function public.can_see_photo(text) from public, anon;
grant execute on function public.can_see_photo(text) to authenticated;

-- Someone's profile card: name, picture, follower counts, whether you follow each other, and which parts you
-- can see. Stats (shared trips and countries) only when you're allowed. Nothing at all for someone blocked either
-- way, or for an under-18 you don't already follow (or who doesn't follow you): rule 3.
create or replace function public.profile_card(p_user uuid)
returns table (
  id uuid, name text, handle text, avatar_path text, is_public boolean,
  followers bigint, following bigint, status text, follows_you boolean,
  see_trips boolean, see_boards boolean, see_stats boolean, trips bigint, countries bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_mine boolean := p_user = v_me;
  v_follow boolean;
  v_stats boolean;
begin
  if v_me is null then
    raise exception 'Not signed in';
  end if;
  if not exists (select 1 from public.profiles where profiles.id = p_user) then
    return;
  end if;
  if not v_mine and (public.blocked_between(v_me, p_user)
      or (not public.is_adult(p_user) and not public.follows_accepted(p_user, v_me) and not public.follows_accepted(v_me, p_user))) then
    return;
  end if;
  v_follow := v_mine or public.follows_accepted(v_me, p_user);
  v_stats := v_follow or public.shares_with_everyone(p_user, 'stats');
  return query
    select p.id, p.name, p.handle, p.avatar_path, p.is_public and public.is_adult(p.id),
           (select count(*) from public.follows f where f.followee_id = p.id and f.status = 'accepted'),
           (select count(*) from public.follows f where f.follower_id = p.id and f.status = 'accepted'),
           case when v_mine then 'me'
                else coalesce((select case when f.status = 'accepted' then 'following' else 'requested' end
                               from public.follows f where f.follower_id = v_me and f.followee_id = p.id), 'none') end,
           public.follows_accepted(p.id, v_me),
           v_follow or public.shares_with_everyone(p.id, 'trips'),
           v_follow or public.shares_with_everyone(p.id, 'boards'),
           v_stats,
           case when v_stats then (select count(*) from public.trips t where t.owner_id = p.id and (v_mine or t.visibility = 'friends')) end,
           case when v_stats then (select count(distinct lower(d.country)) from public.trips t
                                   join public.trip_stops s on s.trip_id = t.id
                                   join public.destinations d on d.id = s.destination_id
                                   where t.owner_id = p.id and (v_mine or t.visibility = 'friends') and coalesce(d.country, '') <> '') end
    from public.profiles p where p.id = p_user;
end;
$$;
revoke execute on function public.profile_card(uuid) from public, anon;
grant execute on function public.profile_card(uuid) to authenticated;
