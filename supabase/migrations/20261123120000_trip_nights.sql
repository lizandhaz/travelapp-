-- "How long did you stay?" is now required: the main place on a trip (position 0)
-- must have its number of nights (1–365). Trips saved before this keep working
-- (NOT VALID skips existing rows); new and edited trips need it.
-- Safe to run twice.

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'main_stop_has_nights' and conrelid = 'public.trip_stops'::regclass
  ) then
    alter table public.trip_stops
      add constraint main_stop_has_nights check (position <> 0 or nights is not null) not valid;
  end if;
end;
$$;
