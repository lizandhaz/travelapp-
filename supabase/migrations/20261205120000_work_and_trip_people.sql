-- Who you went with (owner, Nov 2026): a "Work" option, and tagging friends on a trip.
--
-- * trips.companions also allows 'work'.
-- * trip_people (trip_id, user_id): friends tagged on a trip. Only people you follow who follow you back (so nobody,
--   and no under-18, can be tagged by a stranger: rule 3), never anyone blocked either way, at most 20, never yourself.
--   Set only through save_trip ("with_people": [user ids]) via set_trip_people(), which replaces the list. People not
--   allowed are quietly left out (e.g. they unfollowed in the meantime).
-- * Read: the trip's owner sees its rows; a tagged person sees their own row only if they can see the trip. Either can
--   delete it (untag). Names come from trip_people_of(trip): only for someone who can see the trip, and only people
--   they know (accepted follows either way) or on their own trip; nobody blocked.
-- Safe to run twice.

alter table public.trips drop constraint if exists trips_companions_check;
alter table public.trips add constraint trips_companions_check
  check (companions in ('solo', 'partner', 'friends', 'family', 'work'));

create table if not exists public.trip_people (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);
create index if not exists trip_people_user_idx on public.trip_people (user_id);
alter table public.trip_people enable row level security;
revoke all on public.trip_people from anon, authenticated;
grant select, delete on public.trip_people to authenticated;

drop policy if exists trip_people_read on public.trip_people;
create policy trip_people_read on public.trip_people for select to authenticated using (
  exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = auth.uid())
  or (user_id = auth.uid() and public.can_see_trip(trip_id))
);
drop policy if exists trip_people_untag on public.trip_people;
create policy trip_people_untag on public.trip_people for delete to authenticated using (
  exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = auth.uid())
  or user_id = auth.uid()
);

