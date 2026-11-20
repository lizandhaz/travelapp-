-- Trip details: decimal scores, who you went with, a note and a photo
-- Paste into Supabase: SQL Editor → New query → Run. Run it once.
-- Needs 20261118120000_trips.sql to have been run first.
--
-- What this changes:
--   * Scores (trip and stay) get one decimal place, still 1.0–10.0.
--     Existing scores keep their value (8 becomes 8.0).
--   * Each trip can say who you went with (Solo, Partner, Friends, Family),
--     have a short note (up to 500 characters) and one photo.
--   * A private photo store ("trip-photos"): each person's photos sit in a
--     folder named after their account, and only they can see, add, change
--     or delete them. (Friends get to see photos in a later step.)

alter table public.trips
  alter column score type numeric(3,1) using score::numeric(3,1);

alter table public.stays
  alter column score type numeric(3,1) using score::numeric(3,1);

-- The old checks (score between 1 and 10) still apply to the new type.

-- ---------------------------------------------------------------------------
-- Who you went with, a note, a photo
-- ---------------------------------------------------------------------------

alter table public.trips
  add column companions text check (companions in ('solo', 'partner', 'friends', 'family')),
  add column note text check (char_length(note) between 1 and 500),
  -- Path of the photo in the trip-photos store: always inside the owner's own folder.
  add column photo_path text check (photo_path is null or photo_path like owner_id::text || '/%');

-- Let people change these on their own trips (row rules still limit it to their trips).
grant update (companions, note, photo_path) on public.trips to authenticated;

-- save_trip(): same as before, plus decimal scores, who you went with, note and photo.
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

  if v_id is null then
    insert into public.trips (trip_month, score, visibility, companions, note, photo_path)
    values (
      v_month,
      (p_trip ->> 'score')::numeric(3,1),
      coalesce(p_trip ->> 'visibility', 'friends'),
      nullif(p_trip ->> 'companions', ''),
      nullif(trim(coalesce(p_trip ->> 'note', '')), ''),
      nullif(p_trip ->> 'photo_path', '')
    )
    returning id into v_id;
  else
    update public.trips
    set trip_month = v_month,
        score = (p_trip ->> 'score')::numeric(3,1),
        visibility = coalesce(p_trip ->> 'visibility', 'friends'),
        companions = nullif(p_trip ->> 'companions', ''),
        note = nullif(trim(coalesce(p_trip ->> 'note', '')), ''),
        photo_path = nullif(p_trip ->> 'photo_path', '')
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
-- Private photo store
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-photos', 'trip-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

-- Photos live at "<your account id>/<photo name>.jpg". These rules let people
-- use only their own folder.
create policy "People see their own trip photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "People add their own trip photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "People change their own trip photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "People delete their own trip photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'trip-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
