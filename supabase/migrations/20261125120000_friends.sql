-- Friends: finding other people and adding each other as friends (plan Step C, first half).
-- Seeing friends' trips and lists comes next.
--
-- A friendship starts as a request (pending) and becomes a friendship when the other
-- person accepts it. Either person can remove it (cancel a request, decline one, or unfriend).
--
-- Rule 3 (ages): 13–17s never appear in search for people who aren't already their friends,
-- and nobody can send them a request out of the blue. They can send requests themselves.
--
-- Safe to run twice.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);

-- One friendship per pair of people, whichever way round it started.
create unique index if not exists friendships_one_per_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_addressee on public.friendships (addressee_id);

alter table public.friendships enable row level security;

drop policy if exists "People see their own friendships" on public.friendships;
create policy "People see their own friendships"
  on public.friendships for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

drop policy if exists "Either person can remove a friendship" on public.friendships;
create policy "Either person can remove a friendship"
  on public.friendships for delete to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

revoke all on public.friendships from anon;
revoke all on public.friendships from authenticated;
-- Reading and removing directly; sending and accepting only through the functions below.
grant select, delete on public.friendships to authenticated;

-- Is this person 18 or over? (Date of birth stays private; only the yes/no is used.)
create or replace function public.is_adult(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select date_of_birth <= (current_date - interval '18 years')::date
                   from public.profile_private where id = p_user), false);
$$;
revoke execute on function public.is_adult(uuid) from public, anon, authenticated;

-- Are these two people friends (accepted)?
create or replace function public.are_friends(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and least(requester_id, addressee_id) = least(p_a, p_b)
      and greatest(requester_id, addressee_id) = greatest(p_a, p_b)
  );
$$;
revoke execute on function public.are_friends(uuid, uuid) from public, anon, authenticated;

-- Finds people by name or @handle. Leaves out yourself, and under-18s who aren't already
-- your friends. Says where you stand with each person: friends, sent (your request is
-- waiting), received (they've asked you) or none.
create or replace function public.search_people(p_query text)
returns table (id uuid, handle text, name text, status text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_q text := lower(btrim(regexp_replace(coalesce(p_query, ''), '^\s*@', '')));
  v_like text;
begin
  if v_user is null then
    raise exception 'Not signed in';
  end if;
  if char_length(v_q) < 2 then
    return;
  end if;
  v_like := replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_');
  return query
    select p.id, p.handle, p.name,
           case
             when f.status = 'accepted' then 'friends'
             when f.requester_id = v_user then 'sent'
             when f.addressee_id = v_user then 'received'
             else 'none'
           end
    from public.profiles p
    left join public.friendships f
      on least(f.requester_id, f.addressee_id) = least(p.id, v_user)
     and greatest(f.requester_id, f.addressee_id) = greatest(p.id, v_user)
    where p.id <> v_user
      and (lower(p.name) like '%' || v_like || '%' or p.handle like v_like || '%')
      and (public.is_adult(p.id) or f.status = 'accepted')
    order by (p.handle = v_q) desc, (f.status = 'accepted') desc nulls last, lower(p.name)
    limit 25;
end;
$$;
revoke execute on function public.search_people(text) from public, anon;
grant execute on function public.search_people(text) to authenticated;

-- Your friends and requests, with each person's name and handle.
create or replace function public.my_friendships()
returns table (friendship_id uuid, user_id uuid, handle text, name text, status text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select f.id, p.id, p.handle, p.name,
         case when f.status = 'accepted' then 'friends' when f.requester_id = auth.uid() then 'sent' else 'received' end,
         f.created_at
  from public.friendships f
  join public.profiles p on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
  where auth.uid() in (f.requester_id, f.addressee_id)
  order by f.created_at desc;
$$;
revoke execute on function public.my_friendships() from public, anon;
grant execute on function public.my_friendships() to authenticated;

-- Sends a friend request (or, if they've already asked you, accepts theirs).
-- Returns 'sent', 'friends' or 'already'.
create or replace function public.send_friend_request(p_user uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_existing public.friendships;
begin
  if v_user is null then
    raise exception 'Not signed in';
  end if;
  if p_user is null or p_user = v_user then
    raise exception 'You can''t add yourself';
  end if;
  if not exists (select 1 from public.profiles where id = p_user) then
    raise exception 'That person isn''t on the app';
  end if;

  select * into v_existing from public.friendships
  where least(requester_id, addressee_id) = least(v_user, p_user)
    and greatest(requester_id, addressee_id) = greatest(v_user, p_user);

  if found then
    if v_existing.status = 'pending' and v_existing.addressee_id = v_user then
      update public.friendships set status = 'accepted', responded_at = now() where id = v_existing.id;
      return 'friends';
    end if;
    return 'already';
  end if;

  -- Rule 3: under-18s can't be sent requests by people who found them some other way.
  if not public.is_adult(p_user) then
    raise exception 'You can''t add this person';
  end if;
  if (select count(*) from public.friendships where requester_id = v_user and status = 'pending') >= 200 then
    raise exception 'Too many requests waiting. Try again once some are answered.';
  end if;

  insert into public.friendships (requester_id, addressee_id) values (v_user, p_user);
  return 'sent';
end;
$$;
revoke execute on function public.send_friend_request(uuid) from public, anon;
grant execute on function public.send_friend_request(uuid) to authenticated;

-- Accepts a request someone sent you (to decline, delete the row).
create or replace function public.accept_friend_request(p_friendship uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  update public.friendships set status = 'accepted', responded_at = now()
  where id = p_friendship and addressee_id = auth.uid() and status = 'pending';
  if not found then
    raise exception 'That request isn''t there any more';
  end if;
end;
$$;
revoke execute on function public.accept_friend_request(uuid) from public, anon;
grant execute on function public.accept_friend_request(uuid) to authenticated;
