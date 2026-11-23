-- The website's waitlist (owner, Nov 2026): people leave their email to hear when the app opens.
-- Anyone (signed in or not) can add an email, only through join_waitlist(); nobody can read, change
-- or delete the list through the app or website. The owner reads it in the Supabase dashboard
-- (Table Editor → waitlist), which isn't limited by these rules. Safe to run twice.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 6 and 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  source text not null default 'website' check (char_length(source) <= 40),
  created_at timestamptz not null default now()
);
-- One entry per address, ignoring capitals and spaces.
create unique index if not exists waitlist_email_once on public.waitlist (lower(btrim(email)));

alter table public.waitlist enable row level security;
revoke all on public.waitlist from public, anon, authenticated;
-- No policies on purpose: with RLS on and no grants, the table can't be read or written directly.

-- Adds an email to the waitlist. Signing up twice is fine (nothing changes). Returns true.
create or replace function public.join_waitlist(p_email text, p_source text default 'website')
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_source text := left(coalesce(nullif(btrim(p_source), ''), 'website'), 40);
begin
  if char_length(v_email) not between 6 and 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then
    raise exception 'Please enter a full email address, like you@example.com.' using errcode = 'check_violation';
  end if;
  -- A light brake on abuse: at most 30 new sign-ups a minute across the whole list.
  if (select count(*) from public.waitlist where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'Lots of people are joining right now. Please try again in a minute.' using errcode = 'check_violation';
  end if;
  insert into public.waitlist (email, source) values (v_email, v_source)
  on conflict ((lower(btrim(email)))) do nothing;
  return true;
end;
$$;
revoke execute on function public.join_waitlist(text, text) from public;
grant execute on function public.join_waitlist(text, text) to anon, authenticated;
