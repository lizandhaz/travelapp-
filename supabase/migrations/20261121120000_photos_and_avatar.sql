-- More photos per trip, and a profile picture
-- Paste into Supabase: SQL Editor → New query → Run. Run it once.
-- Needs 20261120120000_trip_details.sql to have been run first.
--
-- What this changes:
--   * A trip can have up to 6 photos (the first is the cover). Any photo a
--     trip already has is kept and becomes its first photo.
--   * Your profile can have a picture. Like trip photos, it's stored in your
--     own private folder in the "trip-photos" store.
--
-- Safe to run more than once (it skips what's already done), because some
-- people pasted it by hand before updates became automatic.

-- ---------------------------------------------------------------------------
-- Up to 6 photos per trip
-- ---------------------------------------------------------------------------

-- True when every photo path is inside the owner's own folder.
create or replace function public.paths_in_own_folder(paths text[], owner uuid)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(bool_and(p like owner::text || '/%'), true) from unnest(paths) as p
$$;

alter table public.trips
  add column if not exists photo_paths text[] not null default '{}'
    check (cardinality(photo_paths) <= 6 and public.paths_in_own_folder(photo_paths, owner_id));

-- Move each trip's single photo (if the old column is still there) into the list.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'trips' and column_name = 'photo_path'
  ) then
    update public.trips set photo_paths = array[photo_path] where photo_path is not null and photo_paths = '{}';
  end if;
end;
$$;

alter table public.trips drop column if exists photo_path;

grant update (photo_paths) on public.trips to authenticated;

-- save_trip(): same as before, but takes a list of photos ("photo_paths").
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
    insert into public.trips (trip_month, score, visibility, companions, note, photo_paths)
    values (
      v_month,
      (p_trip ->> 'score')::numeric(3,1),
      coalesce(p_trip ->> 'visibility', 'friends'),
      nullif(p_trip ->> 'companions', ''),
      nullif(trim(coalesce(p_trip ->> 'note', '')), ''),
      v_photos
    )
    returning id into v_id;
  else
    update public.trips
    set trip_month = v_month,
        score = (p_trip ->> 'score')::numeric(3,1),
        visibility = coalesce(p_trip ->> 'visibility', 'friends'),
        companions = nullif(p_trip ->> 'companions', ''),
        note = nullif(trim(coalesce(p_trip ->> 'note', '')), ''),
        photo_paths = v_photos
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
      nullif(v_stop ->> 'nights', '')::smallint
    );
    v_pos := v_pos + 1;
  end loop;

  if jsonb_typeof(p_trip -> 'stay') = 'object' then
    insert into public.stays (trip_id, name, type, score)
    values (
      v_id,
      trim(p_trip -> 'stay' ->> 'name'),
      p_trip -> 'stay' ->> 'type',
      (p_trip -> 'stay' ->> 'score')::numeric(3,1)
    );
  end if;

  v_text := nullif(trim(coalesce(p_trip ->> 'meal', '')), '');
  if v_text is not null then
    insert into public.food_picks (trip_id, name) values (v_id, v_text);
  end if;

  v_text := nullif(trim(coalesce(p_trip ->> 'tip', '')), '');
  if v_text is not null then
    insert into public.top_tips (trip_id, tip) values (v_id, v_text);
  end if;

  return v_id;
end;
$$;

revoke execute on function public.save_trip(jsonb) from public, anon;
grant execute on function public.save_trip(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Profile picture
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists avatar_path text check (avatar_path is null or avatar_path like id::text || '/%');

grant update (avatar_path) on public.profiles to authenticated;
