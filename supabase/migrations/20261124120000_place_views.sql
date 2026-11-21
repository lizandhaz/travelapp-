-- Place pages you've looked at, so your matches can learn from what you browse.
-- One row per person per place: how many times, for how long in total, first and
-- last time. Private to its owner (nobody else, friends included, can read it).
-- People can switch this off and clear it in Settings.
-- Safe to run twice.

create table if not exists public.place_views (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The sample place page ("madeira"); real place pages come in plan Step E.
  place_slug text not null check (place_slug ~ '^[a-z0-9-]{1,60}$'),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  country text not null default '' check (char_length(country) <= 60),
  views integer not null default 1 check (views between 1 and 100000),
  seconds integer not null default 0 check (seconds between 0 and 10000000),
  first_viewed_at timestamptz not null default now(),
  last_viewed_at timestamptz not null default now(),
  primary key (owner_id, place_slug)
);

alter table public.place_views enable row level security;

drop policy if exists "Owners see and clear their own views" on public.place_views;
create policy "Owners see and clear their own views"
  on public.place_views for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

revoke all on public.place_views from anon;
revoke all on public.place_views from authenticated;
-- Reading and clearing directly; recording only through record_place_view() below.
grant select, delete on public.place_views to authenticated;

-- Records one visit to a place page: adds a view and the seconds spent (at most 10
-- minutes per visit, so a phone left open doesn't count for hours).
-- Runs as the database owner (people can't write the table directly), but only ever
-- for the signed-in person's own row (auth.uid()), and only adds a view.
create or replace function public.record_place_view(p_slug text, p_name text, p_country text, p_seconds integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_seconds integer := least(greatest(coalesce(p_seconds, 0), 0), 600);
begin
  if v_user is null then
    raise exception 'Not signed in';
  end if;
  insert into public.place_views (owner_id, place_slug, name, country, views, seconds)
  values (v_user, p_slug, btrim(p_name), btrim(coalesce(p_country, '')), 1, v_seconds)
  on conflict (owner_id, place_slug) do update
    set views = least(public.place_views.views + 1, 100000),
        seconds = least(public.place_views.seconds + v_seconds, 10000000),
        name = excluded.name,
        country = excluded.country,
        last_viewed_at = now();
end;
$$;

revoke execute on function public.record_place_view(text, text, text, integer) from public, anon;
grant execute on function public.record_place_view(text, text, text, integer) to authenticated;
