-- Step 2: trips (saving a real trip)
-- Paste into Supabase: SQL Editor → New query → Run. Run it once.
-- Needs 20261110120000_profiles.sql to have been run first.
--
-- What this creates:
--   destinations  shared list of places (seeded with a starting list)
--   trips         one row per trip: month, overall score 1–10, who can see it
--   trip_stops    the places on a trip, in order, with optional nights
--   stays         where you stayed: name, type, its own score 1–10
--   food_picks    best meal
--   top_tips      top tip
--   save_trip()   saves a whole trip (new or edited) in one go
--
-- Rules:
--   * Only the owner can read, edit or delete their trips (Friends come later).
--   * Scores are whole numbers 1–10. Nights are 1–365.
--   * The trip month is the 1st of a month, and never in the future.
--   * Places typed in by someone are only visible to that person (plus the
--     starting list, which everyone can see), so private place names never leak.

-- ---------------------------------------------------------------------------
-- Destinations
-- ---------------------------------------------------------------------------

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  country text not null default '' check (char_length(country) <= 60),
  -- null = part of the starting list (visible to everyone)
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index destinations_name_country_key
  on public.destinations (lower(name), lower(country));

insert into public.destinations (name, country) values
  ('Lisbon', 'Portugal'),
  ('Puglia', 'Italy'),
  ('Kyoto', 'Japan'),
  ('St Ives', 'England'),
  ('Deià, Mallorca', 'Spain'),
  ('Marrakech', 'Morocco'),
  ('Isle of Skye', 'Scotland'),
  ('Mexico City', 'Mexico'),
  ('Copenhagen', 'Denmark'),
  ('Chania, Crete', 'Greece');

-- ---------------------------------------------------------------------------
-- Trips and their details
-- ---------------------------------------------------------------------------

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trip_month date not null
    check (extract(day from trip_month) = 1 and trip_month >= date '1950-01-01'),
  score smallint not null check (score between 1 and 10),
  visibility text not null default 'friends' check (visibility in ('friends', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index trips_owner_score_idx on public.trips (owner_id, score desc, trip_month desc);

create table public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  destination_id uuid not null references public.destinations (id),
  position smallint not null check (position between 0 and 9), -- 0 = main place
  nights smallint check (nights between 1 and 365),
  unique (trip_id, position)
);

create table public.stays (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (type in ('Hotel', 'Airbnb', 'Villa', 'B&B', 'Other')),
  score smallint not null check (score between 1 and 10)
);

create table public.food_picks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120)
);

create table public.top_tips (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  tip text not null check (char_length(tip) between 1 and 280)
);

create index trip_stops_trip_idx on public.trip_stops (trip_id);
create index trip_stops_destination_idx on public.trip_stops (destination_id);
create index stays_trip_idx on public.stays (trip_id);
create index food_picks_trip_idx on public.food_picks (trip_id);
create index top_tips_trip_idx on public.top_tips (trip_id);

-- ---------------------------------------------------------------------------
-- Automatic check: no future months (post when home, never live)
-- ---------------------------------------------------------------------------

create function public.enforce_trip_month()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.trip_month > date_trunc('month', current_date)::date then
    raise exception 'That month is in the future. Trips are for holidays you are back from.'
      using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger trips_month_not_future
  before insert or update on public.trips
  for each row execute function public.enforce_trip_month();

-- ---------------------------------------------------------------------------
-- Access rules (Row Level Security)
-- ---------------------------------------------------------------------------

alter table public.destinations enable row level security;
alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.stays enable row level security;
alter table public.food_picks enable row level security;
alter table public.top_tips enable row level security;

-- Trips: owner only, for everything.
create policy "Owners manage their own trips"
  on public.trips for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Details: allowed when the parent trip is yours.
create policy "Owners manage their trip stops"
  on public.trip_stops for all to authenticated
  using (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())));

create policy "Owners manage their stays"
  on public.stays for all to authenticated
  using (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())));

