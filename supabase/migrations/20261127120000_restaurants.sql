-- Best restaurants (owner, Nov 2026): a trip can have several restaurants, in order, instead of
-- one "best meal". They're kept in food_picks (one row each) with a position.
-- save_trip() now takes "restaurants": ["Taberna Real", "Café Saudade"] (up to 10). It still
-- accepts the older "meal" (one name) when "restaurants" isn't sent, so older app versions keep working.
-- Safe to run twice.

alter table public.food_picks add column if not exists position smallint not null default 0;

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
