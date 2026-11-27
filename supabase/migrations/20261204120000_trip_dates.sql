-- Exact dates for a trip (owner, Nov 2026): "When did you go?" is a month and year, with an optional exact date
-- range. trips.start_date / end_date are both set or both empty (older trips and anyone who only picks a month).
-- Rules: the day you left is after the day you arrived, at most 365 nights, the month is the first day's month, and
-- (rule 6, no trip planning) never a date after today. save_trip() takes "start_date" and "end_date" ("YYYY-MM-DD")
-- and then works out the month and the main place's nights from them, so the three always agree. Older app versions
-- don't send them, so they stay empty. Read like the rest of a trip. Safe to run twice.

alter table public.trips add column if not exists start_date date;
alter table public.trips add column if not exists end_date date;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trips_dates_valid') then
    alter table public.trips add constraint trips_dates_valid check (
      (start_date is null and end_date is null)
      or (
        start_date is not null and end_date is not null
        and end_date > start_date
        and end_date - start_date <= 365
        and date_trunc('month', start_date)::date = trip_month
      )
    );
  end if;
end $$;

grant update (start_date, end_date) on public.trips to authenticated;

-- No future months (as before), and now no future days either.
create or replace function public.enforce_trip_month()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.trip_month > date_trunc('month', current_date)::date then
    raise exception 'That month is in the future. Trips are for holidays you are back from.'
      using errcode = 'check_violation';
  end if;
  if new.end_date is not null and new.end_date > current_date then
    raise exception 'Those dates are in the future. Trips are for holidays you are back from.'
      using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

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

  return v_id;
end;
$$;

revoke execute on function public.save_trip(jsonb) from public, anon;
grant execute on function public.save_trip(jsonb) to authenticated;
