-- Postcard · Step 1: profiles and age rules
-- Paste into Supabase: SQL Editor → New query → Run.
-- Safe to read: this creates two tables, their access rules and two automatic checks.
--
-- Rules (see CLAUDE.md, product rule 3):
--   * 13+ to join. Sign-up is refused without a date of birth showing 13 or over.
--   * 18+ to make a profile public. The database refuses it, whatever the app does.
--   * Date of birth is private to its owner and can't be changed after sign-up.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Public-facing profile. For now only the owner can read it; the Friends step widens this.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,30}$'),
  name text not null check (char_length(name) between 1 and 80),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

-- Private details. Only ever readable by their owner, never editable from the app.
create table public.profile_private (
  id uuid primary key references public.profiles (id) on delete cascade,
  date_of_birth date not null check (date_of_birth > date '1900-01-01')
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function public.age_in_years(dob date)
returns integer
language sql
stable
set search_path = ''
as $$
  select extract(year from age(current_date, dob))::integer
$$;

-- ---------------------------------------------------------------------------
-- Automatic check: public profiles are 18+ only
-- ---------------------------------------------------------------------------

create function public.enforce_public_profile_age()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  dob date;
begin
  if new.is_public then
    select p.date_of_birth into dob from public.profile_private p where p.id = new.id;
    if dob is null or public.age_in_years(dob) < 18 then
      raise exception 'Public profiles are for over-18s only'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_public_needs_18
  before insert or update of is_public on public.profiles
  for each row execute function public.enforce_public_profile_age();

-- ---------------------------------------------------------------------------
-- Automatic step: create the profile when someone signs up
-- The app sends name + date_of_birth with the sign-up request. Anyone without
-- a valid date of birth showing 13+ is refused, so the account isn't created.
-- (This also means users can't be added by hand in the Supabase dashboard
-- unless that metadata is included. That's deliberate.)
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := left(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 80);
  v_dob date;
  v_base text;
  v_handle text;
begin
  begin
    v_dob := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  exception when others then
    v_dob := null;
  end;

  if v_dob is null then
    raise exception 'A date of birth is needed to join Postcard';
  end if;
  if v_dob > current_date or public.age_in_years(v_dob) < 13 then
    raise exception 'You need to be 13 or over to join Postcard';
  end if;

  if v_name is null then
    v_name := split_part(new.email, '@', 1);
  end if;

  -- Handle: letters/numbers from the name plus four random digits, e.g. maya4821.
  v_base := translate(lower(v_name), 'àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ', 'aaaaaaaceeeeiiiinoooooouuuuyy');
  v_base := left(regexp_replace(v_base, '[^a-z0-9]+', '', 'g'), 20);
  if char_length(v_base) < 3 then
    v_base := 'traveller';
  end if;
  loop
    v_handle := v_base || (1000 + floor(random() * 9000))::integer;
    exit when not exists (select 1 from public.profiles where handle = v_handle);
  end loop;

  insert into public.profiles (id, handle, name) values (new.id, v_handle, v_name);
  insert into public.profile_private (id, date_of_birth) values (new.id, v_dob);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Access rules (Row Level Security)
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;

create policy "People can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "People can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "People can read their own private details"
  on public.profile_private for select to authenticated
  using ((select auth.uid()) = id);

-- Belt and braces on top of the rules above: signed-out visitors get nothing,
-- rows are only created by the sign-up step, and only name / is_public can be edited.
revoke all on public.profiles, public.profile_private from anon;
revoke all on public.profiles, public.profile_private from authenticated;
grant select on public.profiles, public.profile_private to authenticated;
grant update (name, is_public) on public.profiles to authenticated;

revoke execute on function public.enforce_public_profile_age() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
