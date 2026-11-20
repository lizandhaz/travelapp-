-- Saved lists ("boards"): your "Want to go" list plus lists you make yourself,
-- each holding places. Owner-only for now; friends get read access to lists
-- marked "friends" when friends arrive (plan Step C).
-- Safe to run twice.

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  -- 'wish' is your one "Want to go" list; 'list' is any list you make.
  kind text not null default 'list' check (kind in ('list', 'wish')),
  visibility text not null default 'private' check (visibility in ('friends', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists boards_one_wish_list on public.boards (owner_id) where kind = 'wish';
create index if not exists boards_owner on public.boards (owner_id, updated_at desc);

create table if not exists public.board_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- A sample place page this came from ("madeira"), if any.
  place_slug text check (place_slug is null or place_slug ~ '^[a-z0-9-]{1,60}$'),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  country text not null default '' check (char_length(country) <= 60),
  created_at timestamptz not null default now()
);

create unique index if not exists board_items_once on public.board_items (board_id, lower(btrim(name)), lower(btrim(country)));
create index if not exists board_items_board on public.board_items (board_id, created_at desc);

-- Limits, so nobody can fill the database: 50 lists each, 300 places a list.
create or replace function public.enforce_board_limits()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'boards' then
    if (select count(*) from public.boards where owner_id = new.owner_id) >= 50 then
      raise exception 'You can have up to 50 lists.';
    end if;
  else
    if (select count(*) from public.board_items where board_id = new.board_id) >= 300 then
      raise exception 'A list can hold up to 300 places.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists boards_limit on public.boards;
create trigger boards_limit before insert on public.boards
  for each row execute function public.enforce_board_limits();
drop trigger if exists board_items_limit on public.board_items;
create trigger board_items_limit before insert on public.board_items
  for each row execute function public.enforce_board_limits();

-- Keep a list's updated_at fresh when it's renamed or a place is added or removed,
-- so the most recently changed lists come first.
create or replace function public.touch_board()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Runs as the database owner because people can't edit updated_at directly.
-- It only ever sets the time on the list the place belongs to.
create or replace function public.touch_board_from_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.boards set updated_at = now() where id = coalesce(new.board_id, old.board_id);
  return null;
end;
$$;

drop trigger if exists boards_touch on public.boards;
create trigger boards_touch before update on public.boards
  for each row execute function public.touch_board();
drop trigger if exists board_items_touch on public.board_items;
create trigger board_items_touch after insert or delete on public.board_items
  for each row execute function public.touch_board_from_item();

alter table public.boards enable row level security;
alter table public.board_items enable row level security;

drop policy if exists "Owners manage their own lists" on public.boards;
create policy "Owners manage their own lists"
  on public.boards for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners manage places on their own lists" on public.board_items;
create policy "Owners manage places on their own lists"
  on public.board_items for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and exists (select 1 from public.boards b where b.id = board_id and b.owner_id = (select auth.uid()))
  );

revoke all on public.boards, public.board_items from anon;
revoke all on public.boards, public.board_items from authenticated;
grant select, insert, delete on public.boards, public.board_items to authenticated;
-- Lists can be renamed and shared or made private, but never moved to someone else.
grant update (name, visibility) on public.boards to authenticated;

revoke execute on function public.enforce_board_limits() from public, anon, authenticated;
revoke execute on function public.touch_board() from public, anon, authenticated;
revoke execute on function public.touch_board_from_item() from public, anon, authenticated;