create policy "Owners manage their food picks"
  on public.food_picks for all to authenticated
  using (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())));

create policy "Owners manage their top tips"
  on public.top_tips for all to authenticated
  using (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.trips t where t.id = trip_id and t.owner_id = (select auth.uid())));

-- Destinations: the starting list, places you added, and places on your trips.
create policy "People see the starting list and their own places"
  on public.destinations for select to authenticated
  using (
    created_by is null
    or created_by = (select auth.uid())
    or exists (
      select 1
      from public.trip_stops s
      join public.trips t on t.id = s.trip_id
      where s.destination_id = destinations.id and t.owner_id = (select auth.uid())
    )
  );

revoke all on public.destinations, public.trips, public.trip_stops, public.stays,
  public.food_picks, public.top_tips from anon;
revoke all on public.destinations, public.trips, public.trip_stops, public.stays,
  public.food_picks, public.top_tips from authenticated;
-- Destinations are only added through destination_id_for() below.
grant select on public.destinations to authenticated;
grant select, insert, update, delete on public.trips, public.trip_stops, public.stays,
  public.food_picks, public.top_tips to authenticated;
-- Nobody can move a trip to another owner.
revoke update on public.trips from authenticated;
grant update (trip_month, score, visibility) on public.trips to authenticated;

-- ---------------------------------------------------------------------------
-- Find or add a place (tidies spaces; "lisbon" and "Lisbon" are the same place)
-- ---------------------------------------------------------------------------

create function public.destination_id_for(p_name text, p_country text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  v_country text := regexp_replace(trim(coalesce(p_country, '')), '\s+', ' ', 'g');
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Please log in first';
  end if;
  if v_name = '' then
    raise exception 'Where did you go?' using errcode = 'check_violation';
  end if;

  select d.id into v_id from public.destinations d
  where lower(d.name) = lower(v_name) and lower(d.country) = lower(v_country);
  if v_id is not null then
    return v_id;
  end if;

  insert into public.destinations (name, country, created_by)
  values (v_name, v_country, auth.uid())
  on conflict (lower(name), lower(country)) do nothing
  returning id into v_id;

  if v_id is null then -- someone added the same place a moment ago
    select d.id into v_id from public.destinations d
    where lower(d.name) = lower(v_name) and lower(d.country) = lower(v_country);
  end if;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Save a whole trip in one go (new trip, or edit with "id")
--
-- p_trip looks like:
-- {
--   "id": null | "<trip id to edit>",
--   "month": "2026-09",
--   "score": 9,
--   "visibility": "friends" | "private",
--   "stops": [ {"name": "Lisbon", "country": "Portugal", "nights": null},
--              {"name": "Sintra", "country": "Portugal", "nights": 2} ],
--   "stay": null | {"name": "Casa Azul", "type": "Airbnb", "score": 8},
--   "meal": null | "Pastéis at Manteigaria",
--   "tip":  null | "Get a Viva Viagem card"
-- }
-- Runs with the caller's own permissions, so all the rules above still apply.
-- ---------------------------------------------------------------------------

create function public.save_trip(p_trip jsonb)
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
    insert into public.trips (trip_month, score, visibility)
    values (v_month, (p_trip ->> 'score')::smallint, coalesce(p_trip ->> 'visibility', 'friends'))
    returning id into v_id;
  else
    update public.trips
    set trip_month = v_month,
        score = (p_trip ->> 'score')::smallint,
        visibility = coalesce(p_trip ->> 'visibility', 'friends')
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
      (p_trip -> 'stay' ->> 'score')::smallint
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

revoke execute on function public.destination_id_for(text, text) from public, anon;
revoke execute on function public.save_trip(jsonb) from public, anon;
revoke execute on function public.enforce_trip_month() from public, anon, authenticated;
grant execute on function public.destination_id_for(text, text) to authenticated;
grant execute on function public.save_trip(jsonb) to authenticated;