-- Replace who's tagged on one of your trips (called by save_trip).
create or replace function public.set_trip_people(p_trip uuid, p_users uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
begin
  select owner_id into v_owner from public.trips where id = p_trip;
  if v_owner is null or v_owner is distinct from auth.uid() then
    raise exception 'Trip not found' using errcode = 'no_data_found';
  end if;
  if coalesce(array_length(p_users, 1), 0) > 20 then
    raise exception 'Up to 20 friends on one trip, please.' using errcode = 'check_violation';
  end if;
  delete from public.trip_people where trip_id = p_trip;
  insert into public.trip_people (trip_id, user_id)
  select distinct p_trip, u
  from unnest(coalesce(p_users, '{}')) as u
  where u <> v_owner
    and exists (select 1 from public.follows f where f.follower_id = v_owner and f.followee_id = u and f.status = 'accepted')
    and exists (select 1 from public.follows f where f.follower_id = u and f.followee_id = v_owner and f.status = 'accepted')
    and not public.blocked_between(v_owner, u);
end;
$$;
revoke execute on function public.set_trip_people(uuid, uuid[]) from public, anon;
grant execute on function public.set_trip_people(uuid, uuid[]) to authenticated;

-- Who's tagged on a trip, with names, for someone who can see it.
create or replace function public.trip_people_of(p_trip uuid)
returns table (user_id uuid, name text, handle text, avatar_path text)
language sql
stable
security definer
set search_path = ''
as $$
  select tp.user_id, p.name, p.handle, p.avatar_path
  from public.trip_people tp
  join public.profiles p on p.id = tp.user_id
  where tp.trip_id = p_trip
    and public.can_see_trip(p_trip)
    and (public.i_know(tp.user_id) or exists (select 1 from public.trips t where t.id = p_trip and t.owner_id = auth.uid()))
    and not public.blocked_between(auth.uid(), tp.user_id)
  order by tp.created_at, p.name;
$$;
revoke execute on function public.trip_people_of(uuid) from public, anon;
grant execute on function public.trip_people_of(uuid) to authenticated;

create or replace function public.save_trip(p_trip jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid := nullif(p_trip ->> 'id', '')::uuid;
  v_month date;
  v_stop jsonb;
  v_pos int := 0;
  v_text text;
  v_photos text[] := '{}';
  v_name text;
  v_start date;
  v_end date;
begin
  if auth.uid() is null then
    raise exception 'Please log in first';
  end if;

  begin
    v_month := to_date(p_trip ->> 'month', 'YYYY-MM');
  exception when others then
    raise exception 'When did you go?' using errcode = 'check_violation';
  end;
  if v_month is null then
    raise exception 'When did you go?' using errcode = 'check_violation';
  end if;

  -- Optional exact dates ("YYYY-MM-DD"), both or neither. The month follows the first day, and the main place's
  -- nights are worked out from them, so the three always agree.
  if nullif(p_trip ->> 'start_date', '') is not null or nullif(p_trip ->> 'end_date', '') is not null then
    begin
      v_start := (p_trip ->> 'start_date')::date;
      v_end := (p_trip ->> 'end_date')::date;
    exception when others then
      raise exception 'Those dates don''t look right.' using errcode = 'check_violation';
    end;
    if v_start is null or v_end is null or v_end <= v_start then
      raise exception 'Pick the day you arrived and the day you left.' using errcode = 'check_violation';
    end if;
    v_month := date_trunc('month', v_start)::date;
  end if;

  if jsonb_typeof(p_trip -> 'stops') is distinct from 'array'
     or jsonb_array_length(p_trip -> 'stops') = 0 then
    raise exception 'Where did you go?' using errcode = 'check_violation';
  end if;
  if jsonb_array_length(p_trip -> 'stops') > 10 then
    raise exception 'Up to 10 places per trip, please.' using errcode = 'check_violation';
  end if;

  if jsonb_typeof(p_trip -> 'photo_paths') = 'array' then
    v_photos := array(select jsonb_array_elements_text(p_trip -> 'photo_paths'));
  end if;

  if v_id is null then
    insert into public.trips (trip_month, start_date, end_date, score, visibility, companions, note, photo_paths, would_return)
    values (
      v_month,
      v_start,
      v_end,
      (p_trip ->> 'score')::numeric(3,1),
      coalesce(p_trip ->> 'visibility', 'friends'),
      nullif(p_trip ->> 'companions', ''),
      nullif(trim(coalesce(p_trip ->> 'note', '')), ''),
      v_photos,
      (p_trip ->> 'would_return')::boolean
    )
    returning id into v_id;
  else
    update public.trips
    set trip_month = v_month,
        start_date = v_start,
        end_date = v_end,
        score = (p_trip ->> 'score')::numeric(3,1),
        visibility = coalesce(p_trip ->> 'visibility', 'friends'),
        companions = nullif(p_trip ->> 'companions', ''),
        note = nullif(trim(coalesce(p_trip ->> 'note', '')), ''),
        photo_paths = v_photos,
        would_return = (p_trip ->> 'would_return')::boolean
    where id = v_id;
    if not found then
      raise exception 'Trip not found' using errcode = 'no_data_found';
    end if;
    delete from public.trip_stops where trip_id = v_id;
    delete from public.stays where trip_id = v_id;
    delete from public.food_picks where trip_id = v_id;
    delete from public.top_tips where trip_id = v_id;
  end if;

  for v_stop in select * from jsonb_array_elements(p_trip -> 'stops') loop
    insert into public.trip_stops (trip_id, destination_id, position, nights)
    values (
      v_id,
      public.destination_id_for(v_stop ->> 'name', v_stop ->> 'country'),
      v_pos,
      case when v_pos = 0 and v_start is not null then (v_end - v_start)::smallint else nullif(v_stop ->> 'nights', '')::smallint end
    );
    v_pos := v_pos + 1;
  end loop;

  if jsonb_typeof(p_trip -> 'stay') = 'object' then
    insert into public.stays (trip_id, name, type, score, would_return)
    values (
      v_id,
      trim(p_trip -> 'stay' ->> 'name'),
      p_trip -> 'stay' ->> 'type',
      nullif(p_trip -> 'stay' ->> 'score', '')::numeric(3,1),
      (p_trip -> 'stay' ->> 'would_return')::boolean
    );
  end if;

  -- Restaurants, in order (or the older single "meal").
  if jsonb_typeof(p_trip -> 'restaurants') = 'array' then
    if jsonb_array_length(p_trip -> 'restaurants') > 10 then
      raise exception 'Up to 10 restaurants per trip, please.' using errcode = 'check_violation';
    end if;
    v_pos := 0;
    for v_name in select jsonb_array_elements_text(p_trip -> 'restaurants') loop
      v_text := nullif(trim(v_name), '');
      if v_text is not null then
        insert into public.food_picks (trip_id, name, position) values (v_id, v_text, v_pos);
        v_pos := v_pos + 1;
      end if;
    end loop;
  else
    v_text := nullif(trim(coalesce(p_trip ->> 'meal', '')), '');
    if v_text is not null then
      insert into public.food_picks (trip_id, name, position) values (v_id, v_text, 0);
    end if;
  end if;

  v_text := nullif(trim(coalesce(p_trip ->> 'tip', '')), '');
  if v_text is not null then
    insert into public.top_tips (trip_id, tip) values (v_id, v_text);
  end if;

  -- Friends you went with (only when sent, so older app versions leave tags as they were).
  if jsonb_typeof(p_trip -> 'with_people') = 'array' then
    perform public.set_trip_people(v_id, array(select (jsonb_array_elements_text(p_trip -> 'with_people'))::uuid));
  end if;

  return v_id;
end;
$$;

revoke execute on function public.save_trip(jsonb) from public, anon;
grant execute on function public.save_trip(jsonb) to authenticated;
